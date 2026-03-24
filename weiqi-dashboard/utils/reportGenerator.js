// 少儿围棋学情报告生成引擎（全新版本）
export function generateReport(student) {
  if (!student) return null;

  const {
    name,
    age,
    gender,
    rawData,
  } = student;

  // 从原始数据中提取问卷字段
  const personality = rawData['学员性格'] || '';
  const weiqiExperience = rawData['围棋学习经历'] || '';
  const focusPoint = rawData['思维培养关注点'] || '';
  const attitude = rawData['胜负观'] || '';
  const problem = rawData['学围棋想解决的问题'] || '';
  const otherCourses = rawData['其他兴趣班'] || '';

  // 1. 基础画像
  const profile = {
    title: `${name}的围棋潜能评估报告`,
    subtitle: `${age} · ${gender}`,
  };

  // 2. A部分：现状分析（动态拼接）
  const currentAnalysis = generateCurrentAnalysis({
    personality,
    weiqiExperience,
    focusPoint,
    attitude,
    problem,
    name,
    gender,
  });

  // 3. B部分：课程匹配（固定内容）
  const courseMatch = generateCourseMatch();

  // 4. C部分：预期价值（动态拼接）
  const expectedValue = generateExpectedValue(otherCourses);

  return {
    profile,
    currentAnalysis,
    courseMatch,
    expectedValue,
  };
}

// A部分：现状分析（动态拼接）
function generateCurrentAnalysis({ personality, weiqiExperience, focusPoint, attitude, problem, name, gender }) {
  const sections = [];
  
  // 根据性别确定人称代词
  const pronoun = gender === '男孩' ? '他' : gender === '女孩' ? '她' : '孩子';

  // 1. 性格分析
  if (personality.includes('活泼好动') || personality.includes('活泼')) {
    sections.push({
      icon: '✨',
      title: '性格特征',
      content: `思维活跃是${name}的天赋，而专注与规则将是${pronoun}的翅膀。围棋"落子无悔"的智慧，将引导孩子从"反应快"进阶为"思考深"，养成谋定后动的强者习惯。`,
    });
  } else if (personality.includes('安静专注') || personality.includes('安静')) {
    sections.push({
      icon: '🧠',
      title: '性格特征',
      content: `沉稳专注是${name}的天赋底色，灵动应变将是${pronoun}的进阶翅膀。围棋的百变棋局，将引导孩子在深度思考中学会灵活转身，从"善于守成"进阶为"勇于创新"，实现思维的全面跃升。`,
    });
  }

  // 2. 围棋经历分析
  if (weiqiExperience.includes('完全没接触')) {
    sections.push({
      icon: '🌟',
      title: '学习阶段',
      content: `零基础是${name}的最佳起跑线。抓住启蒙黄金期，我们用游戏化课堂取代枯燥说教，在保护孩子天然兴趣的同时，植入最纯正的规则基因。让孩子在快乐中开启智慧之门，起步即正规，入门即热爱。`,
    });
  } else {
    sections.push({
      icon: '📈',
      title: '学习阶段',
      content: `有基础是${name}的优势，系统化将是${pronoun}的引擎。拒绝零散拼凑，我们致力于构建完整棋理框架。通过专业复盘找病灶、针对性训练破瓶颈，让孩子从"凭感觉下棋"进阶为"凭逻辑赢棋"。`,
    });
  }

  // 3. 核心诉求匹配
  const hasFocus = problem.includes('专注') || focusPoint.includes('专注');
  const hasResilience = problem.includes('抗挫') || attitude.includes('不接受输');

  if (hasFocus) {
    sections.push({
      icon: '⏰',
      title: '专注力培养',
      content: '如何让孩子从"好动"变"专注"？我们的秘诀藏在每一次"数气"和"计算"中。我们会温柔而坚定地引导孩子：落子前，请给大脑3-5秒的"黄金思考期"。这短短几秒的停顿，是克制冲动、凝聚心神的关键。日复一日的练习，将帮助孩子自然养成深思熟虑的习惯，让专注力像肌肉一样越来越强。',
    });
  }

  if (hasResilience) {
    sections.push({
      icon: '💪',
      title: '抗挫力提升',
      content: '围棋的胜负反馈机制，能让孩子在低成本的试错环境中，提前体验并学会处理挫折。通过专业的复盘引导，我们将孩子从"情绪化抱怨"转化为"理性问题解决者"。这种"输得起、赢得漂亮"的逆商特质，将是孩子未来应对学业压力和人生挑战最宝贵的软实力。',
    });
  }

  // 4. 思维能力分析
  if (problem.includes('思维') || problem.includes('逻辑') || focusPoint.includes('思维')) {
    sections.push({
      icon: '🧩',
      title: '思维能力',
      content: '围棋，是写给大脑的逻辑诗。每一步都是推理，每一局都是规划。在这里练就的全局观与预判力，是孩子未来征服数学与理科的隐形翅膀。今天棋盘上的深思熟虑，就是明天考场上的游刃有余。',
    });
  }

  return sections;
}

