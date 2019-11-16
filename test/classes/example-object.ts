import { IsInt, Min, Max, IsEmail } from "class-validator";

export class ExampleObject {

  @IsInt()
  @Min(1)
  @Max(5)
  id: number = 0;

  @IsEmail()
  value: string = '';

}