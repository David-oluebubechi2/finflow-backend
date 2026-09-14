import { IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  name!: string

  @IsIn(['checking', 'savings', 'credit', 'investing'])
  kind!: 'checking' | 'savings' | 'credit' | 'investing'

  @IsNumber()
  @Min(0)
  balance!: number

  @IsOptional()
  @IsString()
  number?: string

  @IsOptional()
  @IsString()
  accent?: string

  @IsOptional()
  @IsInt()
  usage?: number
}