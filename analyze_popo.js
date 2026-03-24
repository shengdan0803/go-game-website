const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });

  const context = await browser.newContext({
    viewport: null,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });

  const page = await context.newPage();

  console.log('正在打开 POPO 文档...');
  await page.goto('https://docs.popo.netease.com/lingxi/42e6cefed0d94ceba6b542d003c65436', {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  // 等待页面加载
  await page.waitForTimeout(3000);

  // 截图保存
  await page.screenshot({ path: '/Users/cuichengdan/Desktop/Personal Page/popo_doc_screenshot.png', fullPage: true });
  console.log('已保存截图到: popo_doc_screenshot.png');

  // 分析页面结构
  const pageInfo = await page.evaluate(() => {
    return {
      title: document.title,
      url: window.location.href,
      // 查找编辑器区域
      editors: Array.from(document.querySelectorAll('[contenteditable="true"]')).length,
      // 查找表格
      tables: document.querySelectorAll('table').length,
      // 查找输入框
      inputs: document.querySelectorAll('input, textarea').length,
      // 主要元素
      mainClasses: Array.from(document.querySelectorAll('[class*="editor"], [class*="content"], [class*="document"]'))
        .slice(0, 5)
        .map(el => el.className),
      // 检查是否需要登录
      hasLogin: document.body.innerText.includes('登录') || document.body.innerText.includes('login'),
      bodyText: document.body.innerText.substring(0, 500)
    };
  });

  console.log('\n=== POPO 文档分析结果 ===');
  console.log(JSON.stringify(pageInfo, null, 2));

  // 保持浏览器打开30秒供查看
  console.log('\n浏览器将保持打开30秒，请查看...');
  await page.waitForTimeout(30000);

  await browser.close();
  console.log('分析完成');
})();
