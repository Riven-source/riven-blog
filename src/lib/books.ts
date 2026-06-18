// src/lib/books.ts
import fs from 'fs'
import path from 'path'

export interface BookMeta {
  slug: string
  title: string
  author: string
  category: string
  file: string
  description: string
}

export const books: BookMeta[] = [
  // ==================== 经济学 ====================
  {
    slug: 'mankiw-microeconomics',
    title: '微观经济学分册',
    author: 'N. Gregory Mankiw',
    category: '经济学',
    file: 'mankiw_microeconomics.html',
    description: '曼昆《经济学原理》微观分册第8版，系统讲解供需理论、弹性、市场效率、生产成本、市场结构等核心模型。',
  },
  {
    slug: 'mankiw-macroeconomics',
    title: '宏观经济学分册',
    author: 'N. Gregory Mankiw',
    category: '经济学',
    file: 'mankiw_macroeconomics.html',
    description: '曼昆《经济学原理》宏观分册第8版，涵盖 GDP 核算、通胀、货币制度、总需求与总供给，从微观基础延伸至宏观整体分析。',
  },
  {
    slug: 'poor-economics',
    title: '贫穷经济学',
    author: 'Banerjee & Duflo',
    category: '经济学',
    file: 'poor_economics.html',
    description: '2019 年诺贝尔经济学奖得主代表作，以随机对照实验重新思考全球贫困的根源与解决路径。',
  },
  {
    slug: 'wealth-of-nations',
    title: '国富论',
    author: 'Adam Smith',
    category: '经济学',
    file: 'wealth_of_nations.html',
    description: '亚当·斯密奠基之作，完整梳理分工理论、市场机制与看不见的手等古典经济学核心思想。',
  },
  {
    slug: 'das-kapital',
    title: '资本论',
    author: 'Karl Marx',
    category: '经济学',
    file: 'das_kapital.html',
    description: '马克思政治经济学体系完整拆解：商品二重性、剩余价值、资本积累与危机理论，学术标准深度研读。',
  },
  {
    slug: 'game-theory',
    title: '博弈论全体系',
    author: 'Von Neumann, Nash 等',
    category: '经济学',
    file: 'game_theory.html',
    description: '正统博弈论完整教程——囚徒困境、纳什均衡、子博弈精炼、贝叶斯博弈、信号传递，含全部矩阵推导与博弈树。',
  },
  {
    slug: 'great-powers',
    title: '大国的兴衰',
    author: 'Paul Kennedy',
    category: '经济学',
    file: 'great_powers.html',
    description: '五百年霸权更替的宏观长周期分析，国力制衡、经济基础与军事扩张之间的历史规律与当代启示。',
  },

  // ==================== 心理学 ====================
  {
    slug: 'zimbardo-psychology',
    title: '普通心理学',
    author: 'Philip Zimbardo',
    category: '心理学',
    file: 'zimbardo_psychology.html',
    description: '津巴多《普通心理学》第8版含 DSM-5，覆盖认知、发展、社会、临床等心理学全领域的系统自学教材。',
  },
  {
    slug: 'crowd-psychology',
    title: '乌合之众',
    author: 'Gustave Le Bon',
    category: '心理学',
    file: 'crowd_psychology.html',
    description: '社会心理学经典开山之作，揭示个体理性到群体非理性的转化机制、领袖操控术与群体信念传播法则。',
  },
  {
    slug: 'developmental-psychology',
    title: '发展心理学',
    author: 'Developmental Psychology',
    category: '心理学',
    file: 'developmental_psychology.html',
    description: '毕生心理成长完整体系——从胎儿期到终老的认知、情感与社会性发展规律，Piaget/Vygotsky 核心理论。',
  },
  {
    slug: 'myers-social-psychology',
    title: '迈尔斯社会心理学',
    author: 'David Myers',
    category: '心理学',
    file: 'myers_social_psychology.html',
    description: '全球权威社会心理学教材，社会认知、从众、说服、偏见、攻击、吸引与利他行为的系统理论体系。',
  },
  {
    slug: 'kahneman-decision',
    title: '卡尼曼决策与认知',
    author: 'Daniel Kahneman',
    category: '心理学',
    file: 'kahneman_decision.html',
    description: '诺贝尔经济学奖得主卡尼曼的认知决策体系——系统1与系统2、前景理论、启发式偏差与有限理性。',

  // ==================== 哲学与社会 ====================
  },
  {
    slug: 'plato-republic',
    title: '理想国',
    author: 'Plato',
    category: '哲学与社会',
    file: 'plato_republic.html',
    description: '柏拉图西方政治哲学奠基之作，正义、灵魂三分与理想城邦的完整构建，秩序博弈的底层逻辑探讨。',
  },
  {
    slug: 'tao-te-ching',
    title: '道德经',
    author: '老子',
    category: '哲学与社会',
    file: 'tao_te_ching.html',
    description: '东方辩证系统博弈顶层体系，全81章深度研读——道法自然、无为而治、阴阳辩证的终极智慧框架。',
  },
  {
    slug: 'from-the-soil',
    title: '乡土中国',
    author: '费孝通',
    category: '哲学与社会',
    file: 'from_the_soil.html',
    description: '中式社会底层逻辑的经典剖析——差序格局、人情博弈、礼治秩序与乡土伦理，理解中国社会的必读之作。',
  },
  {
    slug: 'tocqueville-old-regime',
    title: '旧制度与大革命',
    author: 'Alexis de Tocqueville',
    category: '哲学与社会',
    file: 'tocqueville_old_regime.html',
    description: '托克维尔制度演化经典——阶层流动、民心变迁、改革触发革命的历史悖论，对现代社会的深刻洞见。',
  },

  // ==================== 逻辑学 ====================
  {
    slug: 'copi-logic',
    title: '逻辑学导论',
    author: 'Irving M. Copi',
    category: '逻辑学',
    file: 'copi_logic.html',
    description: '柯匹经典逻辑学教材——命题逻辑、谓词逻辑、归纳推理、非形式谬误，培养严谨思维底层能力。',
  },
]

