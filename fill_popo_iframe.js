const { chromium } = require('playwright');
const XLSX = require('xlsx');
const fs = require('fs');

const EXCEL_PATH = '/Users/cuichengdan/Downloads/抖音自播_UE_20260317_04.xlsx';
const POPO_URL = 'https://docs.popo.netease.com/lingxi/d052254b77ae4a618f99941eefde5719?appVersion=4.27.0&deviceType=4&popo_hidenativebar=1&popo_noindicator=1&disposable_login_token=1';
const COOKIES_FILE = './popo_cookies.json';

// 读取 Excel 数据
function readExcelData() {
    console.log('📖 读取 Excel...');
    const workbook = XLSX.readFile(EXCEL_PATH);

    const data = {};
    const sheet1 = workbook.Sheets['1-截面UE结果支付-发起退款-排退后GMV'];
    const json1 = XLSX.utils.sheet_to_json(sheet1, { header: 1 });
    data.gmv = extractValue(json1, '排退后GMV');

    const sheet3 = workbook.Sheets['3-截面UE结果支付-发起退款-BOM成本'];
    const json3 = XLSX.utils.sheet_to_json(sheet3, { header: 1 });
    data.bomCost = extractValue(json3, 'BOM成本');

    return data;
}

function extractValue(sheetData, fieldName) {
    for (let i = 0; i < Math.min(10, sheetData.length); i++) {
        const row = sheetData[i];
        const colIndex = row.indexOf(fieldName);
        if (colIndex !== -1 && i + 1 < sheetData.length) {
            return parseFloat(sheetData[i + 1][colIndex]) || 0;
        }
    }
    return 0;
}

function calculateValues(rawData) {
    return {
        salesWithTax: rawData.gmv,
        siIncomeNoTax: rawData.gmv / 1.13,
        bomCostWithTax: rawData.bomCost,
        bomCostNoTax: rawData.bomCost / 1.13
    };
}

