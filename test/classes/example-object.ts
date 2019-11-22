import { IsEmail, IsInt, Max, Min } from "class-validator";

export interface IExampleObject {
  id: number;
  value: string;
}

export class ExampleObject implements IExampleObject {

  @IsInt()
  @Min(1)
  @Max(5)
  public id: number = 0;

  @IsEmail()
  public value: string = '';

}