// B部分：课程匹配（固定内容）
function generateCourseMatch() {
  return {
    title: '专属推荐：3天启蒙集训营',
    subtitle: '',
    schedule: [
      {
        day: '第1课（周五）',
        title: '棋趣横生·数气对弈',
        content: '初识规则，深化"气"的核心，学会封堵气、吃子',
        time: '19:00-20:20',
      },
      {
        day: '第2课（周六）',
        title: '棋开得胜·思维具像化',
        content: '理解"逃跑与进攻"逻辑，提炼攻防思维模型',
        time: '19:00-20:20',
      },
      {
        day: '第3课（周日）',
        title: '棋逢对手·大招实战',
        content: '拆解围棋陷阱招式，真人对弈验收成果',
        time: '19:00-20:20',
      },
    ],
    highlights: [
      '✓ 趣味化教学，孩子坐得住',
      '✓ 直播授课，跟老师面对面',
      '✓ 课后复盘，巩固当天所学',
    ],
  };
}

// C部分：预期价值（动态拼接）
function generateExpectedValue(otherCourses) {
  const values = [];

  // 基础价值
  values.push({
    icon: '🎓',
    title: '学业提升',
    content: '围棋与数理学科之间存在深层的思维同构性。长期接受围棋训练的孩子，其逻辑链条的严密性与抽象思维的转化率显著优于同龄人。这不仅是兴趣培养，更是为理科学习构建了底层的思维操作系统，让成绩提升成为水到渠成的结果。',
  });

  // 与其他课程的互补性
  if (otherCourses) {
    const courses = otherCourses.toLowerCase();
    
    if (courses.includes('英语') || courses.includes('english')) {
      values.push({
        icon: '🌐',
        title: '与英语互补',
        content: '左手黑白逻辑，右手流利英语。围棋赋予的超强记忆力，是单词积累的高速引擎，以棋启智，让语言学习从此如虎添翼。',
      });
    }
    
    if (courses.includes('数学')) {
      values.push({
        icon: '🔢',
        title: '与数学协同',
        content: '围棋本身就是数学思维的体现——计算、推理、空间感。两者结合，孩子的逻辑运算区域活跃度会显著提升。',
      });
    }
    
    if (courses.includes('绘画') || courses.includes('美术')) {
      values.push({
        icon: '🎨',
        title: '与绘画平衡',
        content: '绘画培养右脑创造力，围棋锻炼左脑逻辑力。左右脑平衡发展，孩子的综合能力会更强。',
      });
    }
    
    if (courses.includes('舞蹈') || courses.includes('跆拳道') || courses.includes('体育')) {
      values.push({
        icon: '🤸',
        title: '与体育协同',
        content: '动如脱兔，练就强健体魄；静若处子，磨砺聪慧大脑。运动赋予生命活力，围棋赋予思想深度。动静相宜，方能成就"文武双全"的未来少年',
      });
    }
    
    if (courses.includes('钢琴') || courses.includes('乐器')) {
      values.push({
        icon: '🎹',
        title: '与音乐的融合',
        content: '音乐讲究节奏和和声，围棋强调节奏和时机。两者都需要对"timing"的精准把握，更能提升孩子的时间感知能力。',
      });
    }
    
    if (courses.includes('书法')) {
      values.push({
        icon: '🖌️',
        title: '与书法的相得益彰',
        content: '书法培养定力与耐心，围棋训练思维的灵动。一静一动，让孩子在沉稳中不失灵活，在思考中不失专注。',
      });
    }
  }

  // 长期价值
  values.push({
    icon: '🏆',
    title: '升学加分',
    content: '一张段位证，多条升学路。围棋特长，是综合素质评价的高分亮点，也是名校特长生选拔的优先通行证。以棋为梯，能帮助孩子轻松跨越升学门槛，赢在起跑线！',
  });

  return values;
}

