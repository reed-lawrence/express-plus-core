import { IsInt, Min, Max, IsEmail } from "class-validator";

export interface IExampleObject {
  id: number;
  value: string;
}

export class ExampleObject implements IExampleObject {

  @IsInt()
  @Min(1)
  @Max(5)
  id: number = 0;

  @IsEmail()
  value: string = '';

}