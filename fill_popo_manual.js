const puppeteer = require('puppeteer');
const readline = require('readline');

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

// 等待用户按回车键
function waitForUserInput() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    console.log('\n⏸️  请手动关闭页面上的弹窗，然后按回车键继续...\n');
    
    rl.question('按回车键继续 > ', () => {
      rl.close();
      resolve();
    });
  });
}

async function fillPOPO() {
  console.log('🚀 启动浏览器...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    userDataDir: './popo-session'
  });

  const page = await browser.newPage();
  
  console.log('📄 打开 POPO 表格页面...');
  await page.goto('https://popo.netease.com/document/preview/7e1c3cfe8c434e38995b8f464a95116a', {
    waitUntil: 'networkidle2',
    timeout: 60000
  });

  // 等待 5 秒让页面完全加载
  console.log('⏳ 等待页面加载...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // 等待用户手动关闭弹窗
  await waitForUserInput();

  console.log('✅ 继续自动填写...\n');

  // 尝试多种方法填写表格
  try {
    // 方法1: 直接查找输入框
    console.log('方法1: 查找表单输入框...');
    const inputs = await page.$$('input[type="text"], textarea');
    console.log(`找到 ${inputs.length} 个输入框`);

    let index = 0;
    for (const key in data) {
      if (index < inputs.length) {
        await inputs[index].click();
        await new Promise(resolve => setTimeout(resolve, 300));
        await inputs[index].type(data[key], { delay: 100 });
        console.log(`✅ 填写 ${key}: ${data[key]}`);
        index++;
      }
    }

  } catch (error) {
    console.log('⚠️  方法1失败，尝试方法2...');
    
    // 方法2: 尝试查找 contenteditable 元素
    try {
      const editables = await page.$$('[contenteditable="true"]');
      console.log(`找到 ${editables.length} 个可编辑区域`);
      
      let index = 0;
      for (const key in data) {
        if (index < editables.length) {
          await editables[index].click();
          await new Promise(resolve => setTimeout(resolve, 300));
          await page.keyboard.type(data[key], { delay: 100 });
          console.log(`✅ 填写 ${key}: ${data[key]}`);
          index++;
        }
      }
    } catch (error2) {
      console.error('❌ 所有方法都失败了:', error2.message);
    }
  }

  console.log('\n✅ 自动填写完成！请检查表格内容');
  console.log('💡 浏览器窗口保持打开，您可以手动调整后提交');
  console.log('\n按 Ctrl+C 关闭程序和浏览器');

  // 不自动关闭浏览器，让用户检查
  await new Promise(() => {}); // 永久等待
}

fillPOPO().catch(error => {
  console.error('❌ 出错了:', error);
  process.exit(1);
});