// 生成销售话术 - 新版本(基于矩阵匹配)
export function generateSalesScript(student) {
  if (!student) return '';

  const name = student.name || '孩子';
  const gender = student.gender || '';
  const parentName = student.rawData['填写人'] || '家长';
  const relationship = student.rawData['与孩子关系'] || '';
  const personality = student.rawData['学员性格'] || '';
  const weiqiExperience = student.rawData['围棋学习经历'] || '';
  const attitude = student.rawData['胜负观'] || '';
  
  // 根据性别确定人称代词
  const pronoun = gender === '男孩' ? '他' : gender === '女孩' ? '她' : '孩子';
  
  // 判断称呼 - 使用"孩子昵称+关系"
  let greeting = `${parentName}`;
  if (relationship.includes('妈妈')) {
    greeting = `${name}妈妈`;
  } else if (relationship.includes('爸爸')) {
    greeting = `${name}爸爸`;
  } else if (relationship && relationship !== '其他' && !relationship.includes('其他')) {
    // 其他关系(非"其他"选项)使用"孩子昵称+关系"格式
    greeting = `${name}${relationship}`;
  } else {
    // "其他"关系或空值显示"{孩子昵称}家长"
    greeting = `${name}家长`;
  }

  // 判断性格类型
  const isActive = personality.includes('活泼') || personality.includes('好动');
  const isQuiet = personality.includes('安静') || personality.includes('专注');
  
  // 判断学习经历(零基础 vs 有基础)
  const isZeroBase = weiqiExperience.includes('完全没接触') || weiqiExperience.includes('学过简单');
  const hasBase = weiqiExperience.includes('定段考级') || weiqiExperience.includes('系统学习');
  
  // 判断胜负观
  const cannotAcceptLoss = attitude.includes('不接受输');
  const hasCalmMind = attitude.includes('平常心');
  
  // 根据矩阵匹配
  if (isActive && isZeroBase) {
    // 矩阵 A: 活泼好动 + 零基础
    return generateMatrixA(greeting, name, pronoun, cannotAcceptLoss, hasCalmMind);
  } else if (isActive && hasBase) {
    // 矩阵 B: 活泼好动 + 有基础
    return generateMatrixB(greeting, name, pronoun, cannotAcceptLoss, hasCalmMind);
  } else if (isQuiet && isZeroBase) {
    // 矩阵 C: 安静专注 + 零基础
    return generateMatrixC(greeting, name, pronoun, cannotAcceptLoss, hasCalmMind);
  } else if (isQuiet && hasBase) {
    // 矩阵 D: 安静专注 + 有基础
    return generateMatrixD(greeting, name, pronoun, cannotAcceptLoss, hasCalmMind);
  }
  
  // 默认情况(无法准确匹配时,使用安静+零基础)
  return generateMatrixC(greeting, name, pronoun, cannotAcceptLoss, hasCalmMind);
}

