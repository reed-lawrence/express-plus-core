import { LoggingLevel } from "./api-server";

export interface IServerEnvironment {
  /**
   * Port to specify. Env variable: process.env.PORT
   */
  port?: string;

  /**
   * Debug mode. Env variable: process.env.NODE_ENV
   */
  debug?: boolean;

  /**
   * @default LoggingLevel.limited
   * @example 
   * LoggingLevel.none // No logs will be written to the std output
   * LoggingLevel.limited  // Only ciritcal logs will be output
   * LoggingLevel.verbose // All logs will be output
   */
  logging?: LoggingLevel
}

export class ServerEnvironment implements IServerEnvironment {
  public port: string = process.env.PORT || '80';
  public debug: boolean = process.env.NODE_ENV === 'development';
  public logging: LoggingLevel = LoggingLevel.limited;
  constructor(init?: Partial<IServerEnvironment>) {
    if (init) {
      if (init.logging) { this.logging = init.logging; }
      if (init.port) { this.port = init.port; }
      if (init.debug) { this.debug = init.debug; }
    }
  }
}
