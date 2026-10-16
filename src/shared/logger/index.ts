type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  metadata?: Record<string, unknown>;
}

class Logger {
  private format(level: LogLevel, message: string, context?: string, metadata?: Record<string, unknown>): string {
    const payload: LogPayload = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(context ? { context } : {}),
      ...(metadata ? { metadata } : {}),
    };
    return JSON.stringify(payload);
  }

  debug(message: string, context?: string, metadata?: Record<string, unknown>) {
    if (process.env.NODE_ENV !== "production") {
      console.debug(this.format("debug", message, context, metadata));
    }
  }

  info(message: string, context?: string, metadata?: Record<string, unknown>) {
    console.info(this.format("info", message, context, metadata));
  }

  warn(message: string, context?: string, metadata?: Record<string, unknown>) {
    console.warn(this.format("warn", message, context, metadata));
  }

  error(message: string, context?: string, metadata?: Record<string, unknown>) {
    console.error(this.format("error", message, context, metadata));
  }
}

export const logger = new Logger();
