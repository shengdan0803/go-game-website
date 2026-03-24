const xlsx = require('xlsx');

const excelPath = '/Users/cuichengdan/Downloads/抖音自播_UE_20260317_04.xlsx';
console.log('📖 检查 Excel 文件结构...\n');

const workbook = xlsx.readFile(excelPath);

console.log('📊 工作表列表:');
workbook.SheetNames.forEach((name, i) => {
  console.log(`  ${i + 1}. ${name}`);
});

console.log('\n📋 每个工作表的前 20 行数据:\n');

workbook.SheetNames.forEach(sheetName => {
  const sheet = workbook.Sheets[sheetName];
  const json = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  console.log(`\n${'='.repeat(60)}`);
  console.log(`工作表: ${sheetName}`);
  console.log('='.repeat(60));

  json.slice(0, 20).forEach((row, i) => {
    console.log(`第 ${i + 1} 行:`, row);
  });
});
