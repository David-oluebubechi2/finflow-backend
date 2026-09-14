import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateTransactionDto } from './dto/create-transaction.dto'

function today() {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string, account?: string, kind?: 'in' | 'out') {
    return this.prisma.transaction.findMany({
      where: { userId, ...(account ? { accountName: account } : {}), ...(kind ? { kind } : {}) },
      orderBy: { id: 'desc' },
    })
  }

  create(userId: string, dto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        merchant: dto.merchant,
        category: dto.category,
        icon: dto.icon ?? 'bag',
        color: dto.color ?? '#8b5cf6',
        date: dto.date ?? today(),
        accountName: dto.accountName,
        amount: dto.amount,
        kind: dto.kind,
        status: dto.status ?? 'Completed',
        userId,
      },
    })
  }
}