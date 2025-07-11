import { Request, Response, NextFunction } from 'express';

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

// Express middleware for request logging
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  logger.log('backend', 'info', 'request', `${req.method} ${req.path} received`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    query: req.query,
    body: req.method === 'POST' ? req.body : undefined
  });

  // Log response when it's sent
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.log('backend', 'info', 'response', `${req.method} ${req.path} completed`, {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length')
    });
  });

  next();
};

// Error logging middleware
export const errorLogger = (error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.log('backend', 'error', 'error', error.message, {
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });
  
  next(error);
}; 