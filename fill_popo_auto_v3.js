const puppeteer = require('puppeteer');

// 要填写的数据
const data = {
  '姓名': '张三',
  '性别': '男', 
  '年龄': '28',
  '联系电话': '13800138000',
  '邮箱': 'zhangsan@example.com',
  '部门': '技术部',
  '职位': '工程师',
  '入职日期': '2024-01-01',
  '备注': '无'
};

async function fillPOPO() {
  console.log('🚀 启动浏览器...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    userDataDir: './popo-session',
    args: ['--start-maximized']
  });

  const page = await browser.newPage();
  
  console.log('📄 打开 POPO 表格页面...');
  await page.goto('https://popo.netease.com/document/preview/7e1c3cfe8c434e38995b8f464a95116a', {
    waitUntil: 'networkidle2',
    timeout: 60000
  });

  console.log('\n⏳ 等待 15 秒...');
  console.log('💡 如果看到弹窗，请在这 15 秒内手动关闭它！\n');
  
  // 倒计时显示
  for (let i = 15; i > 0; i--) {
    process.stdout.write(`\r⏰ 还有 ${i} 秒... `);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log('\n\n✅ 开始自动填写！\n');

  // 尝试多种方法填写
  try {
    // 先尝试关闭可能的弹窗
    try {
      const closeButtons = await page.$$('[class*="close"], [class*="Close"], button[aria-label*="关闭"]');
      for (const btn of closeButtons) {
        await btn.click().catch(() => {});
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (e) {
      console.log('未找到弹窗关闭按钮（可能已手动关闭）');
    }

    // 方法1: 查找所有输入框
    console.log('🔍 方法1: 查找表单输入框...');
    const inputs = await page.$$('input[type="text"], textarea, input:not([type="hidden"])');
    console.log(`找到 ${inputs.length} 个输入框\n`);

    if (inputs.length > 0) {
      let index = 0;
      for (const key in data) {
        if (index < inputs.length) {
          try {
            await inputs[index].click();
            await new Promise(resolve => setTimeout(resolve, 300));
            await inputs[index].type(data[key], { delay: 80 });
            console.log(`✅ 填写 ${key}: ${data[key]}`);
            index++;
          } catch (e) {
            console.log(`⚠️  跳过 ${key} (无法填写)`);
          }
        }
      }
    } else {
      console.log('⚠️  未找到输入框，尝试其他方法...\n');
      
      // 方法2: 查找可编辑区域
      const editables = await page.$$('[contenteditable="true"], [contenteditable="plaintext-only"]');
      console.log(`🔍 方法2: 找到 ${editables.length} 个可编辑区域\n`);
      
      let index = 0;
      for (const key in data) {
        if (index < editables.length) {
          try {
            await editables[index].click();
            await new Promise(resolve => setTimeout(resolve, 300));
            await page.keyboard.type(data[key], { delay: 80 });
            console.log(`✅ 填写 ${key}: ${data[key]}`);
            index++;
          } catch (e) {
            console.log(`⚠️  跳过 ${key} (无法填写)`);
          }
        }
      }
    }

  } catch (error) {
    console.error('\n❌ 填写过程出错:', error.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ 自动填写完成！');
  console.log('💡 浏览器窗口保持打开，您可以检查并手动调整');
  console.log('🔴 按 Ctrl+C 可关闭程序和浏览器');
  console.log('='.repeat(50) + '\n');

  // 保持浏览器打开，让用户检查
  await new Promise(() => {});
}

fillPOPO().catch(error => {
  console.error('❌ 程序出错:', error);
  process.exit(1);
});
