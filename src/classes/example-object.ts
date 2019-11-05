import { Required } from "../core/decorators/params/required";
import { StringLength } from "../core/decorators/params/string-length";
import { RegexMatch } from "../core/decorators/params/regex-match";
import { Optional } from "../core/decorators/params/optional";


export interface IExampleObject {
  id: number;
  value: string;
  phone?: string;
}

export interface ISubObject {
  id: number;
  subvalue: string;
}

export class ExampleObject implements IExampleObject {

  @Required()
  public id: number;

  @Required()
  @StringLength({ min: 1, max: 5 })
  public value: string;

  @Optional()
  @RegexMatch(/^[(][0-9]{3}[)][0-9]{3}[-][0-9]{4}$/)
  public phone?: string;

  constructor(init?: IExampleObject) {
    this.id = init ? init.id : 0;
    this.value = init ? init.value : '';
    this.phone = init ? init.phone : undefined;
  }
}
