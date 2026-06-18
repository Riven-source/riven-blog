// src/app/books/[slug]/components/ChartRunner.tsx
'use client'

import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'

// 注册 Chart.js 全部组件（折线图、柱状图、饼图等）
Chart.register(...registerables)

export function ChartRunner({ script }: { script: string }) {
  const runKeyRef = useRef(0)
  const chartJsReady = useRef(false)

  // 仅首次挂载时将 Chart.js 暴露到全局作用域
  useEffect(() => {
    if (!chartJsReady.current) {
      (window as any).Chart = Chart
      chartJsReady.current = true
    }
  }, [])

  useEffect(() => {
    if (!script) return

    runKeyRef.current += 1
    const currentKey = runKeyRef.current

    // 使用微任务确保 Chart.js 全局注入在脚本执行前完成
    const frame = requestAnimationFrame(() => {
      if (runKeyRef.current !== currentKey) return

      try {
        // new Function 天然提供独立作用域，但可通过 window.Chart 访问全局 Chart.js
        const fn = new Function(script)
        fn()
      } catch {
        // 图表为锦上添花内容
      }
    })

    return () => cancelAnimationFrame(frame)
  }, [script])

  return null
}
