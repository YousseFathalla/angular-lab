import { Injectable, isDevMode } from '@angular/core';

/**
 * Centralized logging service.
 * - Logs to console with visual prefixes in Development mode.
 * - Suppressed in Production (can be extended to send logs to external services like Sentry).
 */
@Injectable({ providedIn: 'root' })
export class LogService {
  private readonly isDev = isDevMode();

  error(message: string, ...args: unknown[]): void {
    this.log('error', '🔴 [ERROR]', message, args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.log('warn', '🟠 [WARN]', message, args);
  }

  info(message: string, ...args: unknown[]): void {
    this.log('log', '🔵 [INFO]', message, args);
  }

  debug(message: string, ...args: unknown[]): void {
    this.log('debug', '🟢 [DEBUG]', message, args);
  }

  /**
   * Internal logging logic
   */
  private log(
    method: 'log' | 'warn' | 'error' | 'debug',
    prefix: string,
    message: string,
    args: unknown[]
  ): void {
    if (!this.isDev) {
      // Tip: This is where you'd hook in Sentry / AppInsights for Production
      // if (method === 'error') { sendToSentry(message, args); }
      return;
    }

    // Spread the args so they appear as expandable objects in the console
    if (args.length > 0) {
      console[method](`${prefix} ${message}`, ...args);
    } else {
      console[method](`${prefix} ${message}`);
    }
  }
}
