import * as XLSX from 'xlsx';

// 思维培养关注点映射
const THINKING_MAP = {
  '提升思维逻辑': 'logic_enhancement',
  '提升思维逻辑思维,让学习更高效': 'logic_enhancement',
  '锻炼抗挫力': 'resilience_training',
  '锻炼抗挫力,面对困难更积极': 'resilience_training',
  'Improve logical thinking': 'logic_enhancement',
  'Build resilience': 'resilience_training',
};

// 读取并解析 Excel
export function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        // 第1行是表头
        const headers = jsonData[0] || [];
        const rows = jsonData.slice(1); // 从第2行开始是数据
        
        console.log('📊 Excel原始数据:', jsonData);
        console.log('📋 表头(第1行):', headers);
        console.log('📋 数据行数:', rows.length);
        console.log('📋 前3行数据样例:', rows.slice(0, 3));
        
        // 数据清洗和标准化
        const cleanedData = rows
          .map((row, index) => {
            const rowData = {};
            headers.forEach((header, i) => {
              rowData[header] = row[i];
            });
            
            // 1. 过滤示例行(期数='a')
            if (rowData['期数'] === 'a') return null;
            
            // 2. 如果存在"是否添加微信"字段,只保留值为'是'的学员
            // 如果不存在这个字段,则保留所有学员
            const hasWechatField = headers.includes('是否添加微信');
            if (hasWechatField) {
              const wechatValue = String(rowData['是否添加微信'] || '').trim();
              if (wechatValue !== '是' && wechatValue !== '') {
                return null;
              }
            }
            
            // 3. 必须有姓名或手机号才算有效学员
            const name = rowData['学生姓名'] || rowData['学员姓名'] || rowData['孩子昵称'] || '';
            const phone = String(rowData['下单手机号'] || rowData['手机号'] || '');
            if (!name && !phone) {
              console.log('⚠️ 跳过无效行(无姓名和手机号):', index, rowData);
              return null;
            }
            
            console.log(`✅ 有效学员 #${index + 1}:`, { name, phone, gender: rowData['孩子性别'] || rowData['性别'] });
            
            return {
              id: index + 1,
              name: name,
              phone: phone,
              gender: rowData['孩子性别'] || rowData['性别'] || '',
              age: rowData['孩子年级'] || rowData['年级'] || '',
              city: rowData['学员城市'] || rowData['所在城市'] || '',
              period: rowData['期数'] || '',
              date: formatPeriodToDate(rowData['期数'] || ''),
              hasFilledForm: rowData['是否填写探需表单'] === '是' || rowData['是否填写探需表单'] === 'yes',
              thinkingFocus: normalizeThinkingFocus(rowData['思维培养关注点'] || ''),
              thinkingFocusRaw: rowData['思维培养关注点'] || '',
              competitiveAttitude: rowData['胜负观'] || '',
              otherCourses: rowData['其他兴趣班'] || rowData['孩子目前在学哪些兴趣班？'] || '',
              hasWeiqi: (rowData['围棋学习经历'] || '').includes('有') || 
                        (rowData['围棋学习经历'] || '').includes('系统学习') || 
                        (rowData['围棋学习经历'] || '').includes('定段') ||
                        (rowData['围棋学习经历'] || '').toLowerCase().includes('yes'),
              addedWechat: rowData['是否添加微信'] === '是',
              rawData: rowData,
            };
          })
          .filter(s => s !== null); // 过滤掉 null
        
        console.log(`✅ 表头字段:`, headers);
        console.log(`✅ 原始行数: ${rows.length}, 有效学员数: ${cleanedData.length}`);
        
        if (cleanedData.length === 0) {
          console.log('❌ 没有识别到有效学员!');
          console.log('📋 请检查Excel:');
          console.log('   - 第2行必须是表头');
          console.log('   - 表头必须包含: 学生姓名/学员姓名, 下单手机号');
          console.log('   - 如果有"是否添加微信"列,只保留值为"是"的学员');
        }
        
        resolve(cleanedData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// 格式化期数为日期
function formatPeriodToDate(period) {
  if (!period) return '';
  const str = String(period).padStart(4, '0');
  const month = parseInt(str.slice(0, 2), 10);
  const day = parseInt(str.slice(2, 4), 10);
  return `${month}月${day}日`;
}

// 统一思维培养关注点
function normalizeThinkingFocus(value) {
  const normalized = THINKING_MAP[value];
  if (normalized) return normalized;
  
  if (value.includes('思维') || value.includes('逻辑') || value.includes('logical')) {
    return 'logic_enhancement';
  }
  if (value.includes('抗挫') || value.includes('困难') || value.includes('resilience')) {
    return 'resilience_training';
  }
  
  return 'other';
}

// 统计分析
export function analyzeData(students) {
  const cityDistribution = students.reduce((acc, s) => {
    acc[s.city] = (acc[s.city] || 0) + 1;
    return acc;
  }, {});
  
  const genderDistribution = students.reduce((acc, s) => {
    const gender = s.gender || '未知';
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {});
  
  const formStatus = {
    filled: students.filter(s => s.hasFilledForm).length,
    unfilled: students.filter(s => !s.hasFilledForm).length,
  };
  
  const thinkingFocusDistribution = students.reduce((acc, s) => {
    acc[s.thinkingFocus] = (acc[s.thinkingFocus] || 0) + 1;
    return acc;
  }, {});
  
  return {
    total: students.length,
    cityDistribution: Object.entries(cityDistribution).map(([name, value]) => ({ name, value })),
    genderDistribution: Object.entries(genderDistribution).map(([name, value]) => ({ name, value })),
    formStatus: [
      { name: '已填写', value: formStatus.filled },
      { name: '未填写', value: formStatus.unfilled },
    ],
    thinkingFocusDistribution: Object.entries(thinkingFocusDistribution).map(([name, value]) => ({ 
      name: name === 'logic_enhancement' ? '提升思维逻辑' : 
            name === 'resilience_training' ? '锻炼抗挫力' : '其他',
      value 
    })),
  };
}

// 获取所有期数
export function getAvailablePeriods(students) {
  const periods = [...new Set(students.map(s => s.period).filter(Boolean))];
  return periods.sort();
}

// 按期数筛选
export function filterByPeriod(students, period) {
  if (!period) return students;
  return students.filter(s => s.period === period);
}

// 按填写状态筛选
export function filterByFormStatus(students, status) {
  if (status === 'all') return students;
  if (status === 'filled') return students.filter(s => s.hasFilledForm);
  if (status === 'unfilled') return students.filter(s => !s.hasFilledForm);
  return students;
}

// 按手机号或姓名搜索
export function searchStudents(students, keyword) {
  if (!keyword || keyword.trim() === '') return students;
  const lowerKeyword = String(keyword).toLowerCase().trim();
  return students.filter(s => {
    const name = String(s.name || '').toLowerCase();
    const phone = String(s.phone || '');
    return name.includes(lowerKeyword) || phone.includes(keyword);
  });
}
