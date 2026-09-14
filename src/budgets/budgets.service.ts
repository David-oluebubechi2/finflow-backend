import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateBudgetDto, UpdateBudgetSpentDto } from './dto/create-budget.dto'

@Injectable()
export class BudgetsService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.budget.findMany({ where: { userId }, orderBy: { id: 'asc' } })
  }

  create(userId: string, dto: CreateBudgetDto) {
    return this.prisma.budget.create({
      data: {
        category: dto.category,
        limit: dto.limit,
        icon: dto.icon ?? 'bag',
        color: dto.color ?? '#8b5cf6',
        spent: 0,
        userId,
      },
    })
  }

  async updateSpent(userId: string, id: number, dto: UpdateBudgetSpentDto) {
    const budget = await this.prisma.budget.findFirst({ where: { id, userId } })
    if (!budget) throw new NotFoundException('Budget not found.')
    return this.prisma.budget.update({ where: { id }, data: { spent: dto.spent } })
  }

  remove(userId: string, id: number) {
    return this.prisma.budget.deleteMany({ where: { id, userId } })
  }
}