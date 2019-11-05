export interface IServerEnvironment {
  port: string;
  debug: boolean;
}

export class ServerEnvironment implements IServerEnvironment {
  port: string = process.env.PORT || '80';
  debug: boolean = process.env.NODE_ENV === 'development';
  constructor(init?: Partial<IServerEnvironment>) {
    if (init) {
      if (init.port) { this.port = init.port };
      if (init.debug) { this.debug = init.debug };
    }
  }
}