export function getBookBySlug(slug: string): BookMeta | undefined {
  return books.find((b) => b.slug === slug)
}

export interface TocItem {
  id: string
  text: string
  level: number
}

/** 结构化目录：章节 + 小节 */
export interface TocChapter {
  id: string
  label: string
  items: { id: string; label: string }[]
}

/** 曼昆《宏观经济学分册》第8版 完整章节目录（第23–36章） */
export const MACRO_TOC: TocChapter[] = [
  { id: 'ch1', label: '第23章 一国收入的衡量', items: [
    { id: 'ch1-1', label: '23.1 GDP的组成部分' },
    { id: 'ch1-2', label: '23.2 GDP的局限性' },
  ]},
  { id: 'ch2', label: '第24章 生活费用的衡量', items: [
    { id: 'ch2-1', label: '24.1 CPI的计算步骤' },
    { id: 'ch2-2', label: '24.2 关键换算公式' },
  ]},
  { id: 'ch3', label: '第25章 生产与增长', items: [
    { id: 'ch3-1', label: '25.1 生产函数与增长源泉' },
    { id: 'ch3-2', label: '25.2 索洛增长模型概要' },
    { id: 'ch3-3', label: '25.3 经济增长的政策推动' },
  ]},
  { id: 'ch4', label: '第26章 储蓄投资与金融体系', items: [
    { id: 'ch4-1', label: '26.1 储蓄与投资恒等式' },
    { id: 'ch4-2', label: '26.2 可贷资金市场' },
  ]},
  { id: 'ch5', label: '第27章 金融学基本工具', items: [
    { id: 'ch5-1', label: '27.1 现值与贴现' },
    { id: 'ch5-2', label: '27.2 风险管理' },
  ]},
  { id: 'ch6', label: '第28章 失业', items: [
    { id: 'ch6-1', label: '28.1 失业的类型' },
    { id: 'ch6-2', label: '28.2 奥肯定律' },
    { id: 'ch6-3', label: '28.3 最低工资与效率工资' },
  ]},
  { id: 'ch7', label: '第29章 货币制度', items: [
    { id: 'ch7-1', label: '29.1 货币供给的衡量' },
    { id: 'ch7-2', label: '29.2 银行体系与货币创造' },
  ]},
  { id: 'ch8', label: '第30章 货币增长与通货膨胀', items: [
    { id: 'ch8-1', label: '30.1 货币数量论' },
    { id: 'ch8-2', label: '30.2 通货膨胀的代价' },
    { id: 'ch8-3', label: '30.3 费雪效应' },
  ]},
  { id: 'ch9', label: '第31章 开放经济基本概念', items: [
    { id: 'ch9-1', label: '31.1 国际交易恒等式' },
    { id: 'ch9-2', label: '31.2 购买力平价' },
  ]},
  { id: 'ch10', label: '第32章 开放经济理论', items: [
    { id: 'ch10-1', label: '32.1 双市场同时均衡' },
    { id: 'ch10-2', label: '32.2 蒙代尔-弗莱明模型' },
  ]},
  { id: 'ch11', label: '第33章 总需求与总供给', items: [
    { id: 'ch11-1', label: '33.1 AD向下倾斜的原因' },
    { id: 'ch11-2', label: '33.2 SRAS与LRAS' },
    { id: 'ch11-3', label: '33.3 需求冲击与供给冲击' },
    { id: 'ch11-4', label: '33.4 需求政策与供给政策' },
  ]},
  { id: 'ch12', label: '第34章 货币政策与财政政策对AD的影响', items: [
    { id: 'ch12-1', label: '34.1 货币政策传导机制' },
    { id: 'ch12-2', label: '34.2 财政乘数与挤出效应' },
  ]},
  { id: 'ch13', label: '第35章 通胀与失业的短期权衡', items: [
    { id: 'ch13-1', label: '35.1 菲利普斯曲线的推导' },
    { id: 'ch13-2', label: '35.2 预期与牺牲率' },
  ]},
  { id: 'ch14', label: '第36章 宏观政策争论', items: [
    { id: 'ch14-1', label: '36.1 六个政策争论' },
    { id: 'ch14-2', label: '36.2 泰勒规则' },
  ]},
]