async function main() {
    console.log('🚀 POPO 自动填写工具 v3 (支持 iframe)\n');

    // 1. 读取数据
    const rawData = readExcelData();
    const values = calculateValues(rawData);

    console.log('✅ 计算完成:');
    console.log(`  销售额（含税）: ${values.salesWithTax.toFixed(2)}`);
    console.log(`  SI收入（未税）: ${values.siIncomeNoTax.toFixed(2)}`);
    console.log(`  Bom成本（含税）: ${values.bomCostWithTax.toFixed(2)}`);
    console.log(`  Bom成本（未税）: ${values.bomCostNoTax.toFixed(2)}\n`);

    // 2. 启动浏览器
    const browser = await chromium.launch({ headless: false, slowMo: 100 });
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });

    // 加载登录状态
    if (fs.existsSync(COOKIES_FILE)) {
        await context.addCookies(JSON.parse(fs.readFileSync(COOKIES_FILE)));
        console.log('✅ 已加载登录状态');
    }

    const page = await context.newPage();
    await page.goto(POPO_URL);
    await page.waitForTimeout(3000);

    // 强制移除主页面的弹窗
    console.log('🚫 移除弹窗...');
    await page.evaluate(() => {
        const allElements = Array.from(document.querySelectorAll('*'));
        allElements.forEach(el => {
            const text = el.textContent || '';
            const style = window.getComputedStyle(el);
            // 移除包含"快捷交互"且是浮动元素的
            if (text.includes('快捷交互') && (style.position === 'fixed' || style.position === 'absolute')) {
                el.remove();
            }
            // 移除高z-index的遮罩层
            const zIndex = parseInt(style.zIndex);
            if (zIndex > 900 && (style.position === 'fixed' || style.position === 'absolute')) {
                const rect = el.getBoundingClientRect();
                // 如果是全屏遮罩或大面积元素
                if (rect.width > 200 && rect.height > 200 && text.length < 500) {
                    el.remove();
                }
            }
        });
    });
    await page.waitForTimeout(1000);
    console.log('✅ 弹窗已移除\n');

    // 3. 等待 iframe 加载
    console.log('⏳ 等待文档加载...');
    const iframe = await page.waitForSelector('iframe', { timeout: 10000 });
    const frame = await iframe.contentFrame();

    if (!frame) {
        console.log('❌ 无法访问 iframe 内容');
        return;
    }

    console.log('✅ 已进入文档编辑器 iframe\n');

    // 等待内容加载
    await frame.waitForTimeout(3000);

    // 4. 在 iframe 内查找内容
    console.log('🔍 分析 iframe 内容结构...\n');

    const iframeAnalysis = await frame.evaluate(() => {
        const results = {
            tables: [],
            editables: [],
            keywords: []
        };

        // 查找表格
        const tables = document.querySelectorAll('table');
        results.tables.push(`找到 ${tables.length} 个表格`);

        tables.forEach((table, idx) => {
            const rows = table.querySelectorAll('tr');
            results.tables.push(`表格 ${idx + 1}: ${rows.length} 行`);

            rows.forEach((row, rowIdx) => {
                if (rowIdx < 25) {
                    const cells = row.querySelectorAll('td, th');
                    const texts = Array.from(cells).map(c => c.textContent.trim());
                    if (texts.some(t => t)) {
                        results.tables.push(`  行${rowIdx + 1}: ${texts.join(' | ')}`);
                    }
                }
            });
        });

        // 查找可编辑元素
        const editables = document.querySelectorAll('[contenteditable="true"], input, textarea');
        results.editables.push(`找到 ${editables.length} 个可编辑元素`);

        editables.forEach((el, idx) => {
            if (idx < 20) {
                const val = (el.textContent || el.value || '').trim().slice(0, 40);
                results.editables.push(`  ${idx + 1}. ${el.tagName} - "${val}"`);
            }
        });

        // 搜索关键词
        const keywords = ['销售额', 'SI收入', 'Bom成本', '含税', '未税'];
        const html = document.body.innerHTML;
        keywords.forEach(kw => {
            const matches = html.match(new RegExp(kw, 'g'));
            if (matches) results.keywords.push(`"${kw}": ${matches.length}次`);
        });

        return results;
    });

    console.log('📊 表格:');
    iframeAnalysis.tables.forEach(l => console.log(l));
    console.log('\n📝 可编辑元素:');
    iframeAnalysis.editables.forEach(l => console.log(l));
    console.log('\n🔎 关键词:');
    iframeAnalysis.keywords.forEach(l => console.log(l));

    // 5. 截图
    await page.screenshot({ path: 'iframe_analysis.png', fullPage: true });
    console.log('\n📸 截图已保存: iframe_analysis.png');

    // 6. 尝试填写
    console.log('\n📝 开始填写数据...\n');

    const fieldsToFill = [
        { label: '销售额（含税）', value: values.salesWithTax },
        { label: 'SI收入（未税）', value: values.siIncomeNoTax },
        { label: 'Bom成本（含税）', value: values.bomCostWithTax },
        { label: 'Bom成本（未税）', value: values.bomCostNoTax }
    ];

    for (const field of fieldsToFill) {
        console.log(`📍 填写: ${field.label}`);

        const result = await frame.evaluate(({ label, value }) => {
            // 在表格中查找标签并填写相邻单元格
            const allCells = Array.from(document.querySelectorAll('td, th'));

            for (const cell of allCells) {
                const text = cell.textContent.trim();

                // 找到匹配标签的单元格
                if (text === label || text.includes(label)) {
                    // 尝试多种方式找到输入框
                    let targetCell = null;

                    // 方法1: 同行的下一个单元格
                    targetCell = cell.nextElementSibling;

                    // 方法2: 如果标签在 th,找同列的 td
                    if (!targetCell || targetCell.tagName === 'TH') {
                        const row = cell.parentElement;
                        const cellIndex = Array.from(row.children).indexOf(cell);
                        const nextRow = row.nextElementSibling;
                        if (nextRow) {
                            targetCell = nextRow.children[cellIndex];
                        }
                    }

                    if (targetCell) {
                        // 查找单元格内的可编辑元素
                        const editable = targetCell.querySelector('[contenteditable="true"], input, textarea') ||
                                        (targetCell.isContentEditable ? targetCell : null);

                        if (editable) {
                            editable.focus();
                            if (editable.tagName === 'INPUT' || editable.tagName === 'TEXTAREA') {
                                editable.value = value;
                            } else {
                                editable.textContent = value;
                            }
                            editable.dispatchEvent(new Event('input', { bubbles: true }));
                            editable.dispatchEvent(new Event('change', { bubbles: true }));
                            return { success: true, method: 'found_and_filled' };
                        } else if (targetCell.isContentEditable || targetCell.getAttribute('contenteditable')) {
                            targetCell.focus();
                            targetCell.textContent = value;
                            targetCell.dispatchEvent(new Event('input', { bubbles: true }));
                            return { success: true, method: 'cell_itself_editable' };
                        } else {
                            return { success: false, reason: 'cell_not_editable', cell: targetCell.outerHTML.slice(0, 100) };
                        }
                    }
                }
            }

            return { success: false, reason: 'label_not_found' };
        }, { label: field.label, value: field.value.toFixed(2) });

        if (result.success) {
            console.log(`  ✅ ${field.label} = ${field.value.toFixed(2)} (${result.method})`);
        } else {
            console.log(`  ⚠️  ${field.label} 失败: ${result.reason}`);
            if (result.cell) console.log(`      单元格: ${result.cell}`);
        }

        await frame.waitForTimeout(500);
    }

    // 最终截图
    await page.screenshot({ path: 'filled_result.png', fullPage: true });
    console.log('\n📸 填写后截图: filled_result.png');
    console.log('\n✅ 完成！浏览器保持打开，请检查结果');
    console.log('   按 Ctrl+C 关闭');

    await new Promise(() => {});
}

main().catch(console.error);
