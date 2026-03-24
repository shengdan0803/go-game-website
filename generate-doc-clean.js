const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign,
        HeadingLevel, LevelFormat, UnderlineType, PageBreak } = require('docx');

// 创建文档
const doc = new Document({
  styles: {
    default: {
      document: { run: { font: "Arial", size: 22 } }
    },
    paragraphStyles: [
      {
        id: "Title",
        name: "Title",
        basedOn: "Normal",
        run: { size: 48, bold: true, color: "2E5090", font: "Arial" },
        paragraph: { spacing: { before: 240, after: 180 }, alignment: AlignmentType.CENTER }
      },
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 32, bold: true, color: "2E5090", font: "Arial" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 }
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 28, bold: true, color: "4472C4", font: "Arial" },
        paragraph: { spacing: { before: 180, after: 100 }, outlineLevel: 1 }
      },
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 24, bold: true, color: "5B9BD5", font: "Arial" },
        paragraph: { spacing: { before: 120, after: 80 }, outlineLevel: 2 }
      }
    ]
  },
  numbering: {
    config: [
      {
        reference: "bullet-list",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "•",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } }
          }
        ]
      },
      {
        reference: "numbered-list-1",
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: "%1.",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } }
          }
        ]
      },
      {
        reference: "numbered-list-2",
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: "%1)",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } }
          }
        ]
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: [
      // 标题
      new Paragraph({
        heading: HeadingLevel.TITLE,
        children: [new TextRun("3-4月会员活动设计需求文档")]
      }),

      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 360 },
        children: [
          new TextRun({ text: "版本: 1.0", size: 20, color: "666666" })
        ]
      }),

      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 480 },
        children: [
          new TextRun({ text: "日期: 2026年3月", size: 20, color: "666666" })
        ]
      }),

      // 一、项目概述
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("一、项目概述")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("1.1 活动背景")]
      }),

      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun('本次活动旨在通过会员套餐,在全民阅读月和世界读书日期间,为用户提供超值的会员权益组合,覆盖阅读、思维和素质教育三大领域,实现用户增长和会员收入提升的双重目标。')
        ]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("1.2 活动时间")]
      }),

      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("活动周期: 2026年3月20日 - 2026年4月26日")]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("上线时间: 2026年3月20日前全面上线")]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        spacing: { after: 120 },
        children: [new TextRun("截止时间: 持续到4月26日(周日)")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("1.3 活动主题分阶段")]
      }),

      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: "阶段1 (3月20日-4月8日):", bold: true })]
      }),

      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("主题: 全民阅读月 / 春日阅读季")]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        spacing: { after: 120 },
        children: [new TextRun("口号: 会员买1得5限时开启")]
      }),

      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: "阶段2 (4月20日-4月26日):", bold: true })]
      }),

      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("主题: 世界读书日")]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        spacing: { after: 120 },
        children: [new TextRun("口号: 会员买1得5最后1周")]
      }),

      // 二、设计目标
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("二、设计目标")]
      }),

      new Paragraph({
        numbering: { reference: "numbered-list-1", level: 0 },
        children: [new TextRun({ text: "吸引用户注意:", bold: true }), new TextRun(" 通过醒目的视觉设计和清晰的价值主张,在APP内外多渠道吸引用户关注")]
      }),
      new Paragraph({
        numbering: { reference: "numbered-list-1", level: 0 },
        children: [new TextRun({ text: "传达价值:", bold: true }), new TextRun(' 清晰展示超值组合内容和299元的优惠价格')]
      }),
      new Paragraph({
        numbering: { reference: "numbered-list-1", level: 0 },
        children: [new TextRun({ text: "促进转化:", bold: true }), new TextRun(" 通过紧迫感营造和清晰的行动指引,提升购买转化率")]
      }),
      new Paragraph({
        numbering: { reference: "numbered-list-1", level: 0 },
        spacing: { after: 120 },
        children: [new TextRun({ text: "品牌一致性:", bold: true }), new TextRun(" 保持与品牌调性一致的设计风格,提升品牌认知度")]
      }),

      // 三、核心信息架构
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("三、核心信息架构")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("3.1 主标题 Slogan")]
      }),

      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun("根据不同渠道和场景,可选用以下slogan:")]
      }),

      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("299元,解锁孩子一整年的阅读+思维+素质课")]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("买1得5,一份会员搞定孩子全年成长")]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("阅读+思维+素质课,一站式成长会员")]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("阅读力×思维力×兴趣力,一次解锁")]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        spacing: { after: 120 },
        children: [new TextRun('买1得5,阅读+思维+素质课会员全家桶')]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("3.2 核心卖点")]
      }),

      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun({ text: "价格优势:", bold: true }), new TextRun(" 299元年费(原价需多倍)")]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun({ text: "内容丰富:", bold: true }), new TextRun(" 5大会员权益合一(有道少儿VIP + 围棋VIP + 数学思维VIP + 卡搭编程VIP + 阅读写作VIP)")]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun({ text: "时间紧迫:", bold: true }), new TextRun(" 限时活动,错过需等一年")]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        spacing: { after: 120 },
        children: [new TextRun({ text: "一站式解决:", bold: true }), new TextRun(" 阅读、思维、素质教育全覆盖")]
      }),

      // 四、设计需求分渠道
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("四、设计需求分渠道")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("4.1 APP内设计")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("4.1.1 首页弹窗")]
      }),

      createDesignTable("首页弹窗", [
        ["设计尺寸", "适配iOS和Android主流屏幕尺寸,建议750x1334px设计稿"],
        ["视觉风格", "春日/阅读主题,温暖明亮的色调,结合书籍、阅读场景等元素"],
        ["核心信息", "主标题+副标题+价格299元+立即抢购按钮"],
        ["动效要求", "入场动画:渐显+轻微缩放效果,关闭按钮右上角明显可见"],
        ["交互逻辑", "点击CTA按钮跳转至活动详情页,首次登录展示,每日最多展示1次"]
      ]),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("4.1.2 首页Banner")]
      }),

      createDesignTable("首页Banner", [
        ["设计尺寸", "750x300px(设计稿)"],
        ["视觉风格", "横幅式设计,左文右图或左右分栏结构"],
        ["核心信息", "主题标语+买1得5标识+限时标签+价格299元"],
        ["动效要求", "可选:轻微呼吸效果或闪烁提示"],
        ["交互逻辑", "点击跳转至活动详情页"]
      ]),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("4.1.3 活动详情页")]
      }),

      createDesignTable("活动详情页", [
        ["整体结构", "头部主视觉区+权益说明区+价格对比区+常见问题区+底部悬浮购买区"],
        ["头部主视觉", "大标题+活动时间+倒计时组件"],
        ["权益说明", "5个会员权益卡片式展示,每个权益包含图标、名称、核心功能介绍"],
        ["价格对比", "原价 vs 活动价对比,突出优惠力度"],
        ["CTA按钮", "底部悬浮立即购买按钮,颜色醒目"]
      ]),

      // 继续添加剩余内容...
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("五、视觉设计规范")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("5.1 色彩规范")]
      }),

      createColorTable(),

      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("六、交付物清单")]
      }),

      new Paragraph({
        numbering: { reference: "numbered-list-2", level: 0 },
        children: [new TextRun("所有设计稿源文件(Sketch/Figma/PS等)")]
      }),
      new Paragraph({
        numbering: { reference: "numbered-list-2", level: 0 },
        children: [new TextRun("切图资源包(PNG/SVG,@2x和@3x)")]
      }),
      new Paragraph({
        numbering: { reference: "numbered-list-2", level: 0 },
        children: [new TextRun("标注文档(尺寸、间距、颜色值)")]
      }),
      new Paragraph({
        numbering: { reference: "numbered-list-2", level: 0 },
        children: [new TextRun("动效说明文档或动效demo视频")]
      }),
      new Paragraph({
        numbering: { reference: "numbered-list-2", level: 0 },
        spacing: { after: 120 },
        children: [new TextRun("海报源文件及导出版本")]
      }),

      // 结尾
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 240 },
        children: [
          new TextRun({ text: "— 文档结束 —", size: 20, color: "999999", italics: true })
        ]
      })
    ]
  }]
});

