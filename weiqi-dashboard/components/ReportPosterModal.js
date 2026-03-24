import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { toPng } from 'html-to-image';

export default function ReportPosterModal({ student, report, onClose }) {
  const posterRef = useRef(null);
  const containerRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!posterRef.current || !containerRef.current) {
      alert('报告未加载完成，请稍后重试');
      return;
    }

    setIsDownloading(true);
    
    try {
      // 临时移除滚动限制，让完整内容可见
      const container = containerRef.current;
      const originalMaxHeight = container.style.maxHeight;
      const originalOverflow = container.style.overflow;
      
      container.style.maxHeight = 'none';
      container.style.overflow = 'visible';
      
      // 等待DOM更新
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 生成PNG图片（捕获完整的poster）
      const dataUrl = await toPng(posterRef.current, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true
      });

      // 恢复原来的样式
      container.style.maxHeight = originalMaxHeight;
      container.style.overflow = originalOverflow;

      // 下载图片
      const link = document.createElement('a');
      link.download = `围棋学情规划报告-${student['学员姓名'] || '学员'}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      
      alert('✅ 报告已成功下载！');
    } catch (error) {
      console.error('导出失败:', error);
      alert('❌ 导出失败，请重试\n错误：' + error.message);
      
      // 确保恢复样式
      if (containerRef.current) {
        containerRef.current.style.maxHeight = '';
        containerRef.current.style.overflow = '';
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部操作栏 */}
        <div className="sticky top-0 bg-white border-b p-4 rounded-t-3xl flex justify-between items-center z-10">
          <img 
            src="/logo-pure-transparent.png" 
            alt="网易 & 有道纵横"
            style={{ height: '30px', width: 'auto', minWidth: '150px', maxWidth: '200px', display: 'block' }}
          />
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className={`px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:shadow-lg transition-all ${isDownloading ? 'opacity-50 cursor-wait' : ''}`}
            >
              {isDownloading ? '生成中...' : '下载长图'}
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl px-3"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 海报主体 */}
        <div className="p-8">
          <ReportPoster ref={posterRef} student={student} report={report} />
        </div>
      </div>
    </div>
  );
}

// 海报组件(可单独打印)
const ReportPoster = React.forwardRef(({ student, report }, ref) => {
  return (
    <div
      ref={ref}
      className="relative bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 rounded-2xl shadow-2xl overflow-hidden"
      style={{ 
        minHeight: '1200px',
        width: '800px',
        maxWidth: '100%',
        margin: '0 auto'
      }}
    >
      {/* 顶部品牌标识 - 左上角固定 */}
      <div className="absolute top-6 left-6 z-10">
        <img 
          src="/logo-pure-transparent.png" 
          alt="网易 & 有道纵横"
          style={{ 
            height: '40px', 
            width: 'auto', 
            minWidth: '200px', 
            maxWidth: '260px', 
            display: 'block'
          }}
        />
      </div>

      {/* 标题区 */}
      <div className="text-center pt-20 py-10 px-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          {report.profile.title}
        </h1>
        <p className="text-xl text-gray-600">{report.profile.subtitle}</p>
      </div>

      {/* 主体内容区 */}
      <div className="px-8 pb-8 space-y-6">
        {/* A部分：现状分析 */}
        <ContentBlock
          icon="📊"
          title="现状分析"
          bgColor="bg-blue-50"
          borderColor="border-blue-300"
        >
          <div className="space-y-4">
            {report.currentAnalysis.map((item, i) => (
              <div key={i} className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-400">
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 mb-2">{item.title}</h4>
                    <p className="text-gray-700 leading-relaxed">{item.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ContentBlock>

        {/* B部分：课程匹配 */}
        <ContentBlock
          icon="🎯"
          title={report.courseMatch.title}
          bgColor="bg-green-50"
          borderColor="border-green-300"
        >
          <div className="mb-4 text-center">
            <p className="text-green-700 font-semibold text-lg">{report.courseMatch.subtitle}</p>
          </div>
          
          <div className="space-y-3 mb-6">
            {report.courseMatch.schedule.map((course, i) => (
              <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-orange-600 text-lg">{course.day}</span>
                  <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                    {course.time}
                  </span>
                </div>
                <h4 className="font-bold text-gray-800 mb-1 text-lg">{course.title}</h4>
                <p className="text-gray-600 text-sm">{course.content}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4">
            {report.courseMatch.highlights.map((item, i) => (
              <p key={i} className="text-green-800 font-medium text-sm mb-1">
                {item}
              </p>
            ))}
          </div>
        </ContentBlock>

        {/* C部分：预期价值 */}
        <ContentBlock
          icon="💡"
          title="预期价值"
          bgColor="bg-purple-50"
          borderColor="border-purple-300"
        >
          <div className="space-y-3">
            {report.expectedValue.map((item, i) => (
              <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 mb-1">{item.title}</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">{item.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ContentBlock>
      </div>

      {/* 底部版权信息 */}
      <div className="relative px-8 pb-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-orange-200 text-center">
          <p className="text-gray-700 text-lg font-medium mb-2">
            🌟 期待与您和孩子一起开启围棋学习之旅 🌟
          </p>
          <p className="text-gray-600">© 网易有道 · 专业教研团队 · 用心陪伴成长</p>
        </div>
      </div>
    </div>
  );
});

ReportPoster.displayName = 'ReportPoster';

// 内容块组件
function ContentBlock({ icon, title, bgColor, borderColor, children }) {
  return (
    <div className={`${bgColor} border-2 ${borderColor} rounded-xl overflow-hidden shadow-lg`}>
      <div className="bg-white bg-opacity-80 px-6 py-4 border-b-2 border-orange-200">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          {title}
        </h3>
      </div>
      <div className="px-6 py-6">{children}</div>
    </div>
  );
}
