const { chromium } = require('playwright');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// 配置
const EXCEL_PATH = '/Users/cuichengdan/Downloads/抖音自播_UE_20260317_04.xlsx';
const POPO_URL = 'https://docs.popo.netease.com/lingxi/d052254b77ae4a618f99941eefde5719?appVersion=4.27.0&deviceType=4&popo_hidenativebar=1&popo_noindicator=1&disposable_login_token=1';
const COOKIES_FILE = path.join(__dirname, 'popo_cookies.json');

/**
 * 从 Excel 读取数据
 */
function readExcelData() {
    console.log('📖 正在读取 Excel 文件...');
    const workbook = XLSX.readFile(EXCEL_PATH);

    const data = {};

    // Sheet 1: 排退后GMV
    const sheet1 = workbook.Sheets['1-截面UE结果支付-发起退款-排退后GMV'];
    const json1 = XLSX.utils.sheet_to_json(sheet1, { header: 1 });
    data.gmv = extractValue(json1, '排退后GMV');

    // Sheet 3: BOM成本
    const sheet3 = workbook.Sheets['3-截面UE结果支付-发起退款-BOM成本'];
    const json3 = XLSX.utils.sheet_to_json(sheet3, { header: 1 });
    data.bomCost = extractValue(json3, 'BOM成本');

    console.log('✅ Excel 数据读取完成:');
    console.log(`  - 排退后GMV: ${data.gmv}`);
    console.log(`  - BOM成本: ${data.bomCost}`);

    return data;
}

function extractValue(sheetData, fieldName) {
    for (let i = 0; i < Math.min(10, sheetData.length); i++) {
        const row = sheetData[i];
        const colIndex = row.indexOf(fieldName);
        if (colIndex !== -1 && i + 1 < sheetData.length) {
            const value = sheetData[i + 1][colIndex];
            return parseFloat(value) || 0;
        }
    }
    return 0;
}

function calculateValues(rawData) {
    const values = {
        salesWithTax: rawData.gmv,
        siIncomeNoTax: rawData.gmv / 1.13,
        bomCostWithTax: rawData.bomCost,
        bomCostNoTax: rawData.bomCost / 1.13
    };

    console.log('\n💡 计算结果:');
    console.log(`  1. 销售额（含税）: ${values.salesWithTax.toFixed(2)}`);
    console.log(`  2. SI收入（未税）: ${values.siIncomeNoTax.toFixed(2)}`);
    console.log(`  3. Bom成本（含税）: ${values.bomCostWithTax.toFixed(2)}`);
    console.log(`  4. Bom成本（未税）: ${values.bomCostNoTax.toFixed(2)}`);

    return values;
}

async function saveCookies(context) {
    const cookies = await context.cookies();
    fs.writeFileSync(COOKIES_FILE, JSON.stringify(cookies, null, 2));
    console.log('✅ 登录状态已保存');
}

async function loadCookies(context) {
    if (fs.existsSync(COOKIES_FILE)) {
        const cookies = JSON.parse(fs.readFileSync(COOKIES_FILE, 'utf-8'));
        await context.addCookies(cookies);
        console.log('✅ 登录状态已加载');
        return true;
    }
    return false;
}

async function waitForLogin(page) {
    console.log('\n⚠️  请在浏览器中完成登录...');
    console.log('   登录完成后，脚本会自动继续');
    await page.waitForFunction(() => {
        return !window.location.href.includes('/login');
    }, { timeout: 120000 });
    console.log('✅ 登录成功！');
}

/**
 * 填写 POPO 文档 - 改进版
 */
