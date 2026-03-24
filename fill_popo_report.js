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

    // 读取各个 sheet 的数据
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

/**
 * 从 sheet 数据中提取指定字段的值
 */
function extractValue(sheetData, fieldName) {
    // 查找列名所在行
    for (let i = 0; i < Math.min(10, sheetData.length); i++) {
        const row = sheetData[i];
        const colIndex = row.indexOf(fieldName);
        if (colIndex !== -1) {
            // 找到列名，返回下一行的值
            if (i + 1 < sheetData.length) {
                const value = sheetData[i + 1][colIndex];
                return parseFloat(value) || 0;
            }
        }
    }
    return 0;
}

/**
 * 计算需要填写的所有值
 */
function calculateValues(rawData) {
    const values = {
        salesWithTax: rawData.gmv,                          // 销售额（含税）
        siIncomeNoTax: rawData.gmv / 1.13,                  // SI收入（未税）
        bomCostWithTax: rawData.bomCost,                    // Bom成本（含税）
        bomCostNoTax: rawData.bomCost / 1.13                // Bom成本（未税）
    };

    console.log('\n💡 计算结果:');
    console.log(`  1. 销售额（含税）: ${values.salesWithTax.toFixed(2)}`);
    console.log(`  2. SI收入（未税）: ${values.siIncomeNoTax.toFixed(2)}`);
    console.log(`  3. Bom成本（含税）: ${values.bomCostWithTax.toFixed(2)}`);
    console.log(`  4. Bom成本（未税）: ${values.bomCostNoTax.toFixed(2)}`);

    return values;
}

/**
 * 保存登录状态
 */
async function saveCookies(context) {
    const cookies = await context.cookies();
    fs.writeFileSync(COOKIES_FILE, JSON.stringify(cookies, null, 2));
    console.log('✅ 登录状态已保存');
}

/**
 * 加载登录状态
 */
async function loadCookies(context) {
    if (fs.existsSync(COOKIES_FILE)) {
        const cookies = JSON.parse(fs.readFileSync(COOKIES_FILE, 'utf-8'));
        await context.addCookies(cookies);
        console.log('✅ 登录状态已加载');
        return true;
    }
    return false;
}

/**
 * 等待用户手动登录
 */
async function waitForLogin(page) {
    console.log('\n⚠️  请在浏览器中完成登录...');
    console.log('   登录完成后，脚本会自动继续');

    // 等待页面跳转到文档编辑页面（而非登录页）
    await page.waitForFunction(() => {
        return !window.location.href.includes('/login');
    }, { timeout: 120000 }); // 2分钟超时

    console.log('✅ 登录成功！');
}

/**
 * 填写 POPO 文档
 */
async function fillPopoDocument(page, values) {
    console.log('\n📝 正在定位文档表格...');

    // 等待文档加载完成
    await page.waitForTimeout(3000);

    // 查找所有可编辑的单元格
    console.log('🔍 正在查找表格单元格...');

    // 截图用于调试
    await page.screenshot({ path: 'popo_before_fill.png', fullPage: true });
    console.log('📸 填写前截图已保存: popo_before_fill.png');

    // 尝试多种选择器找到表格
    const possibleSelectors = [
        'td[contenteditable="true"]',
        'div[contenteditable="true"]',
        '.editable-cell',
        '[role="gridcell"]',
        'textarea',
        'input[type="text"]'
    ];

    let cells = [];
    for (const selector of possibleSelectors) {
        cells = await page.$$(selector);
        if (cells.length > 0) {
            console.log(`✅ 找到 ${cells.length} 个可编辑单元格（使用选择器: ${selector}）`);
            break;
        }
    }

    if (cells.length === 0) {
        console.log('⚠️  未找到可编辑单元格，尝试其他方式...');

        // 获取页面文本内容，帮助定位
        const bodyText = await page.textContent('body');
        console.log('📄 页面包含以下关键词:');
        ['销售额', 'SI收入', 'Bom成本', '含税', '未税'].forEach(keyword => {
            if (bodyText.includes(keyword)) {
                console.log(`  ✓ ${keyword}`);
            }
        });

        return false;
    }

    // TODO: 这里需要根据实际的 POPO 文档结构来定位和填写
    // 目前我们先保存截图，让用户确认文档结构
    console.log('\n⚠️  需要分析文档结构来准确定位填写位置');
    console.log('   请查看截图 popo_before_fill.png');

    return true;
}

/**
 * 主函数
 */
async function main() {
    console.log('🚀 开始自动化流程...\n');

    // 1. 读取并计算数据
    const rawData = readExcelData();
    const values = calculateValues(rawData);

    // 2. 启动浏览器
    console.log('\n🌐 启动浏览器...');
    const browser = await chromium.launch({
        headless: false,  // 显示浏览器窗口
        slowMo: 100       // 放慢操作速度，便于观察
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });

    // 3. 尝试加载已保存的登录状态
    const hasLoginState = await loadCookies(context);

    const page = await context.newPage();

    // 4. 打开 POPO 文档
    console.log('📄 打开 POPO 文档...');
    await page.goto(POPO_URL);

    // 5. 如果没有登录状态或登录状态失效，需要手动登录
    await page.waitForTimeout(2000);
    const currentUrl = page.url();

    if (currentUrl.includes('/login') || !hasLoginState) {
        await waitForLogin(page);
        await saveCookies(context);
    } else {
        console.log('✅ 已使用保存的登录状态');
    }

    // 6. 填写文档
    await fillPopoDocument(page, values);

    // 7. 保持浏览器打开，等待用户确认
    console.log('\n✅ 自动化流程完成！');
    console.log('   浏览器将保持打开状态，您可以检查结果');
    console.log('   按 Ctrl+C 关闭');

    // 等待用户手动关闭
    await new Promise(() => {});
}

// 运行主函数
main().catch(error => {
    console.error('❌ 错误:', error);
    process.exit(1);
});
