import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateAccountDto } from './dto/create-account.dto'

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.account.findMany({ where: { userId }, orderBy: { id: 'asc' } })
  }

  async create(userId: string, dto: CreateAccountDto) {
    const lastDigits = String(1000 + Math.floor(Math.random() * 9000))
    return this.prisma.account.create({
      data: {
        name: dto.name,
        kind: dto.kind,
        balance: dto.kind === 'credit' ? -Math.abs(dto.balance) : dto.balance,
        change: 0,
        accent: dto.accent ?? '#10b981',
        usage: dto.usage,
        number: dto.number ?? `\u2022\u2022\u2022\u2022 ${lastDigits}`,
        userId,
      },
    })
  }

  remove(userId: string, id: number) {
    return this.prisma.account.deleteMany({ where: { id, userId } })
  }
}