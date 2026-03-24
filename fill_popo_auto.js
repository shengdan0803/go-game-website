const puppeteer = require('puppeteer-core');
const xlsx = require('xlsx');
const path = require('path');

// 配置
const CONFIG = {
  excelPath: '/Users/cuichengdan/Downloads/抖音自播_UE_20260317_04.xlsx',
  popoUrl: 'https://popo.netease.com/document/preview/7e1c3cfe8c434e38995b8f464a95116a',
  cookiesPath: path.join(__dirname, 'popo_cookies.json'),

  // 数据映射：字段名 -> { sheet: 工作表名, row: 行号, col: 列号(0-based) }
  dataMapping: {
    '排退后GMV': { sheet: '1-截面UE结果支付-发起退款-排退后GMV', row: 2, col: 0 },
    '利润率（未税）': { sheet: '2-截面UE结果支付-发起退款-利润率未税', row: 2, col: 0 },
    '利润（未税）': { sheet: '2-截面UE结果支付-发起退款-利润率未税', row: 2, col: 4 },
    'BOM成本': { sheet: '3-截面UE结果支付-发起退款-BOM成本', row: 2, col: 0 },
    '毛利率': { sheet: '3-截面UE结果支付-发起退款-BOM成本', row: 2, col: 1 },
    'S&M流量获取费用': { sheet: '4-截面UE结果支付-发起退款-SM流量获取费用', row: 2, col: 0 },
    '千川现金消耗费用': { sheet: '4-截面UE结果支付-发起退款-SM流量获取费用', row: 2, col: 2 },
    '销售人员成本': { sheet: '5-截面UE结果支付-发起退款-销售人员成本', row: 2, col: 0 },
    '其他渠道运营成本': { sheet: '6-截面UE结果支付-发起退款-其他渠道运营成本', row: 2, col: 0 }
  }
};

console.log('🚀 POPO 自动填写工具 - 完全自动化版本\n');

// 读取 Excel 数据
function readExcelData() {
  console.log('📖 读取 Excel...');
  const workbook = xlsx.readFile(CONFIG.excelPath);
  const data = {};

  for (const [fieldName, location] of Object.entries(CONFIG.dataMapping)) {
    const sheet = workbook.Sheets[location.sheet];
    const json = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    const value = json[location.row - 1][location.col]; // row 是从 1 开始的
    data[fieldName] = typeof value === 'number' ? value : parseFloat(value) || 0;
  }

  // 显示计算结果
  console.log('✅ 读取完成:');
  for (const [field, value] of Object.entries(data)) {
    console.log(`  ${field}: ${value.toFixed(2)}`);
  }
  console.log('');

  return data;
}

// 在 iframe 中智能填写
async function fillInIframe(page, fieldName, value) {
  try {
    const result = await page.evaluate(async (fieldName, value) => {
      // 等待文档加载
      await new Promise(resolve => setTimeout(resolve, 500));

      // 查找包含字段名的单元格
      const allCells = Array.from(document.querySelectorAll('td, th, span, div, p'));
      const labelCell = allCells.find(cell => {
        const text = cell.textContent.trim();
        return text === fieldName || text.includes(fieldName);
      });

      if (!labelCell) {
        return { success: false, error: 'label_not_found' };
      }

      // 查找对应的输入框
      // 策略 1: 同一行的下一个单元格
      let inputCell = labelCell.parentElement?.querySelector('td:nth-child(2)');

      // 策略 2: 查找附近的可编辑元素
      if (!inputCell) {
        const row = labelCell.closest('tr');
        if (row) {
          inputCell = row.querySelector('td[contenteditable="true"], td input, td textarea');
        }
      }

      // 策略 3: 查找 contenteditable 的单元格
      if (!inputCell) {
        const allEditables = Array.from(document.querySelectorAll('[contenteditable="true"]'));
        const labelIndex = allCells.indexOf(labelCell);
        inputCell = allEditables.find((editable, idx) => {
          const editableIndex = allCells.indexOf(editable);
          return editableIndex > labelIndex && editableIndex < labelIndex + 5;
        });
      }

      if (!inputCell) {
        return { success: false, error: 'input_not_found' };
      }

      // 填写数据
      const valueStr = value.toFixed(2);

      // 清空现有内容
      if (inputCell.hasAttribute('contenteditable')) {
        inputCell.textContent = valueStr;
        inputCell.innerText = valueStr;
      } else {
        const input = inputCell.querySelector('input, textarea');
        if (input) {
          input.value = valueStr;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          inputCell.textContent = valueStr;
        }
      }

      // 触发焦点事件
      inputCell.focus();
      inputCell.blur();

      // 触发输入事件
      ['input', 'change', 'blur'].forEach(eventType => {
        inputCell.dispatchEvent(new Event(eventType, { bubbles: true }));
      });

      return { success: true, value: valueStr };

    }, fieldName, value);

    if (result.success) {
      console.log(`  ✅ ${fieldName} = ${result.value}`);
      return true;
    } else {
      console.log(`  ⚠️  ${fieldName} 失败: ${result.error}`);
      return false;
    }

  } catch (error) {
    console.log(`  ❌ ${fieldName} 错误: ${error.message}`);
    return false;
  }
}

