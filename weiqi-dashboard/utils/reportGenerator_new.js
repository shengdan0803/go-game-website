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
  
  // 判断称呼
  let greeting = `${parentName}`;
  if (relationship.includes('妈妈')) {
    greeting = `${name}妈妈`;
  } else if (relationship.includes('爸爸')) {
    greeting = `${name}爸爸`;
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
const FIXED_COURSE_PLAN = `📌 **专属安排：**
我们的体验课为期 **3天**，采用 **老师直播在线教学** 模式。课程全程 **游戏化设计**，生动有趣，能牢牢抓住孩子的注意力。特别值得一提的是，我们不仅设有 **学生课堂**，还专门开设了 **家长课堂**，能帮助您和孩子更全面、清晰地了解孩子的围棋天赋与潜力。`;

const FIXED_CLOSING = `本周正好有体验课，要不趁这个机会，让孩子来试一次？体验课的设计初衷就是"让孩子自己发现乐趣"。如果${pronoun}说喜欢，那就是最好的答案；如果觉得不合适，就当多认识一种文化，也不吃亏。这周有空让孩子来看看吗？😊`;

// 矩阵 A: 活泼好动 + 零基础
function generateMatrixA(greeting, name, pronoun, cannotAcceptLoss, hasCalmMind) {
  let attitudeText = '';
  
  if (cannotAcceptLoss) {
    attitudeText = `您提到孩子比较在意输赢，这说明${pronoun}有上进心！在体验课中，我们会特意引导${pronoun}：围棋里的'输'只是暂时的，'被吃子'是为了学会如何反包围。我们会让${pronoun}明白，敢于面对失败并从中学习，比一直赢更重要。`;
  } else if (hasCalmMind) {
    attitudeText = `您心态很好！围棋正好能保护这份平常心，让孩子在黑白世界里享受思考的乐趣，不急不躁地进步。`;
  }
  
  const fixedClosing = `本周正好有体验课，要不趁这个机会，让孩子来试一次？体验课的设计初衷就是"让孩子自己发现乐趣"。如果${pronoun}说喜欢，那就是最好的答案；如果觉得不合适，就当多认识一种文化，也不吃亏。这周有空让孩子来看看吗？😊`;
  
  return `${greeting}您好～感谢填写宝贝的情况！我看孩子性格活泼，这在围棋学习中其实是很大的优势——反应快、思维活跃的孩子往往更容易抓住棋局中的关键点。

【孩子画像】
${name}的"好动"特质，在我们这里会被重构为"反应快"和"思维活跃"。围棋的"落子无悔"规则，能有效帮助${pronoun}学会三思而后行。我们的体验课采用游戏化教学，每一步都设计成小挑战，刚好能吸引${pronoun}的注意力。${attitudeText}

${FIXED_COURSE_PLAN}

${fixedClosing}`;
}

// 矩阵 B: 活泼好动 + 有基础
function generateMatrixB(greeting, name, pronoun, cannotAcceptLoss, hasCalmMind) {
  let attitudeText = '';
  
  if (cannotAcceptLoss) {
    attitudeText = `您提到孩子输不起，这其实是很多好强孩子的通病。在体验课中，老师会专门设计'逆风局'，教${pronoun}如何在劣势下冷静寻找翻盘机会。我们要让${pronoun}明白：真正的强者不是不输，而是输了能立刻冷静下来找原因。这种'逆商'的培养，比多赢几盘棋更有价值。`;
  } else if (hasCalmMind) {
    attitudeText = `孩子有平常心很难得，结合${pronoun}的好胜心，这正是成为高手的潜质——既能全力争胜，又能坦然接受结果。体验课会重点打磨${pronoun}的战术执行力。`;
  }
  
  const fixedClosing = `本周正好有体验课，要不趁这个机会，让孩子来试一次？体验课的设计初衷就是"让孩子自己发现乐趣"。如果${pronoun}说喜欢，那就是最好的答案；如果觉得不合适，就当多认识一种文化，也不吃亏。这周有空让孩子来看看吗？😊`;
  
  return `${greeting}您好！研究了孩子的情况，我发现${name}是典型的"竞技型苗子"！

【孩子画像】
${name}性格活泼好动，又有一定围棋基础，这种组合非常难得。${pronoun}的"好胜"特质如果引导得当，会转化为强大的韧性和深度计算能力。${attitudeText}

${FIXED_COURSE_PLAN}

${fixedClosing}`;
}

// 矩阵 C: 安静专注 + 零基础
function generateMatrixC(greeting, name, pronoun, cannotAcceptLoss, hasCalmMind) {
  let attitudeText = '';
  
  if (cannotAcceptLoss) {
    attitudeText = `您提到孩子比较怕输，安静的孩子往往心思细腻，更容易把'失误'放在心上。在体验课中，老师会营造非常轻松的氛围，告诉${pronoun}：'围棋就是不断犯错又不断修正的游戏'。我们会让${pronoun}体验到，哪怕输了一子，只要后面下得好，依然可以赢回来。帮${pronoun}卸下心理包袱，变得更从容。`;
  } else if (hasCalmMind) {
    attitudeText = `孩子本身就很沉稳，围棋会让这份特质发光。${pronoun}会很自然地享受每一步的思考过程，在潜移默化中提升逻辑思维能力。`;
  }
  
  const fixedClosing = `本周正好有体验课，要不趁这个机会，让孩子来试一次？体验课的设计初衷就是"让孩子自己发现乐趣"。如果${pronoun}说喜欢，那就是最好的答案；如果觉得不合适，就当多认识一种文化，也不吃亏。这周有空让孩子来看看吗？😊`;
  
  return `${greeting}您好～感谢填写宝贝的情况！我注意到${name}性格偏安静专注，这在围棋学习中其实是天然的优势！

【孩子画像】
围棋是一项需要深度思考和专注力的运动，${name}的"安静专注"特质与围棋简直是天作之合。很多安静的孩子在围棋中能找到自信——不需要跑跳，只需要静下心来思考，就能在棋盘上展现自己的智慧。${attitudeText}

${FIXED_COURSE_PLAN}

${fixedClosing}`;
}

// 矩阵 D: 安静专注 + 有基础
function generateMatrixD(greeting, name, pronoun, cannotAcceptLoss, hasCalmMind) {
  let attitudeText = '';
  
  if (cannotAcceptLoss) {
    attitudeText = `您提到孩子很在意胜负，这在${pronoun}这个水平阶段，有时反而会成为包袱，让${pronoun}不敢下出好棋。体验课中，老师会专门教${pronoun}'弃子战术'——为了赢得整盘棋，必须敢于牺牲局部的利益。这会让${pronoun}明白：有时候'输'一点小地方，是为了赢下整个战场。这种战略思维的提升，对${pronoun}性格也是一种很好的磨砺。`;
  } else if (hasCalmMind) {
    attitudeText = `孩子有平常心，加上扎实的基本功，现在正是突破瓶颈、提升棋力的最佳时机。体验课会重点帮${pronoun}打破思维定势，让棋风更加灵动。`;
  }
  
  const fixedClosing = `本周正好有体验课，要不趁这个机会，让孩子来试一次？体验课的设计初衷就是"让孩子自己发现乐趣"。如果${pronoun}说喜欢，那就是最好的答案；如果觉得不合适，就当多认识一种文化，也不吃亏。这周有空让孩子来看看吗？😊`;
  
  return `${greeting}您好！仔细研究了${name}的情况，发现${pronoun}是那种"沉稳有内涵"的类型！

【孩子画像】
${name}性格安静专注，又有围棋基础，这说明${pronoun}的基本功应该是比较扎实的。现在${pronoun}可能遇到了一个瓶颈期——过于谨慎、不敢大胆进攻。体验课会专门针对这一点，帮助${pronoun}提升大局观和进攻意识。${attitudeText}

${FIXED_COURSE_PLAN}

${fixedClosing}`;
}