// 辅助函数:创建设计需求表格
function createDesignTable(title, requirements) {
  const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
  const cellBorders = { top: border, bottom: border, left: border, right: border };

  const rows = requirements.map(([label, content]) => {
    return new TableRow({
      children: [
        new TableCell({
          borders: cellBorders,
          width: { size: 2340, type: WidthType.DXA },
          shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({
            children: [new TextRun({ text: label, bold: true, size: 22 })]
          })]
        }),
        new TableCell({
          borders: cellBorders,
          width: { size: 7020, type: WidthType.DXA },
          children: [new Paragraph({
            children: [new TextRun({ text: content, size: 22 })]
          })]
        })
      ]
    });
  });

  return new Table({
    columnWidths: [2340, 7020],
    margins: { top: 100, bottom: 100, left: 180, right: 180 },
    rows: rows
  });
}

// 色彩规范表格
function createColorTable() {
  const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
  const cellBorders = { top: border, bottom: border, left: border, right: border };

  return new Table({
    columnWidths: [3120, 3120, 3120],
    margins: { top: 100, bottom: 100, left: 180, right: 180 },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            borders: cellBorders,
            width: { size: 3120, type: WidthType.DXA },
            shading: { fill: "4472C4", type: ShadingType.CLEAR },
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "颜色名称", bold: true, size: 22, color: "FFFFFF" })]
            })]
          }),
          new TableCell({
            borders: cellBorders,
            width: { size: 3120, type: WidthType.DXA },
            shading: { fill: "4472C4", type: ShadingType.CLEAR },
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "色值", bold: true, size: 22, color: "FFFFFF" })]
            })]
          }),
          new TableCell({
            borders: cellBorders,
            width: { size: 3120, type: WidthType.DXA },
            shading: { fill: "4472C4", type: ShadingType.CLEAR },
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "使用场景", bold: true, size: 22, color: "FFFFFF" })]
            })]
          })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: cellBorders,
            width: { size: 3120, type: WidthType.DXA },
            children: [new Paragraph({ children: [new TextRun({ text: "主色调", size: 22 })] })]
          }),
          new TableCell({
            borders: cellBorders,
            width: { size: 3120, type: WidthType.DXA },
            children: [new Paragraph({ children: [new TextRun({ text: "#FF6B35", size: 22 })] })]
          }),
          new TableCell({
            borders: cellBorders,
            width: { size: 3120, type: WidthType.DXA },
            children: [new Paragraph({ children: [new TextRun({ text: "主CTA按钮、重点标识", size: 22 })] })]
          })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: cellBorders,
            width: { size: 3120, type: WidthType.DXA },
            children: [new Paragraph({ children: [new TextRun({ text: "辅助色", size: 22 })] })]
          }),
          new TableCell({
            borders: cellBorders,
            width: { size: 3120, type: WidthType.DXA },
            children: [new Paragraph({ children: [new TextRun({ text: "#FFC93C", size: 22 })] })]
          }),
          new TableCell({
            borders: cellBorders,
            width: { size: 3120, type: WidthType.DXA },
            children: [new Paragraph({ children: [new TextRun({ text: "装饰元素、背景渐变", size: 22 })] })]
          })
        ]
      })
    ]
  });
}

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/Users/cuichengdan/Desktop/Personal Page/3-4月会员活动设计需求文档.docx", buffer);
  console.log("✅ 设计需求文档已生成!");
});