// 固定模块
const FIXED_COURSE_PLAN = `📌 专属安排：
我们的体验课为期3天，采用老师直播在线教学模式。课程全程游戏化设计，生动有趣，能牢牢抓住孩子的注意力。特别值得一提的是，我们不仅设有学生课堂，还专门开设了家长课堂，能帮助您和孩子更全面、清晰地了解孩子的围棋天赋与潜力。`;

// 矩阵 A: 活泼好动 + 零基础
function generateMatrixA(greeting, name, pronoun, cannotAcceptLoss, hasCalmMind) {
  let attitudeText = '';
  
  if (cannotAcceptLoss) {
    attitudeText = `\n您提到孩子比较在意输赢，这说明${pronoun}很有上进心！💪 在体验课中，我们会特意引导${pronoun}：围棋里的"输"只是暂时的，"被吃子"是为了学会如何反包围。我们会让${pronoun}明白，敢于面对失败并从中学习，比一直赢更重要。✨`;
  } else if (hasCalmMind) {
    attitudeText = `\n有平常心的心态是非常棒的～围棋正好能保护这份平常心，让孩子在黑白世界里享受思考的乐趣，不急不躁地进步。`;
  }
  
  const fixedClosing = `本周正好有体验课，要不趁这个机会，让孩子来试一次？🎯 体验课的设计初衷就是"让孩子自己发现乐趣"。如果${pronoun}说喜欢，那就是最好的答案；如果觉得不合适，就当多认识一种文化，也不吃亏。\n\n这周有空让孩子来看看吗？😊`;
  
  return `${greeting}您好～感谢填写宝贝的情况！我看孩子性格活泼，之前也没怎么系统学过围棋，这其实是个特别好的开始！🌱

活泼的孩子思维跳跃、反应快，这是学围棋的天赋！很多家长担心孩子坐不住，其实围棋不是枯燥的坐着，而是一场场"脑力闯关"🎮。对于这类孩子，我们要利用他爱玩的天性，通过有趣的规则让他自己愿意停下来思考。${attitudeText}

${FIXED_COURSE_PLAN}

${fixedClosing}`;
}

// 矩阵 B: 活泼好动 + 有基础
function generateMatrixB(greeting, name, pronoun, cannotAcceptLoss, hasCalmMind) {
  let attitudeText = '';
  
  if (cannotAcceptLoss) {
    attitudeText = `\n您提到孩子比较在意输赢，这其实是好事，说明他想赢。但在有基础后，这种心态如果太急，反而容易导致失误。在体验课中，老师会专门训练他"慢下来"的能力，教他在优势下如何稳住，在劣势下如何冷静寻找机会。我们要让他明白：真正的赢，不是靠手快，而是靠想得深、算得准。💡 这种沉稳的心态，比单纯的胜负结果更有价值。`;
  } else if (hasCalmMind) {
    attitudeText = `\n孩子有平常心很难得，结合他活泼的思维，这正是提升棋力的好时机。🌟体验课会重点打磨他的计算深度，让他学会在快节奏中也能保持严谨，把"感觉好"转化为实实在在的"实力强"。💪`;
  }
  
  const fixedClosing = `本周正好有体验课，要不趁这个机会，让孩子来试一次？🎯 体验课的设计初衷就是"让孩子自己发现乐趣"。如果${pronoun}说喜欢，那就是最好的答案；如果觉得不合适，就当多认识一种文化，也不吃亏。\n\n这周有空让孩子来看看吗？😊`;
  
  return `${greeting}您好${hasCalmMind ? '！' : '家长！'}看了孩子的情况，既有基础又性格活泼，这说明孩子对围棋是有感觉的！♟️ 不过针对这个阶段的活泼型孩子，我有几个专业的观察想跟您分享。

活泼的孩子反应快、棋感好，这是优势。👍 但因为有了一定基础，这类孩子容易因为思维太快而"急于落子"，导致计算不够深入，或者凭直觉下棋而忽略细节。现在的阶段，关键是把他的"快反应"转化为"深计算"，引导他在落子前多停顿思考，把基础打得更扎实。${attitudeText}

${FIXED_COURSE_PLAN}

${fixedClosing}`;
}

