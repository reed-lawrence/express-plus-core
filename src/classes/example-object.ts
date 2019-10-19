import { EmailAddress } from "../core/decorations/email-address";

export interface IExampleObject {
  id: number;
  value: string;
}

export class ExampleObject implements IExampleObject {
  id: number;

  @EmailAddress()
  value: string;

  constructor(init?: IExampleObject) {
    this.id = init ? init.id : 0;
    this.value = init ? init.value : '';
  }
}