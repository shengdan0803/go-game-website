const { chromium } = require('playwright');
const fs = require('fs');

const POPO_URL = 'https://docs.popo.netease.com/lingxi/d052254b77ae4a618f99941eefde5719?appVersion=4.27.0&deviceType=4&popo_hidenativebar=1&popo_noindicator=1&disposable_login_token=1';
const COOKIES_FILE = './popo_cookies.json';

async function main() {
    console.log('🚀 POPO 自动填写工具 - 手动处理弹窗版本\n');

    // 使用准备好的数据
    console.log('📊 加载数据...');
    const data = {
        gmv: 2128355.75,
        profitRate: 0.10,
        profit: 179749.39,
        bomCost: 762602.83,
        grossMargin: 0.60,
        trafficCost: 659741.73,
        qcCashCost: 615238.23,
        salesCost: 224718.40,
        otherCost: 233864.15
    };

    console.log('✅ 读取完成:');
    console.log(`  排退后GMV: ${data.gmv.toFixed(2)}`);
    console.log(`  利润率（未税）: ${data.profitRate.toFixed(2)}`);
    console.log(`  利润（未税）: ${data.profit.toFixed(2)}`);
    console.log(`  BOM成本: ${data.bomCost.toFixed(2)}`);
    console.log(`  毛利率: ${data.grossMargin.toFixed(2)}`);
    console.log(`  S&M流量获取费用: ${data.trafficCost.toFixed(2)}`);
    console.log(`  千川现金消耗费用: ${data.qcCashCost.toFixed(2)}`);
    console.log(`  销售人员成本: ${data.salesCost.toFixed(2)}`);
    console.log(`  其他渠道运营成本: ${data.otherCost.toFixed(2)}\n`);

    // 启动浏览器（不是无头模式）
    const browser = await chromium.launch({
        headless: false,
        slowMo: 50
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });

    // 加载 cookies
    if (fs.existsSync(COOKIES_FILE)) {
        const cookies = JSON.parse(fs.readFileSync(COOKIES_FILE));
        await context.addCookies(cookies);
        console.log('✅ 已加载登录状态');
    }

    const page = await context.newPage();
    await page.goto(POPO_URL);
    await page.waitForTimeout(3000);

    // 🎯 关键：这里等待用户手动操作
    console.log('\n⏸️  **请您手动操作：**');
    console.log('   1. 看到弹窗了吗？请点击"知道了"或关闭按钮');
    console.log('   2. 关闭弹窗后，回到终端');
    console.log('   3. 按任意键继续...\n');

    // 等待用户按键
    await new Promise(resolve => {
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.once('data', () => {
            process.stdin.setRawMode(false);
            resolve();
        });
    });

    console.log('✅ 收到确认，继续自动填写...\n');

    // 滚动到表格位置
    console.log('📜 滚动到表格...');
    await page.evaluate(() => {
        window.scrollTo(0, 400);
    });
    await page.waitForTimeout(1000);

    // 方法1: 尝试直接编辑单元格（点击激活）
    console.log('🎯 尝试定位并填写表格...');

    const fillData = [
        { row: 2, col: 'C', value: data.gmv, name: '排退后GMV' },
        { row: 3, col: 'C', value: data.profitRate, name: '利润率（未税）' },
        { row: 4, col: 'C', value: data.profit, name: '利润（未税）' },
        { row: 5, col: 'C', value: data.bomCost, name: 'BOM成本' },
        { row: 6, col: 'C', value: data.grossMargin, name: '毛利率' },
        { row: 7, col: 'C', value: data.trafficCost, name: 'S&M流量获取费用' },
        { row: 8, col: 'C', value: data.qcCashCost, name: '千川现金消耗费用' },
        { row: 9, col: 'C', value: data.salesCost, name: '销售人员成本' },
        { row: 10, col: 'C', value: data.otherCost, name: '其他渠道运营成本' }
    ];

    // 尝试多种定位策略
    for (const item of fillData) {
        try {
            console.log(`  → 填写 ${item.name}: ${item.value}`);

            // 策略1: 通过文本内容定位行，然后找到对应列
            const filled = await page.evaluate(async ({ name, value }) => {
                // 查找包含该名称的单元格
                const allCells = Array.from(document.querySelectorAll('td, th, div[role="cell"], div[role="gridcell"]'));
                const targetRow = allCells.find(cell => cell.textContent.trim().includes(name));

                if (!targetRow) return false;

                // 找到同一行的C列（通常是第3列）
                const row = targetRow.closest('tr, div[role="row"]');
                if (!row) return false;

                const cells = Array.from(row.querySelectorAll('td, div[role="cell"], div[role="gridcell"]'));
                const targetCell = cells[2]; // C列是第3列（索引2）

                if (!targetCell) return false;

                // 触发编辑
                targetCell.click();
                await new Promise(r => setTimeout(r, 300));

                // 尝试找到输入框
                const input = targetCell.querySelector('input, textarea') ||
                              document.activeElement;

                if (input && (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA')) {
                    input.value = String(value);
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));

                    // 按回车确认
                    const enterEvent = new KeyboardEvent('keydown', {
                        key: 'Enter',
                        code: 'Enter',
                        keyCode: 13,
                        bubbles: true
                    });
                    input.dispatchEvent(enterEvent);

                    return true;
                }

                return false;
            }, { name: item.name, value: item.value });

            if (filled) {
                console.log(`    ✅ 成功`);
            } else {
                console.log(`    ⚠️  未找到对应单元格`);
            }

            await page.waitForTimeout(500);

        } catch (error) {
            console.log(`    ❌ 填写失败: ${error.message}`);
        }
    }

    console.log('\n📸 截图保存结果...');
    await page.screenshot({ path: 'popo_filled.png', fullPage: true });
    console.log('✅ 截图已保存: popo_filled.png');

    console.log('\n✨ 完成！浏览器将在 5 秒后关闭...');
    await page.waitForTimeout(5000);

    await browser.close();
}

main().catch(console.error);
