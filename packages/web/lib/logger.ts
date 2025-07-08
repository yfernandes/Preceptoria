// Simple logging utility for the frontend
// In production, you might want to use a service like Sentry or LogRocket

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
  userId?: string;
  sessionId?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private sessionId = this.generateSessionId();

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private formatMessage(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      sessionId: this.sessionId,
    };
  }

  private log(level: LogLevel, message: string, data?: any): void {
    const entry = this.formatMessage(level, message, data);

    // In development, log to console with colors
    if (this.isDevelopment) {
      const colors = {
        debug: '\x1b[36m', // Cyan
        info: '\x1b[32m',  // Green
        warn: '\x1b[33m',  // Yellow
        error: '\x1b[31m', // Red
        reset: '\x1b[0m',  // Reset
      };

      console.log(
        `${colors[level]}[${level.toUpperCase()}]${colors.reset} ${entry.timestamp} - ${message}`,
        data ? data : ''
      );
    } else {
      // In production, you might want to send to a logging service
      // For now, we'll just use console methods
      switch (level) {
        case 'debug':
          console.debug(message, data);
          break;
        case 'info':
          console.info(message, data);
          break;
        case 'warn':
          console.warn(message, data);
          break;
        case 'error':
          console.error(message, data);
          break;
      }
    }

    // Store logs in localStorage for debugging (development only)
    if (this.isDevelopment) {
      this.storeLog(entry);
    }
  }

  private storeLog(entry: LogEntry): void {
    try {
      const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
      logs.push(entry);
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('app_logs', JSON.stringify(logs));
    } catch (error) {
      // Silently fail if localStorage is not available
    }
  }

  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: any): void {
    this.log('error', message, data);
  }

  // API logging helpers
  apiRequest(method: string, url: string, data?: any): void {
    this.info(`API Request: ${method} ${url}`, data);
  }

  apiResponse(method: string, url: string, status: number, data?: any): void {
    if (status >= 400) {
      this.error(`API Response: ${method} ${url} - ${status}`, data);
    } else {
      this.info(`API Response: ${method} ${url} - ${status}`, data);
    }
  }

  apiError(method: string, url: string, error: any): void {
    this.error(`API Error: ${method} ${url}`, error);
  }

  // User action logging
  userAction(action: string, data?: any): void {
    this.info(`User Action: ${action}`, data);
  }

  // Authentication logging
  authEvent(event: string, data?: any): void {
    this.info(`Auth Event: ${event}`, data);
  }

  // Error logging with stack trace
  errorWithStack(message: string, error: Error): void {
    this.error(message, {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  }

  // Get stored logs (for debugging)
  getStoredLogs(): LogEntry[] {
    try {
      return JSON.parse(localStorage.getItem('app_logs') || '[]');
    } catch {
      return [];
    }
  }

  // Clear stored logs
  clearStoredLogs(): void {
    localStorage.removeItem('app_logs');
  }

  // Export logs (for debugging)
  exportLogs(): string {
    return JSON.stringify(this.getStoredLogs(), null, 2);
  }
}

// Create singleton instance
export const logger = new Logger();

// Export types for use in other files
export type { LogLevel, LogEntry }; 