// CSS 模块类型声明
declare module '*.css' {
  const content: { [className: string]: string }
  export default content
}
