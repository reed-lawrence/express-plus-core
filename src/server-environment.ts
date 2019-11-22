export interface IServerEnvironment {
  port: string;
  debug: boolean;
}

export class ServerEnvironment implements IServerEnvironment {
  public port: string = process.env.PORT || '80';
  public debug: boolean = process.env.NODE_ENV === 'development';
  constructor(init?: Partial<IServerEnvironment>) {
    if (init) {
      if (init.port) { this.port = init.port; }
      if (init.debug) { this.debug = init.debug; }
    }
  }
}
