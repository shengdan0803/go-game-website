const { chromium } = require('playwright');

const POPO_URL = 'https://docs.popo.netease.com/lingxi/d052254b77ae4a618f99941eefde5719?appVersion=4.27.0&deviceType=4&popo_hidenativebar=1&popo_noindicator=1&disposable_login_token=1';
const COOKIES_FILE = './popo_cookies.json';
const fs = require('fs');

async function main() {
    console.log('🔍 POPO 文档结构探索工具\n');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 100
    });

    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });

    // 加载cookies
    if (fs.existsSync(COOKIES_FILE)) {
        const cookies = JSON.parse(fs.readFileSync(COOKIES_FILE));
        await context.addCookies(cookies);
        console.log('✅ 已加载登录状态');
    }

    const page = await context.newPage();
    await page.goto(POPO_URL);
    await page.waitForTimeout(3000);

    // 尝试关闭弹窗 - 更激进的方法
    console.log('🚫 强制关闭弹窗...');
    await page.waitForTimeout(2000);

    // 使用多种方法关闭弹窗
    await page.evaluate(() => {
        // 方法1: 直接移除包含"快捷交互"的所有元素
        const allElements = Array.from(document.querySelectorAll('*'));
        allElements.forEach(el => {
            const text = el.textContent || '';
            if (text.includes('快捷交互小技巧') || text.includes('hover直接展示菜单')) {
                // 检查是否是弹窗容器
                const style = window.getComputedStyle(el);
                if (style.position === 'fixed' || style.position === 'absolute') {
                    el.style.display = 'none';
                    console.log('隐藏了弹窗元素:', el.className);
                }
            }
        });

        // 方法2: 查找所有 z-index 很高的元素（通常是弹窗）
        allElements.forEach(el => {
            const style = window.getComputedStyle(el);
            const zIndex = parseInt(style.zIndex);
            if (zIndex > 1000) {
                const text = el.textContent || '';
                if (text.includes('下一步') || text.includes('快捷') || text.length < 500) {
                    el.style.display = 'none';
                    console.log('隐藏了高层级元素:', el.className, 'z-index:', zIndex);
                }
            }
        });
    });

    await page.waitForTimeout(1000);
    console.log('✅ 弹窗强制处理完成');

    // 滚动页面，确保看到表格
    console.log('\n📜 滚动页面...');
    await page.evaluate(() => {
        window.scrollTo(0, 300);
    });
    await page.waitForTimeout(1000);

    // 截图
    await page.screenshot({ path: 'debug_full_page.png', fullPage: true });
    await page.screenshot({ path: 'debug_viewport.png' });
    console.log('📸 已保存截图: debug_full_page.png, debug_viewport.png');

    // 探索页面结构
    console.log('\n🔍 分析页面结构...\n');

    const analysis = await page.evaluate(() => {
        const results = {
            iframes: [],
            shadowRoots: [],
            tables: [],
            editables: [],
            textMatches: []
        };

        // 检查 iframe
        const iframes = document.querySelectorAll('iframe');
        results.iframes.push(`找到 ${iframes.length} 个 iframe 元素`);
        iframes.forEach((iframe, idx) => {
            results.iframes.push(`  iframe ${idx + 1}: src="${iframe.src}"`);
        });

        // 检查 Shadow DOM
        const allElements = Array.from(document.querySelectorAll('*'));
        const shadowHosts = allElements.filter(el => el.shadowRoot);
        results.shadowRoots.push(`找到 ${shadowHosts.length} 个 Shadow DOM 宿主`);

        // 查找所有表格
        const tables = document.querySelectorAll('table');
        results.tables.push(`找到 ${tables.length} 个 table 元素`);

        tables.forEach((table, idx) => {
            const rows = table.querySelectorAll('tr');
            results.tables.push(`  表格 ${idx + 1}: ${rows.length} 行`);

            rows.forEach((row, rowIdx) => {
                if (rowIdx < 20) {
                    const cells = row.querySelectorAll('td, th');
                    const cellTexts = Array.from(cells).map(c => c.textContent.trim()).filter(t => t);
                    if (cellTexts.length > 0) {
                        results.tables.push(`    行${rowIdx + 1}: ${cellTexts.join(' | ')}`);
                    }
                }
            });
        });

        // 查找所有可编辑元素
        const editables = document.querySelectorAll('[contenteditable="true"], input, textarea');
        results.editables.push(`找到 ${editables.length} 个可编辑元素`);

        editables.forEach((el, idx) => {
            if (idx < 30) {
                const value = (el.textContent || el.value || '').trim();
                const tag = el.tagName.toLowerCase();
                const ce = el.getAttribute('contenteditable');
                const placeholder = el.getAttribute('placeholder') || '';
                results.editables.push(`  ${idx + 1}. <${tag}${ce ? ' contenteditable' : ''}> placeholder="${placeholder}" 值: "${value.slice(0, 40)}"`);
            }
        });

        // 搜索关键词（在整个文档中）
        const bodyHTML = document.body.innerHTML;
        const keywords = ['销售额', 'SI收入', 'Bom成本', '含税', '未税', 'GMV', '利润', '2026年2月'];
        keywords.forEach(keyword => {
            const matches = bodyHTML.match(new RegExp(keyword, 'g'));
            if (matches) {
                results.textMatches.push(`"${keyword}" 出现 ${matches.length} 次`);
            }
        });

        // 尝试获取文档的主要内容区域
        const contentAreas = document.querySelectorAll('[class*="content"], [class*="editor"], [class*="document"], [id*="content"], [id*="editor"]');
        if (contentAreas.length > 0) {
            results.textMatches.push(`\n找到 ${contentAreas.length} 个可能的内容区域`);
            contentAreas.forEach((area, idx) => {
                const text = area.textContent.trim().slice(0, 200);
                results.textMatches.push(`  区域 ${idx + 1} (${area.tagName}.${area.className}): ${text}`);
            });
        }

        return results;
    });

    console.log('📊 Iframe:');
    analysis.iframes.forEach(line => console.log(line));

    console.log('\n👻 Shadow DOM:');
    analysis.shadowRoots.forEach(line => console.log(line));

    console.log('\n📊 表格结构:');
    analysis.tables.forEach(line => console.log(line));

    console.log('\n📝 可编辑元素:');
    analysis.editables.forEach(line => console.log(line));

    console.log('\n🔎 关键词匹配:');
    analysis.textMatches.forEach(line => console.log(line));

    console.log('\n✅ 分析完成，浏览器将保持打开');
    console.log('   请在浏览器中手动检查页面内容');
    console.log('   按 Ctrl+C 关闭');

    await new Promise(() => {});
}

main().catch(console.error);
