export interface LogEntry {
  timestamp: string;
  level: 'info' | 'debug' | 'warn' | 'error';
  component: string;
  action: string;
  message: string;
  metadata?: Record<string, any>;
}

class Logger {
  private logs: LogEntry[] = [];

  log(component: string, level: LogEntry['level'], action: string, message: string, metadata?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      component,
      action,
      message,
      metadata
    };

    this.logs.push(entry);
    
    // Console output for development
    const logMessage = `[${entry.timestamp}] ${entry.level.toUpperCase()} [${entry.component}] ${entry.action}: ${entry.message}`;
    
    switch (level) {
      case 'error':
        console.error(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'debug':
        console.debug(logMessage);
        break;
      default:
        console.log(logMessage);
    }

    if (metadata) {
      console.log('Metadata:', metadata);
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const logger = new Logger(); 