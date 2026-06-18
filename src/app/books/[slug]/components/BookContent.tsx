// src/app/books/[slug]/components/BookContent.tsx

// 将 CSS 提取为模块级常量，避免 React SSR 对 <style> 子文本的 HTML 编码
// （React 会将 ' 编码为 &#x27; 导致 hydration mismatch）
const BOOK_STYLES = `
.book-doc {
  font-family: var(--font-lora), 'Noto Serif SC', Georgia, serif;
  color: #3a3730;
  line-height: 1.88;
  font-size: 15px;
}
.book-doc h1 {
  font-family: var(--font-lora), Georgia, serif;
  font-size: 28px;
  text-align: center;
  margin-bottom: 6px;
  color: #1a1814;
  font-weight: 600;
}
.book-doc .subtitle {
  text-align: center;
  color: #7a7568;
  font-size: 13px;
  margin-bottom: 48px;
  line-height: 1.8;
}
.book-doc h2 {
  font-family: var(--font-lora), Georgia, serif;
  font-size: 20px;
  color: #6b4423;
  margin: 52px 0 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #c3b29f;
  font-weight: 600;
}
.book-doc h3 {
  font-family: var(--font-lora), Georgia, serif;
  font-size: 16px;
  color: #534033;
  margin: 28px 0 10px;
  font-weight: 600;
}
.book-doc h4 {
  font-family: var(--font-lora), Georgia, serif;
  font-size: 14px;
  color: #3a3730;
  margin: 18px 0 8px;
  font-weight: 600;
}
.book-doc p {
  margin: 10px 0;
  text-align: justify;
  color: #3a3730;
}
.book-doc a {
  color: #7d6249;
  text-decoration: underline;
}
.book-doc a:hover { color: #261d17; }

/* 定义块 — 蓝灰色左边框 */
.book-doc .def {
  background: #f0f4f7;
  border-left: 4px solid #534033;
  padding: 14px 18px;
  margin: 14px 0;
  border-radius: 0 6px 6px 0;
  font-size: 14px;
  line-height: 1.85;
}
.book-doc .def strong {
  color: #534033;
}

/* 推导/公式块 — 等宽字体，纸色背景 */
.book-doc .derive {
  background: #faf7f2;
  border: 1px solid #e0ccb5;
  padding: 16px 20px;
  margin: 14px 0;
  border-radius: 6px;
  font-family: var(--font-jetbrains), 'SF Mono', Menlo, monospace;
  font-size: 12.5px;
  white-space: pre-wrap;
  overflow-x: auto;
  line-height: 1.8;
  color: #3a3730;
}

/* 警告块 — 暖色左边框 */
.book-doc .warn {
  background: #fef9f4;
  border-left: 4px solid #b3551a;
  padding: 12px 16px;
  margin: 12px 0;
  border-radius: 0 6px 6px 0;
  font-size: 13px;
  color: #8b3a10;
  line-height: 1.8;
}

/* 案例块 — 绿色左边框 */
.book-doc .example {
  background: #f4faf4;
  border-left: 4px solid #2a7a3a;
  padding: 12px 16px;
  margin: 12px 0;
  border-radius: 0 6px 6px 0;
  font-size: 13px;
  line-height: 1.8;
}
.book-doc .example strong {
  color: #1a5a1a;
}

/* 引用块 */
.book-doc .quote {
  background: #f8f6f2;
  border-left: 4px solid #6b3a8a;
  padding: 12px 16px;
  margin: 12px 0;
  border-radius: 0 6px 6px 0;
  font-style: italic;
  font-size: 14px;
  color: #534033;
}
.book-doc .quote .src {
  display: block;
  text-align: right;
  color: #7a7568;
  font-size: 11px;
  margin-top: 6px;
  font-style: normal;
}

/* 章节总结 */
.book-doc .summary {
  background: #fdfaf5;
  border: 2px solid #c3b29f;
  border-radius: 8px;
  padding: 20px;
  margin: 28px 0;
}
.book-doc .summary h4 {
  color: #6b4423;
  margin-bottom: 8px;
  font-weight: 700;
}
.book-doc .summary ul {
  padding-left: 20px;
  font-size: 13px;
  line-height: 1.9;
}

/* 通用卡片 */
.book-doc .card {
  background: #fdfcfa;
  border: 1px solid #e0ccb5;
  border-radius: 6px;
  padding: 20px;
  margin: 16px 0;
}

/* 图表容器 */
.book-doc .chart-wrap {
  background: #fdfcfa;
  border: 1px solid #e0ccb5;
  border-radius: 6px;
  padding: 20px;
  margin: 20px 0;
  text-align: center;
}
.book-doc .chart-wrap canvas {
  max-width: 100%;
  display: block;
  margin: 0 auto;
}
.book-doc .fig-cap {
  font-size: 11.5px;
  color: #7a7568;
  text-align: center;
  margin-top: 8px;
  font-style: italic;
  line-height: 1.7;
}

/* 表格 */
.book-doc table {
  width: 100%;
  border-collapse: collapse;
  margin: 14px 0;
  font-size: 13px;
}
.book-doc th {
  background: #ede7de;
  padding: 8px 12px;
  text-align: left;
  font-weight: 700;
  border: 1px solid #d9cfc2;
  color: #534033;
}
.book-doc td {
  padding: 8px 12px;
  border: 1px solid #d9cfc2;
  color: #3a3730;
}
.book-doc tr:nth-child(even) td {
  background: #f7f4f0;
}

/* 行内公式 */
.book-doc .formula {
  display: inline-block;
  background: #f4ede2;
  padding: 1px 8px;
  border-radius: 4px;
  font-family: var(--font-jetbrains), 'SF Mono', Menlo, monospace;
  font-size: 12.5px;
  vertical-align: middle;
  color: #534033;
}

/* 假设列表 */
.book-doc .assume {
  font-size: 12px;
  margin: 6px 0 6px 20px;
  color: #7a7568;
  line-height: 1.8;
}
.book-doc .assume li {
  margin: 3px 0;
}

/* 公式表格 */
.book-doc .formula-table td:first-child {
  font-family: var(--font-jetbrains), 'SF Mono', Menlo, monospace;
  font-size: 12px;
  background: #fdfaf5;
}

/* 对比表格样式 */
.book-doc .compare th:first-child {
  background: #e0dacf;
}

/* 打印与移动端适配 */
@media print {
  .book-doc .sidebar { display: none; }
  .book-doc .main { margin-left: 0; max-width: 100%; padding: 18px; }
  .book-doc .card, .book-doc .chart-wrap { break-inside: avoid; }
}
@media (max-width: 768px) {
  .book-doc h1 { font-size: 22px; }
  .book-doc h2 { font-size: 17px; margin-top: 36px; }
  .book-doc .derive { font-size: 11px; padding: 12px 14px; }
  .book-doc table { font-size: 11px; }
  .book-doc th, .book-doc td { padding: 6px 8px; }
}
`;

interface BookContentProps {
  title: string
  html: string
  author: string
}

export function BookContent({ title, html, author }: BookContentProps) {
  return (
    <div className="book-doc">
      {/* 使用 dangerouslySetInnerHTML 注入样式，防止 React SSR 编码单引号等字符 */}
      <style dangerouslySetInnerHTML={{ __html: BOOK_STYLES }} />

      {/* 书籍标题与作者 */}
      <header className="mb-12 text-center">
        <h1 className="font-serif text-3xl sm:text-4xl text-ink-950 mb-2">{title}</h1>
        <p className="text-sm text-ink-400">{author}</p>
      </header>

      {/* 正文内容 */}
      <div
        className="book-doc"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
