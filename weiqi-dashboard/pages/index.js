import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import { parseExcel, analyzeData, filterByPeriod, getAvailablePeriods, searchStudents } from '../utils/dataProcessor';
import { generateReport, generateSalesScript } from '../utils/reportGenerator';

export default function Home() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [availablePeriods, setAvailablePeriods] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  
  // 学员列表页的筛选状态
  const [studentListPeriod, setStudentListPeriod] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    console.log('🔄 开始上传文件:', file.name);
    
    try {
      const data = await parseExcel(file);
      console.log('📊 解析到的数据:', data);
      console.log('📊 数据条数:', data.length);
      
      if (!data || data.length === 0) {
        alert('文件解析成功但没有数据,请检查 Excel 文件格式');
        return;
      }
      
      setStudents(data);
      setFilteredStudents(data);
      
      const analysisResult = analyzeData(data);
      console.log('📈 分析结果:', analysisResult);
      setAnalysis(analysisResult);
      
      const periods = getAvailablePeriods(data);
      console.log('📅 可用期数:', periods);
      setAvailablePeriods(periods);
      
      setActiveTab('students');
      console.log('✅ 数据加载完成,切换到学员列表');
    } catch (error) {
      console.error('❌ 文件解析失败:', error);
      alert('文件解析失败: ' + error.message + '\n\n请检查文件格式是否正确');
    }
  };

  // 学员列表页的筛选(实时)
  const getFilteredStudentsForList = () => {
    let filtered = students;
    // 先按期数筛选
    if (studentListPeriod) {
      filtered = filterByPeriod(filtered, studentListPeriod);
    }
    // 再按搜索关键词筛选
    if (searchKeyword) {
      filtered = searchStudents(filtered, searchKeyword);
    }
    return filtered;
  };

  return (
    <>
      <Head>
        <title>围棋学员管理系统</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <nav className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg"></div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  围棋学员管理
                </span>
              </div>
              {students.length > 0 && (
                <>
                  <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                    <button onClick={() => setActiveTab('home')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'home' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600'}`}>首页</button>
                    <button onClick={() => setActiveTab('students')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'students' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600'}`}>学情规划</button>
                  </div>
                  <label className="cursor-pointer">
                    <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all">
                      <span className="text-sm font-medium">重新上传</span>
                    </div>
                    <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" />
                  </label>
                </>
              )}
            </div>
          </div>
        </nav>
        <AnimatePresence mode="wait">
          {activeTab === 'home' && <HomePage key="home" onUpload={handleFileUpload} />}
          {activeTab === 'students' && students.length > 0 && (
            <StudentsPage 
              key="students" 
              students={getFilteredStudentsForList()} 
              allStudents={students}
              availablePeriods={availablePeriods}
              selectedPeriod={studentListPeriod}
              searchKeyword={searchKeyword}
              onPeriodChange={setStudentListPeriod}
              onSearchChange={setSearchKeyword}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function HomePage({ onUpload }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }} 
      className="min-h-[80vh] flex items-center justify-center"
    >
      <div className="text-center max-w-3xl mx-auto px-4">
        <h1 className="text-6xl md:text-7xl font-bold mb-12">
          <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 bg-clip-text text-transparent">
            围棋潜能评估报告
          </span>
        </h1>
        
        <label className="cursor-pointer">
          <div className="inline-flex items-center space-x-3 px-10 py-5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-xl font-semibold">
            <span>📤</span>
            <span>上传 Excel 文件</span>
          </div>
          <input type="file" accept=".xlsx,.xls" onChange={onUpload} className="hidden" />
        </label>
      </div>
    </motion.div>
  );
}

// 全新的学情规划页面
function StudentsPage({ students, allStudents, availablePeriods, selectedPeriod, searchKeyword, onPeriodChange, onSearchChange }) {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef(null);

  // 当搜索到学员时，自动选中第一个
  useEffect(() => {
    if (students.length > 0) {
      setSelectedStudent(students[0]);
    } else {
      setSelectedStudent(null);
    }
  }, [students]);

  // 生成销售话术（使用新的生成器）
  const generateSalesScriptLocal = (student) => {
    if (!student) return '';
    return generateSalesScript(student);
  };

  // 复制话术到剪贴板
  const copyScript = () => {
    const script = generateSalesScriptLocal(selectedStudent);
    navigator.clipboard.writeText(script).then(() => {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    });
  };

  // 下载报告为PNG图片
  const downloadReportImage = async () => {
    if (!reportRef.current || !selectedStudent) {
      alert('❌ 没有报告内容可下载');
      return;
    }
    
    setDownloading(true);
    
    try {
      const container = reportRef.current;
      
      console.log('📸 开始生成报告图片...');
      console.log('📏 容器高度:', container.offsetHeight);
      console.log('📏 滚动高度:', container.scrollHeight);
      
      // 保存原始样式
      const originalMaxHeight = container.style.maxHeight;
      const originalOverflow = container.style.overflow;
      const originalHeight = container.style.height;
      
      // 移除高度和滚动限制，让内容完全展开
      container.style.maxHeight = 'none';
      container.style.height = 'auto';
      container.style.overflow = 'visible';
      
      // 强制重新计算布局
      container.offsetHeight;
      
      // 等待DOM完全展开
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('📏 展开后容器高度:', container.offsetHeight);
      
      // 生成PNG数据URL
      const dataUrl = await toPng(container, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: '#fff'
      });
      
      console.log('✅ 图片生成成功');
      
      // 恢复原样式
      container.style.maxHeight = originalMaxHeight;
      container.style.height = originalHeight;
      container.style.overflow = originalOverflow;
      
      // 下载图片
      const link = document.createElement('a');
      link.href = dataUrl;
      const studentName = selectedStudent['学员姓名'] || selectedStudent.name || '学员';
      link.download = `围棋学情规划报告-${studentName}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ 下载完成');
      alert('✅ 报告已成功下载！');
      
    } catch (error) {
      console.error('❌ 下载失败:', error);
      console.error('错误详情:', error.message, error.stack);
      alert(`❌ 下载失败: ${error.message || '未知错误'}\n\n请尝试刷新页面后重试`);
    } finally {
      setDownloading(false);
      
      // 确保恢复样式
      if (reportRef.current) {
        reportRef.current.style.maxHeight = '';
        reportRef.current.style.height = '';
        reportRef.current.style.overflow = '';
      }
    }
  };

  const selectedReport = selectedStudent ? generateReport(selectedStudent) : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-7xl mx-auto px-4 py-8">
      {/* 顶部搜索区 */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">🔍 搜索手机号</label>
            <input
              type="text"
              placeholder="输入手机号查找学员..."
              value={searchKeyword}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-lg"
            />
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          {students.length === 0 ? (
            <span className="text-red-500">未找到匹配的学员</span>
          ) : students.length === 1 ? (
            <span className="text-green-600">✓ 找到 1 位学员</span>
          ) : (
            <span className="text-orange-500">找到 {students.length} 位学员，请输入完整手机号精确查找</span>
          )}
        </div>
      </div>

      {/* 主内容区 */}
      {selectedStudent ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：报告预览 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">📊 学情规划报告</h3>
              <div className="text-sm text-gray-600">
                {selectedStudent.name} | {selectedStudent.phone}
              </div>
            </div>
            
            {/* 报告图片预览区 */}
            <div ref={reportRef} className="border-2 border-gray-200 rounded-xl overflow-hidden bg-gradient-to-br from-orange-50 to-yellow-50 max-h-[700px] overflow-y-auto">
              {selectedReport && (
                <ReportPreview student={selectedStudent} report={selectedReport} />
              )}
            </div>

            <button
              onClick={downloadReportImage}
              disabled={downloading}
              className={`mt-4 w-full px-6 py-3 rounded-xl font-semibold transition-all ${
                downloading
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg'
              }`}
            >
              {downloading ? '生成中...' : '📥 下载报告图片'}
            </button>
          </div>

          {/* 右侧：销售话术 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">💬 销售话术</h3>
              <button
                onClick={copyScript}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  copiedScript
                    ? 'bg-green-500 text-white'
                    : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                }`}
              >
                {copiedScript ? '✓ 已复制' : '📋 复制话术'}
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200 max-h-[600px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
                {generateSalesScriptLocal(selectedStudent)}
              </pre>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-800">
                <strong>💡 使用提示：</strong>
                <ul className="mt-2 space-y-1 ml-4">
                  <li>• 复制话术后，配合左侧报告图片一起发送</li>
                  <li>• 可根据实际情况微调话术内容</li>
                  <li>• 强调体验课的价值和限时机会</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-600 text-lg">请输入手机号搜索学员</p>
          <p className="text-sm text-gray-500 mt-2">找到学员后将自动生成学情规划报告和销售话术</p>
        </div>
      )}
    </motion.div>
  );
}

