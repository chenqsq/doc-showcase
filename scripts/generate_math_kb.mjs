import fs from 'node:fs';
import path from 'node:path';

const courseId = '高等数学_测试';
const subjectCategory = '数学';
const sourceType = 'AI生成演示版';
const version = 'v1.0';
const rootDir = path.resolve('kb', courseId);
const coreModules = new Set(['M00', 'M01', 'M02', 'M05']);

const modules = [
  ['M00', '预备补桥', 'CH00预备补桥', ['变量与符号', '函数是规则', '图像与变化'], '函数直觉入门', '函数直觉与图像感入门课', '字母感和图像感薄弱'],
  ['M01', '函数极限连续', 'CH01函数极限连续', ['极限直觉', '左右极限', '连续三条件'], '极限与函数值的区别', '极限与连续第一节', '极限只会套路不会解释'],
  ['M02', '导数与微分', 'CH02导数与微分', ['瞬时变化率', '求导法则', '微分近似'], '导数定义与变化率', '导数定义与求导法则入门课', '导数会算但不会解释'],
  ['M03', '导数应用与中值定理', 'CH03导数应用与中值定理', ['中值定理', '单调性', '极值判断'], '单调区间与极值分析', '', '极值点与驻点混淆'],
  ['M04', '不定积分', 'CH04不定积分', ['原函数', '换元法', '分部积分'], '换元积分的结构识别', '', '积分只会背表不会识别结构'],
  ['M05', '定积分及其应用', 'CH05定积分及其应用', ['累积量直觉', '牛顿莱布尼茨公式', '面积问题'], '定积分与面积应用', '定积分意义与面积应用课', '积分只会公式不会画图'],
  ['M06', '常微分方程', 'CH06常微分方程', ['变化率关系', '可分离变量', '通解与特解'], '一阶方程与初值', '', '把微分方程当代数方程'],
  ['M07', '向量代数与空间解析几何', 'CH07向量与空间解析几何', ['向量视角', '直线方程', '平面方程'], '法向量与平面方程', '', '方向向量和法向量混淆'],
  ['M08', '多元函数微分学', 'CH08多元函数微分学', ['偏导数', '全微分', '多元极值'], '偏导与全微分入门', '', '偏导与全导概念混淆'],
  ['M09', '重积分', 'CH09重积分', ['区域视角', '累次积分', '三重积分'], '先画区域再积分', '', '不会先看区域就写积分'],
  ['M10', '无穷级数', 'CH10无穷级数', ['收敛与发散', '判别法选择', '幂级数'], '等比级数与收敛', '', '还没判收敛就急着求和']
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function write(filePath, content) {
  const next = content.replace(/\r?\n/g, '\n');
  ensureDir(path.dirname(filePath));
  if (fs.existsSync(filePath)) {
    const current = fs.readFileSync(filePath, 'utf8').replace(/\r?\n/g, '\n');
    if (current === next) {
      return;
    }
  }
  fs.writeFileSync(filePath, next, 'utf8');
}

function meta({ moduleId, chapterId, kpId, resourceType, role = 'student', difficulty = '基础' }) {
  return [
    `> 学科大类(subject_category)：${subjectCategory}  `,
    `> 课程编号(course_id)：${courseId}  `,
    `> 模块编号(module_id)：${moduleId}  `,
    `> 章节编号(chapter_id)：${chapterId}  `,
    `> 知识点编号(knowledge_point_id)：${kpId}  `,
    `> 资源类型(resource_type)：${resourceType}  `,
    `> 难度(difficulty)：${difficulty}  `,
    `> 角色(role)：${role}  `,
    `> 来源类型(source_type)：${sourceType}  `,
    `> 版本(version)：${version}`
  ].join('\n');
}

function doc(title, metaBlock, sections) {
  return [`# ${title}`, '', metaBlock, '', ...sections].join('\n');
}

function nameFor(moduleId, moduleName, chapterId, resourceType, title) {
  return `${courseId}-${moduleId}${moduleName}-${chapterId}-${resourceType}-${title}.md`;
}

function renderKnowledgeCard(moduleId, moduleName, chapterId, topic, index, advanced = false) {
  const suffix = advanced ? '知识点卡-拓展' : '知识点卡';
  return doc(
    `${courseId}-${moduleName}-${suffix}-${topic}`,
    meta({
      moduleId,
      chapterId,
      kpId: `${moduleId}-KP-${String(index).padStart(2, '0')}`,
      resourceType: '知识点卡',
      difficulty: advanced ? '进阶' : '基础'
    }),
    [
      '## 一句话先记住',
      `> ${topic} 不只是一个公式标签，而是在回答这个模块中的一个核心问题。`,
      '',
      '## 它在解决什么',
      `- 它帮助学生把 ${moduleName} 从“背结论”推进到“理解结构”。`,
      `- 它也是后续题目判断与解释的基础语义。`,
      '',
      '## 人话解释',
      `${topic} 的关键不是机械套步骤，而是先看对象、关系和变化，再决定怎么表达。`,
      '',
      '## 典型理解方式',
      `- 先用一句人话说清 ${topic} 在问什么。`,
      `- 再把它连接到图像、变化率或累积量等直观概念。`,
      `- 最后再落到计算规则。`,
      '',
      '## 常见误区',
      `- 只记 ${topic} 的外形，不理解它在解决的问题。`,
      `- 会照着例子写，但换一个结构就不会。`,
      `- 不能把概念解释给别人听。`,
      '',
      '## 复习提示',
      `- 复习时先说清 ${topic} 的用途，再做一道最基础的同型题。`
    ]
  );
}

function renderExample(moduleId, moduleName, chapterId, title, topic) {
  return doc(
    `${courseId}-${moduleName}-例题讲解卡-${title}`,
    meta({
      moduleId,
      chapterId,
      kpId: `${moduleId}-EX-01`,
      resourceType: '例题讲解卡'
    }),
    [
      '## 题目',
      `围绕“${topic}”做一题样板讲解，重点不是追求复杂计算，而是看清题目结构。`,
      '',
      '## 先做诊断',
      `- 这题主要在考 ${topic}。`,
      `- 如果学生卡住，通常不是不会算，而是不知道该把题目归到哪个结构。`,
      '',
      '## 步骤讲解',
      '1. 先识别题目对象和已知条件。',
      '2. 再判断它对应的模块核心结构是什么。',
      '3. 根据结构选择最稳的处理方式。',
      '4. 最后回头解释每一步为什么成立。',
      '',
      '## 一题多变',
      '- 改变数字但保持结构不变。',
      '- 改成更口语化的问题，看是否还能识别同一结构。',
      '- 改成教师追问版，要求学生解释而不是只给答案。'
    ]
  );
}

function renderExercise(moduleId, moduleName, chapterId, topic) {
  const qs = [
    `请用一句人话解释“${topic}”。`,
    `围绕“${topic}”做 1 道基础判断题。`,
    `围绕“${topic}”做 1 道最小计算题。`,
    `围绕“${topic}”做 1 道“为什么这样做”的解释题。`
  ];
  return doc(
    `${courseId}-${moduleName}-练习与标准答案-样板练习`,
    meta({
      moduleId,
      chapterId,
      kpId: `${moduleId}-PRACTICE`,
      resourceType: '练习与标准答案'
    }),
    [
      '## 使用方式',
      '- 先答题，再看答案。',
      '- 评分时同时看结果和解释。',
      '',
      ...qs.flatMap((q, i) => [
        `### 练习 ${i + 1}`,
        q,
        '',
        '参考答案与评分点：',
        `答案应能正确使用 ${topic} 的基本概念，并说明为什么这样判断或计算。`,
        ''
      ]),
      '## 达标判断',
      '- 至少 3 题正确。',
      '- 至少 1 题能清楚说出思路。'
    ]
  );
}

function renderMistake(moduleId, moduleName, chapterId, risk) {
  return doc(
    `${courseId}-${moduleName}-错题与误区卡-${risk}`,
    meta({
      moduleId,
      chapterId,
      kpId: `${moduleId}-MISTAKE`,
      resourceType: '错题与误区卡'
    }),
    [
      '## 高频错误表现',
      `- ${risk}`,
      '- 只会背结论，不会说原因。',
      '- 题目结构一变化就不会迁移。',
      '',
      '## 为什么会错',
      '- 概念层没有打稳，直接上公式。',
      '- 不会先做结构识别，导致方法乱选。',
      '',
      '## 如何纠偏',
      '- 先回看章节导学和对应知识点卡。',
      '- 再做样板例题，看每一步为什么成立。',
      '- 最后用一道同型题检查是否真正理解。'
    ]
  );
}

function renderGuide(moduleId, moduleName, chapterId, topics, risk) {
  return doc(
    `${courseId}-${moduleName}-章节导学-模块总览`,
    meta({
      moduleId,
      chapterId,
      kpId: `${moduleId}-GUIDE`,
      resourceType: '章节导学'
    }),
    [
      '## 本模块学什么',
      `${moduleName} 的重点，是让学生先看清“这类问题到底在研究什么”，再进入计算和证明。`,
      '',
      '## 本模块知识骨架',
      ...topics.map((topic) => `- ${topic}`),
      '',
      '## 学完算达标',
      `- 能解释 ${topics[0]}。`,
      `- 能完成 1 道围绕 ${topics[1]} 的样板题。`,
      `- 遇到 ${moduleName} 问题时，知道先看结构再下手。`,
      '',
      '## 高频卡点',
      `- ${risk}`,
      '- 知道公式但不知道它在回答什么。',
      '- 题目稍微变形就失去方向。'
    ]
  );
}

function renderTeacherSummary(moduleId, moduleName, chapterId, risk) {
  return doc(
    `${courseId}-${moduleName}-教师运营摘要-风险与补讲建议`,
    meta({
      moduleId,
      chapterId,
      kpId: `${moduleId}-TEACHER`,
      resourceType: '教师运营摘要',
      role: 'teacher',
      difficulty: '运营'
    }),
    [
      '## 本模块教师侧重点',
      `- 当前模块：${moduleName}`,
      `- 高频风险：${risk}`,
      '',
      '## 课堂症状',
      '- 学生能算但解释不清。',
      '- 学生把不同结构混成一种套路。',
      '- 学生不会把图像、概念和步骤连起来。',
      '',
      '## 建议干预',
      '- 让学生先口述思路，再写步骤。',
      '- 用最小样板题做二次补桥。',
      '- 把课堂板书与知识点卡联动复盘。'
    ]
  );
}

function renderReconstruct(moduleId, moduleName, chapterId, classTitle, topics) {
  return doc(
    `${courseId}-${moduleName}-课堂重构笔记-${classTitle}`,
    meta({
      moduleId,
      chapterId,
      kpId: `${moduleId}-RECONSTRUCT`,
      resourceType: '课堂重构笔记'
    }),
    [
      '## 本节目标',
      `${classTitle} 的目标，是把 ${moduleName} 中最容易飘的概念重新讲成可复习、可检索的结构化笔记。`,
      '',
      '## 课堂主线',
      '1. 用一个生活化或图像化例子进入。',
      `2. 依次讲清 ${topics.join('、')}。`,
      '3. 用 1 道样板题把概念和步骤接起来。',
      '4. 用 1 组小练习检查是否能迁移。',
      '',
      '## 课后可沉淀内容',
      '- 知识点卡',
      '- 例题讲解卡',
      '- 错题与误区卡',
      '- 教师侧风险提示'
    ]
  );
}

function writeOverviews() {
  write(
    path.join(rootDir, '00-课程总览', `${courseId}-00课程总览-CH00整门课程-课程总览-高数_测试全景地图.md`),
    doc(
      `${courseId}-课程总览-高数_测试全景地图`,
      meta({
        moduleId: 'MALL',
        chapterId: 'CH00整门课程',
        kpId: 'COURSE-OVERVIEW',
        resourceType: '课程总览',
        difficulty: '总览'
      }),
      [
        '## 这门课在学什么',
        '高等数学_测试在训练学生理解变化、逼近、累积、空间表达和函数逼近的整套语言。',
        '',
        '## 全课程模块',
        ...modules.map(([moduleId, moduleName]) => `- ${moduleId} ${moduleName}`),
        '',
        '## 第一波优先',
        '- M00 预备补桥',
        '- M01 函数极限连续',
        '- M02 导数与微分',
        '- M05 定积分及其应用'
      ]
    )
  );

  write(
    path.join(rootDir, '00-课程总览', `${courseId}-00课程总览-CH00整门课程-章节导学-学习路径说明.md`),
    doc(
      `${courseId}-学习路径说明`,
      meta({
        moduleId: 'MALL',
        chapterId: 'CH00整门课程',
        kpId: 'COURSE-ROADMAP',
        resourceType: '章节导学',
        difficulty: '总览'
      }),
      [
        '## 学习路径',
        '- 基础薄弱：M00 -> M01 -> M02 -> M05',
        '- 同步课程：按 M00-M10 顺序推进',
        '- 期末复盘：优先看章节导学、错题与误区卡、课堂重构笔记',
        '',
        '## 三类场景',
        '- 学生问答：知识点卡 + 例题讲解卡',
        '- 教师运营：教师运营摘要 + 错题卡',
        '- 课堂重构：课堂重构笔记 + 后续转化资产'
      ]
    )
  );

  write(
    path.join(rootDir, 'T-教师运营', `${courseId}-T教师运营-CHT整门课程-教师运营摘要-总览.md`),
    doc(
      `${courseId}-教师运营总览`,
      meta({
        moduleId: 'T',
        chapterId: 'CHT整门课程',
        kpId: 'TEACHER-OVERVIEW',
        resourceType: '教师运营摘要',
        role: 'teacher',
        difficulty: '运营'
      }),
      [
        '## 第一版教师侧重点',
        '- 重点关注 M00、M01、M02、M05。',
        '- 重点识别“会算但不会解释”的假掌握。',
        '',
        '## 追踪维度',
        '- 是否能用人话解释概念',
        '- 是否能稳定完成样板题',
        '- 是否在同类结构上反复出错'
      ]
    )
  );

  write(
    path.join(rootDir, 'R-课堂重构', `${courseId}-R课堂重构-CHR整门课程-课堂重构笔记-总览.md`),
    doc(
      `${courseId}-课堂重构总览`,
      meta({
        moduleId: 'R',
        chapterId: 'CHR整门课程',
        kpId: 'RECONSTRUCT-OVERVIEW',
        resourceType: '课堂重构笔记',
        difficulty: '课堂'
      }),
      [
        '## 课堂重构目标',
        '把课堂上的碎片内容沉淀成课后可检索的正式知识资产。',
        '',
        '## 第一版优先课堂',
        '- 函数直觉与图像感入门课',
        '- 极限与连续第一节',
        '- 导数定义与求导法则入门课',
        '- 定积分意义与面积应用课'
      ]
    )
  );
}

function main() {
  writeOverviews();

  for (const [moduleId, moduleName, chapterId, topics, exampleTitle, classTitle, risk] of modules) {
    const dirName = `${moduleId}-${moduleName}`;
    write(path.join(rootDir, dirName, nameFor(moduleId, moduleName, chapterId, '章节导学', '模块总览')), renderGuide(moduleId, moduleName, chapterId, topics, risk));

    topics.forEach((topic, index) => {
      write(path.join(rootDir, dirName, nameFor(moduleId, moduleName, chapterId, '知识点卡', topic)), renderKnowledgeCard(moduleId, moduleName, chapterId, topic, index + 1));
    });

    write(path.join(rootDir, dirName, nameFor(moduleId, moduleName, chapterId, '例题讲解卡', exampleTitle)), renderExample(moduleId, moduleName, chapterId, exampleTitle, topics[0]));
    write(path.join(rootDir, dirName, nameFor(moduleId, moduleName, chapterId, '练习与标准答案', '样板练习')), renderExercise(moduleId, moduleName, chapterId, topics[0]));
    write(path.join(rootDir, dirName, nameFor(moduleId, moduleName, chapterId, '错题与误区卡', risk)), renderMistake(moduleId, moduleName, chapterId, risk));

    if (coreModules.has(moduleId)) {
      const advancedTopics = topics.map((topic, index) => `${topic} 的结构化理解 ${index + 1}`);
      advancedTopics.push(`${moduleName} 的跨题型迁移`);
      advancedTopics.forEach((topic, index) => {
        write(path.join(rootDir, dirName, nameFor(moduleId, moduleName, `${chapterId}-拓展`, '知识点卡', topic)), renderKnowledgeCard(moduleId, moduleName, `${chapterId}-拓展`, topic, index + 4, true));
      });

      write(path.join(rootDir, dirName, nameFor(moduleId, moduleName, chapterId, '例题讲解卡', `${exampleTitle}进阶一`)), renderExample(moduleId, moduleName, chapterId, `${exampleTitle}进阶一`, topics[1]));
      write(path.join(rootDir, dirName, nameFor(moduleId, moduleName, chapterId, '例题讲解卡', `${exampleTitle}进阶二`)), renderExample(moduleId, moduleName, chapterId, `${exampleTitle}进阶二`, topics[2]));
      write(path.join(rootDir, 'T-教师运营', nameFor(moduleId, moduleName, chapterId, '教师运营摘要', '风险与补讲建议')), renderTeacherSummary(moduleId, moduleName, chapterId, risk));
      write(path.join(rootDir, 'R-课堂重构', nameFor(moduleId, moduleName, chapterId, '课堂重构笔记', classTitle)), renderReconstruct(moduleId, moduleName, chapterId, classTitle, topics));
    }
  }

  let count = 0;
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else {
        count += 1;
      }
    }
  };
  walk(rootDir);
  console.log(`Generated ${count} markdown files under ${rootDir}`);
}

main();

