// src/lib/logger.ts
// 统一的日志工具，支持不同环境和日志级别

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

interface LogEntry {
  timestamp: string
  level: LogLevel
  requestId: string
  stage: string
  message: string
  data?: Record<string, unknown>
}

/**
 * 格式化日志条目
 */
function formatLog(entry: LogEntry): string {
  const { timestamp, level, requestId, stage, message, data } = entry
  let log = `[${timestamp}] [${level}] [${requestId}] [${stage}] ${message}`
  if (data && Object.keys(data).length > 0) {
    log += ` ${JSON.stringify(data)}`
  }
  return log
}

/**
 * 生成请求 ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
}

/**
 * 创建带时间戳和请求 ID 的日志条目
 */
function createLogEntry(
  level: LogLevel,
  requestId: string,
  stage: string,
  message: string,
  data?: Record<string, unknown>
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    requestId,
    stage,
    message,
    data,
  }
}

// 日志输出函数
const logger = {
  debug: (requestId: string, stage: string, message: string, data?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'production') return
    console.log(formatLog(createLogEntry('DEBUG', requestId, stage, message, data)))
  },

  info: (requestId: string, stage: string, message: string, data?: Record<string, unknown>) => {
    console.log(formatLog(createLogEntry('INFO', requestId, stage, message, data)))
  },

  warn: (requestId: string, stage: string, message: string, data?: Record<string, unknown>) => {
    console.warn(formatLog(createLogEntry('WARN', requestId, stage, message, data)))
  },

  error: (requestId: string, stage: string, message: string, data?: Record<string, unknown>) => {
    console.error(formatLog(createLogEntry('ERROR', requestId, stage, message, data)))
  },
}

export default logger