// 主流程
(async () => {
  try {
    // 1. 读取数据
    const data = readExcelData();

    // 2. 启动浏览器
    const browser = await puppeteer.launch({
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: false,
      defaultViewport: { width: 1400, height: 900 },
      args: ['--start-maximized']
    });

    const page = await browser.newPage();

    // 3. 加载登录状态
    const fs = require('fs');
    if (fs.existsSync(CONFIG.cookiesPath)) {
      const cookies = JSON.parse(fs.readFileSync(CONFIG.cookiesPath, 'utf8'));
      await page.setCookie(...cookies);
      console.log('✅ 已加载登录状态');
    }

    // 4. 打开页面
    await page.goto(CONFIG.popoUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    // 5. 关闭弹窗
    console.log('🚫 尝试关闭弹窗...');
    await page.evaluate(() => {
      // 移除所有弹窗相关元素
      const popups = document.querySelectorAll('[class*="guide"], [class*="modal"], [class*="dialog"], [class*="popup"]');
      popups.forEach(popup => {
        if (popup.textContent.includes('快捷交互小技巧') ||
            popup.textContent.includes('下一步') ||
            getComputedStyle(popup).position === 'fixed') {
          popup.remove();
        }
      });

      // 点击"下一步"按钮
      const buttons = Array.from(document.querySelectorAll('button, a, div[role="button"]'));
      const nextButton = buttons.find(btn =>
        btn.textContent.includes('下一步') ||
        btn.textContent.includes('知道了') ||
        btn.textContent.includes('关闭')
      );
      if (nextButton) {
        nextButton.click();
      }
    });

    await new Promise(r => setTimeout(r, 1000));
    console.log('✅ 弹窗已处理\n');

    // 6. 等待并进入 iframe
    console.log('⏳ 等待文档加载...');
    await page.waitForSelector('iframe[src*="editor"]', { timeout: 10000 });

    const frames = page.frames();
    const editorFrame = frames.find(frame => frame.url().includes('editor'));

    if (!editorFrame) {
      throw new Error('未找到编辑器 iframe');
    }

    console.log('✅ 已进入文档编辑器 iframe\n');

    // 7. 等待表格加载
    await editorFrame.waitForSelector('table, td, [contenteditable]', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 2000)); // 等待内容完全渲染

    // 8. 开始填写
    console.log('📝 开始自动填写...\n');

    let successCount = 0;
    for (const [fieldName, value] of Object.entries(data)) {
      console.log(`📍 填写: ${fieldName}`);
      const success = await fillInIframe(editorFrame, fieldName, value);
      if (success) successCount++;
      await new Promise(r => setTimeout(r, 800)); // 每次填写后等待
    }

    // 9. 截图验证
    console.log('\n📸 保存截图...');
    await page.screenshot({
      path: 'filled_complete.png',
      fullPage: true
    });

    // 10. 总结
    console.log(`\n✅ 填写完成！`);
    console.log(`   成功: ${successCount}/${Object.keys(data).length}`);
    console.log(`   截图: filled_complete.png`);
    console.log('\n✨ 浏览器保持打开，请检查结果');
    console.log('   按 Ctrl+C 关闭');

    // 保持浏览器打开
    await new Promise(() => {});

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    process.exit(1);
  }
})();
