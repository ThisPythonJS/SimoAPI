const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  gray: "\x1b[90m",
  white: "\x1b[37m",
};

const getTimestamp = () => {
  const now = new Date();
  return `${now.toLocaleDateString("pt-BR")} ${now.toLocaleTimeString("pt-BR")}`;
};

type LogLevel = "info" | "warn" | "error" | "debug" | "success";

interface LoggerConfig {
  enableTimestamp?: boolean;
  enableColors?: boolean;
  minLevel?: LogLevel;
}

const levelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  success: 2,
  warn: 3,
  error: 4,
};

class Logger {
  private config: Required<LoggerConfig>;

  constructor(config: LoggerConfig = {}) {
    this.config = {
      enableTimestamp: config.enableTimestamp ?? true,
      enableColors: config.enableColors ?? true,
      minLevel: config.minLevel ?? "debug",
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return levelPriority[level] >= levelPriority[this.config.minLevel];
  }

  private formatMessage(level: string, message: string, color: string): string {
    const timestamp = this.config.enableTimestamp
      ? `${colors.gray}[${getTimestamp()}]${colors.reset} `
      : "";

    const levelTag = this.config.enableColors
      ? `${color}${colors.bright}[${level}]${colors.reset}`
      : `[${level}]`;

    return `${timestamp}${levelTag} ${message}`;
  }

  info(message: string) {
    if (this.shouldLog("info")) {
      console.log(this.formatMessage("INFO", message, colors.cyan));
    }
  }

  warn(message: string) {
    if (this.shouldLog("warn")) {
      console.log(this.formatMessage("WARN", message, colors.yellow));
    }
  }

  error(message: string, error?: Error) {
    if (this.shouldLog("error")) {
      console.log(this.formatMessage("ERROR", message, colors.red));
      if (error && error.stack) {
        console.log(`${colors.gray}${error.stack}${colors.reset}`);
      }
    }
  }

  debug(message: string) {
    if (this.shouldLog("debug")) {
      console.log(this.formatMessage("DEBUG", message, colors.gray));
    }
  }

  success(message: string) {
    if (this.shouldLog("success")) {
      console.log(this.formatMessage("SUCCESS", message, colors.green));
    }
  }

  request(method: string, path: string, statusCode?: number) {
    const status = statusCode
      ? statusCode >= 400
        ? `${colors.red}${statusCode}${colors.reset}`
        : statusCode >= 300
        ? `${colors.yellow}${statusCode}${colors.reset}`
        : `${colors.green}${statusCode}${colors.reset}`
      : "";

    this.info(
      `${colors.bright}${method}${colors.reset} ${path}${status ? ` → ${status}` : ""}`
    );
  }

  database(message: string) {
    console.log(this.formatMessage("DATABASE", message, colors.blue));
  }

  cache(message: string) {
    console.log(this.formatMessage("CACHE", message, colors.magenta));
  }

  auth(message: string) {
    console.log(this.formatMessage("AUTH", message, colors.cyan));
  }

  worker(message: string) {
    console.log(this.formatMessage("WORKER", message, colors.magenta));
  }

  server(message: string) {
    console.log(this.formatMessage("SERVER", message, colors.blue));
  }
}

export const logger = new Logger();