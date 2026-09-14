import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class CreateBudgetDto {
  @IsString()
  @IsNotEmpty()
  category!: string

  @IsNumber()
  @Min(0)
  limit!: number

  @IsOptional()
  @IsString()
  icon?: string

  @IsOptional()
  @IsString()
  color?: string
}

export class UpdateBudgetSpentDto {
  @IsNumber()
  @Min(0)
  spent!: number
}