import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  merchant!: string

  @IsString()
  @IsNotEmpty()
  category!: string

  @IsString()
  @IsNotEmpty()
  accountName!: string

  @IsNumber()
  amount!: number

  @IsIn(['in', 'out'])
  kind!: 'in' | 'out'

  @IsOptional()
  @IsString()
  icon?: string

  @IsOptional()
  @IsString()
  color?: string

  @IsOptional()
  @IsString()
  date?: string

  @IsOptional()
  @IsIn(['Completed', 'Pending', 'Failed'])
  status?: 'Completed' | 'Pending' | 'Failed'
}