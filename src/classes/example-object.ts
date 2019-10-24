import { Required } from '../core/decorations/required';
import { StringLength } from '../core/decorations/string-length';

export interface IExampleObject {
  id: number;
  value: string;
  value2: string;
}

export interface ISubObject {
  id: number;
  subvalue: string;
}

export class ExampleObject implements IExampleObject {
  public id: number;

  @Required()
  @StringLength({ min: 1, max: 5 })
  public value: string;

  @StringLength((length) => length >= 5 && length <= 10)
  public value2: string;

  public subobject: ISubObject;

  constructor(init?: IExampleObject) {
    this.id = init ? init.id : 0;
    this.value = init ? init.value : '';
    this.value2 = init ? init.value2 : '';
    this.subobject = { id: 0, subvalue: '' };
  }
}