async function fillPopoDocument(page, values) {
    console.log('\n📝 正在定位文档表格...');
    await page.waitForTimeout(3000);

    // 关闭引导弹窗
    try {
        const closeBtn = await page.$('button:has-text("下一步")');
        if (closeBtn) {
            await closeBtn.click();
            await page.waitForTimeout(1000);
        }
    } catch (e) {}

    await page.screenshot({ path: 'popo_before_fill.png', fullPage: true });
    console.log('📸 填写前截图已保存');

    // 定义要填写的字段
    const fieldsToFill = [
        { label: '销售额（含税）', value: values.salesWithTax },
        { label: 'SI收入（未税）', value: values.siIncomeNoTax },
        { label: 'Bom成本（含税）', value: values.bomCostWithTax },
        { label: 'Bom成本（未税）', value: values.bomCostNoTax }
    ];

    console.log('\n🔍 开始智能定位和填写...\n');

    let successCount = 0;

    for (const field of fieldsToFill) {
        try {
            console.log(`📍 处理: ${field.label}`);

            // 在页面中搜索包含标签文本的元素
            const found = await page.evaluate(({ labelText, valueToFill }) => {
                // 查找所有包含标签文本的元素
                const allElements = Array.from(document.querySelectorAll('*'));
                let labelElement = null;

                for (const el of allElements) {
                    const text = el.textContent || '';
                    if (text.trim() === labelText || text.includes(labelText)) {
                        // 确保不是输入框本身
                        if (!el.isContentEditable && el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') {
                            labelElement = el;
                            break;
                        }
                    }
                }

                if (!labelElement) {
                    return { success: false, reason: '未找到标签' };
                }

                // 在标签附近查找可编辑元素
                const searchInElement = (element) => {
                    // 检查所有子元素
                    const editables = element.querySelectorAll('[contenteditable="true"], input, textarea');
                    if (editables.length > 0) {
                        return editables[0];
                    }

                    // 检查兄弟元素
                    let sibling = element.nextElementSibling;
                    while (sibling) {
                        if (sibling.isContentEditable || sibling.tagName === 'INPUT' || sibling.tagName === 'TEXTAREA') {
                            return sibling;
                        }
                        const childEditables = sibling.querySelectorAll('[contenteditable="true"], input, textarea');
                        if (childEditables.length > 0) {
                            return childEditables[0];
                        }
                        sibling = sibling.nextElementSibling;
                    }

                    // 检查父元素的下一个兄弟
                    let parent = element.parentElement;
                    if (parent) {
                        let parentSibling = parent.nextElementSibling;
                        if (parentSibling) {
                            const editablesInParentSibling = parentSibling.querySelectorAll('[contenteditable="true"], input, textarea');
                            if (editablesInParentSibling.length > 0) {
                                return editablesInParentSibling[0];
                            }
                        }
                    }

                    return null;
                };

                const inputElement = searchInElement(labelElement);

                if (!inputElement) {
                    return { success: false, reason: '未找到输入框' };
                }

                // 填写值
                try {
                    if (inputElement.isContentEditable) {
                        inputElement.focus();
                        inputElement.textContent = valueToFill;
                        // 触发 input 事件
                        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
                        inputElement.dispatchEvent(new Event('change', { bubbles: true }));
                    } else {
                        inputElement.value = valueToFill;
                        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
                        inputElement.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    return { success: true };
                } catch (fillError) {
                    return { success: false, reason: '填写失败: ' + fillError.message };
                }

            }, { labelText: field.label, valueToFill: field.value.toFixed(2) });

            if (found.success) {
                console.log(`  ✅ ${field.label} = ${field.value.toFixed(2)}`);
                successCount++;
            } else {
                console.log(`  ⚠️  ${field.label} 失败: ${found.reason}`);
            }

            await page.waitForTimeout(500);

        } catch (error) {
            console.log(`  ❌ ${field.label} 异常: ${error.message}`);
        }
    }

    await page.screenshot({ path: 'popo_after_fill.png', fullPage: true });
    console.log('\n📸 填写后截图已保存: popo_after_fill.png');
    console.log(`✅ 成功填写 ${successCount}/${fieldsToFill.length} 个字段\n`);

    return successCount > 0;
}

/**
 * 主函数
 */
async function main() {
    console.log('🚀 POPO 文档自动填写工具 v2\n');

    // 1. 读取并计算数据
    const rawData = readExcelData();
    const values = calculateValues(rawData);

    // 2. 启动浏览器
    console.log('\n🌐 启动浏览器...');
    const browser = await chromium.launch({
        headless: false,
        slowMo: 100
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });

    // 3. 加载登录状态
    const hasLoginState = await loadCookies(context);
    const page = await context.newPage();

    // 4. 打开文档
    console.log('📄 打开 POPO 文档...');
    await page.goto(POPO_URL);
    await page.waitForTimeout(2000);

    // 5. 检查是否需要登录
    const currentUrl = page.url();
    if (currentUrl.includes('/login') || !hasLoginState) {
        await waitForLogin(page);
        await saveCookies(context);
    } else {
        console.log('✅ 已使用保存的登录状态');
    }

    // 6. 填写文档
    const success = await fillPopoDocument(page, values);

    if (success) {
        console.log('🎉 自动填写完成！请在浏览器中检查结果');
    } else {
        console.log('⚠️  自动填写遇到问题，请查看截图');
    }

    console.log('   按 Ctrl+C 关闭浏览器');
    await new Promise(() => {});
}

main().catch(error => {
    console.error('❌ 错误:', error);
    process.exit(1);
});