// 报告预览组件（简化版，显示报告的主要内容）
function ReportPreview({ student, report }) {
  return (
    <div className="relative p-6 bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50">
      {/* 顶部品牌标识 - 左上角固定 */}
      <div className="absolute top-4 left-4 z-10">
        <img 
          src="/logonew1.png" 
          alt="网易 & 有道纵横"
          style={{ 
            height: '40px', 
            width: 'auto',
            display: 'block',
            objectFit: 'contain'
          }}
        />
      </div>

      {/* 标题 */}
      <div className="mt-12 mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">{report.profile.title}</h1>
        <div className="text-xs text-gray-600">{report.profile.subtitle}</div>
      </div>

      {/* A部分：现状分析 */}
      <div className="mb-5">
        <h2 className="text-lg font-bold text-orange-700 mb-3 flex items-center gap-2">
          <span className="text-xl">📊</span>
          <span>现状分析</span>
        </h2>
        <div className="space-y-3">
          {report.currentAnalysis.map((item, i) => (
            <div key={i} className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-orange-400">
              <div className="flex items-start gap-2">
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-800 mb-1 text-sm">{item.title}</div>
                  <p className="text-xs text-gray-700 leading-relaxed break-words">{item.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* B部分：课程匹配 */}
      <div className="mb-5">
        <h2 className="text-lg font-bold text-orange-700 mb-2 flex items-center gap-2">
          <span className="text-xl">🎯</span>
          <span>{report.courseMatch.title}</span>
        </h2>
        <div className="text-xs text-orange-600 mb-3">{report.courseMatch.subtitle}</div>
        
        <div className="space-y-2 mb-3">
          {report.courseMatch.schedule.map((course, i) => (
            <div key={i} className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-orange-600 text-sm">{course.day}</span>
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">{course.time}</span>
              </div>
              <div className="font-semibold text-gray-800 mb-1 text-xs">{course.title}</div>
              <p className="text-xs text-gray-600 leading-snug break-words">{course.content}</p>
            </div>
          ))}
        </div>

        <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
          {report.courseMatch.highlights.map((item, i) => (
            <div key={i} className="text-xs text-orange-800 mb-0.5">{item}</div>
          ))}
        </div>
      </div>

      {/* C部分：预期价值 */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-orange-700 mb-3 flex items-center gap-2">
          <span className="text-xl">💡</span>
          <span>预期价值</span>
        </h2>
        <div className="space-y-2">
          {report.expectedValue.map((item, i) => (
            <div key={i} className="bg-white rounded-lg p-2 shadow-sm">
              <div className="flex items-start gap-2">
                <span className="text-base flex-shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 text-xs mb-0.5">{item.title}</div>
                  <p className="text-xs text-gray-600 leading-snug break-words">{item.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 底部版权信息 */}
      <div className="pt-4 text-center border-t border-orange-200">
        <div className="text-xs text-gray-500">© 网易有道 · 专业教研团队 · 用心陪伴成长</div>
      </div>
    </div>
  );
}

// 删除旧的StudentRow组件