export interface BookContentData {
  title: string
  html: string
  headings: TocItem[]
  script: string
}

export function getBookContent(slug: string): BookContentData | null {
  const book = getBookBySlug(slug)
  if (!book) return null

  const filePath = path.join(process.cwd(), 'web_doc', book.file)
  if (!fs.existsSync(filePath)) return null

  let raw = fs.readFileSync(filePath, 'utf-8')

  // 提取标题
  const h1Match = raw.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  const fullTitle = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : book.title

  // 提取所有分级标题用于 TOC
  const headings: TocItem[] = []
  const headingRegex = /<h([23])\s+id="([^"]+)"[^>]*>([\s\S]*?)<\/h[23]>/gi
  let match: RegExpExecArray | null
  while ((match = headingRegex.exec(raw)) !== null) {
    headings.push({
      id: match[2],
      text: match[3].replace(/<[^>]+>/g, '').trim(),
      level: parseInt(match[1]),
    })
  }

  // 提取 <script> 内容（Canvas 图表代码）
  const scriptMatch = raw.match(/<script>([\s\S]*?)<\/script>/i)
  const script = scriptMatch ? scriptMatch[1].trim() : ''

  // 移除 <style> 块
  raw = raw.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')

  // 移除原始侧边栏导航
  raw = raw.replace(/<nav\s+class="sidebar"[^>]*>[\s\S]*?<\/nav>/gi, '')

  // 移除 <script> 块（我们会通过客户端组件单独执行）
  raw = raw.replace(/<script>[\s\S]*?<\/script>/gi, '')

  // 提取 <body> 内容
  const bodyMatch = raw.match(/<body[^>]*>([\s\S]*)<\/body>/i)
  let html = bodyMatch ? bodyMatch[1].trim() : raw

  // 清理残留的 HTML 注释分隔线
  html = html.replace(/<!--\s*=+\s*第\d+章\s*=+\s*-->/g, '')

  // 去除 HTML 内容中自带的 h1 标题和 subtitle（避免与 BookContent header 重复）
  html = html.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '')
  html = html.replace(/<p\s+class="subtitle"[^>]*>[\s\S]*?<\/p>/i, '')

  return { title: fullTitle, html, headings, script }
}

/** 按类别分组书籍 */
export function getBooksByCategory(): Record<string, BookMeta[]> {
  const groups: Record<string, BookMeta[]> = {}
  for (const book of books) {
    if (!groups[book.category]) groups[book.category] = []
    groups[book.category].push(book)
  }
  return groups
}
