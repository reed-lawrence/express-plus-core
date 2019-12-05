import { IsInt, IsOptional, IsPhoneNumber, Length, Matches } from "class-validator";
import { IsRequired } from "../../src/validators/is-required";

export interface IExampleObject {
  id: number;
  value: string;
  phone?: string;
}

export class ExampleObject implements IExampleObject {

  @IsRequired()
  @IsInt()
  public id: number = 0;

  @IsRequired()
  @Length(0, 5)
  public value: string = '';

  @IsOptional()
  @Matches(/^[(][0-9]{3}[)][0-9]{3}[-][0-9]{4}$/) // ex: (800)123-4567
  public phone?: string;

}