// 矩阵 C: 安静专注 + 零基础
function generateMatrixC(greeting, name, pronoun, cannotAcceptLoss, hasCalmMind) {
  let attitudeText = '';
  
  if (cannotAcceptLoss) {
    attitudeText = `\n您提到孩子比较怕输，安静的孩子往往心思细腻，更容易把"失误"放在心上。在体验课中，老师会营造非常轻松的氛围，告诉${pronoun}："围棋就是不断犯错又不断修正的游戏"。我们会让${pronoun}体验到，哪怕输了一子，只要后面下得好，依然可以赢回来。✨ 帮${pronoun}卸下心理包袱，变得更从容。`;
  } else if (hasCalmMind) {
    attitudeText = `\n有平常心的心态很难得，孩子本身就很沉稳，围棋会让这份特质发光。🌟 ${pronoun}会很自然地享受每一步的思考过程，在潜移默化中提升逻辑思维能力。`;
  }
  
  const fixedClosing = `本周正好有体验课，要不趁这个机会，让孩子来试一次？体验课的设计初衷就是"让孩子自己发现乐趣"。如果${pronoun}说喜欢，那就是最好的答案；如果觉得不合适，就当多认识一种文化，也不吃亏。\n\n这周有空让孩子来看看吗？😊`;
  
  return `${greeting}您好～感谢您的细致填写！看到孩子性格安静专注，我第一时间就觉得：孩子简直是天生适合学围棋的好苗子！🌱 这个特质在围棋学习上太珍贵了。

安静的孩子内心丰富、观察力强，能坐得住${cannotAcceptLoss ? '"冷板凳"' : '冷板凳'}。🧘 围棋不需要跑跳，需要的正是这种"静气"。对于零基础的孩子，我们不需要担心他坐不住，反而要鼓励他大胆落子，发现原来在这个安静的世界里，他可以掌控全局。♟️${attitudeText}

${FIXED_COURSE_PLAN}

${fixedClosing}`;
}

// 矩阵 D: 安静专注 + 有基础
function generateMatrixD(greeting, name, pronoun, cannotAcceptLoss, hasCalmMind) {
  let attitudeText = '';
  
  if (cannotAcceptLoss) {
    attitudeText = `\n您提到孩子很在意胜负，这在${pronoun}这个水平阶段，有时反而会成为包袱，让${pronoun}不敢下出好棋。体验课中，老师会专门教${pronoun}"弃子战术"——为了赢得整盘棋，必须敢于牺牲局部的利益。这会让${pronoun}明白：有时候"输"一点小地方，是为了赢下整个战场。🎯这种战略思维的提升，对${pronoun}性格也是一种很好的磨砺。`;
  } else if (hasCalmMind) {
    attitudeText = `\n孩子有平常心，加上扎实的基本功，现在正是突破瓶颈、提升棋力的最佳时机。🚀体验课会重点帮${pronoun}打破思维定势，让棋风更加灵动。✨`;
  }
  
  const fixedClosing = `本周正好有体验课，要不趁这个机会，让孩子来试一次？体验课的设计初衷就是"让孩子自己发现乐趣"。如果${pronoun}说喜欢，那就是最好的答案；如果觉得不合适，就当多认识一种文化，也不吃亏。\n\n这周有空让孩子来看看吗？😊`;
  
  return `${greeting}您好！我通过您的问卷初步了解了孩子的情况，既有安静的性格，又有系统学习的基础，这配置非常难得！✨ 不过针对这个阶段，我有一些专业的观察想跟您分享 ♟️

安静且有基础的孩子，通常基本功扎实、计算细腻。${hasCalmMind ? '👍 ' : ''}但这类孩子容易陷入误区：过于谨慎，甚至有点"怕输"，导致棋风偏保守，缺乏大局观和进攻魄力。现在的阶段，光靠"稳"不够了，需要帮他打开格局，学会"敢打敢拼"。💪${attitudeText}

${FIXED_COURSE_PLAN}

${fixedClosing}`;
}
