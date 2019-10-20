import { EmailAddress } from "../core/decorations/email-address";

export interface IExampleObject {
  id: number;
  value: string;
  value2: string;
}

export class ExampleObject implements IExampleObject {
  id: number;

  @EmailAddress()
  value: string;

  @EmailAddress()
  value2: string;

  constructor(init?: IExampleObject) {
    this.id = init ? init.id : 0;
    this.value = init ? init.value : '';
    this.value2 = init ? init.value2 : '';
  }
}