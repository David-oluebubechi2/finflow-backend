import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

type SeedAccount = {
  name: string
  kind: 'checking' | 'savings' | 'credit' | 'investing'
  number: string
  balance: number
  change: number
  accent: string
  usage?: number
}

type SeedTx = {
  merchant: string
  category: string
  icon: string
  color: string
  date: string
  accountName: string
  amount: number
  kind: 'in' | 'out'
  status: 'Completed' | 'Pending' | 'Failed'
}

const seedAccounts: SeedAccount[] = [
  { name: 'Main Checking', kind: 'checking', number: '\u2022\u2022\u2022\u2022 4821', balance: 24562.8, change: 2.4, accent: '#10b981' },
  { name: 'High-Yield Savings', kind: 'savings', number: '\u2022\u2022\u2022\u2022 0094', balance: 86120.4, change: 4.1, accent: '#3b82f6' },
  { name: 'Travel Credit', kind: 'credit', number: '\u2022\u2022\u2022\u2022 7710', balance: -1845.22, change: -1.2, accent: '#8b5cf6', usage: 82 },
  { name: 'Growth Portfolio', kind: 'investing', number: '\u2022\u2022\u2022\u2022 3327', balance: 43209.15, change: 12.6, accent: '#f59e0b' },
]

const seedBudgets = [
  { category: 'Food & Dining', icon: 'wallet', color: '#8b5cf6', spent: 421.4, limit: 600 },
  { category: 'Shopping', icon: 'bag', color: '#f43f5e', spent: 312.8, limit: 350 },
  { category: 'Transport', icon: 'send', color: '#3b82f6', spent: 86.9, limit: 150 },
  { category: 'Subscriptions', icon: 'database', color: '#d946ef', spent: 47.48, limit: 60 },
  { category: 'Utilities', icon: 'bolt', color: '#f59e0b', spent: 96.2, limit: 80 },
  { category: 'Entertainment', icon: 'sparkle', color: '#06b6d4', spent: 118, limit: 140 },
]

const seedTransactions: SeedTx[] = [
  { merchant: 'Acme Corp Payroll', category: 'Income', icon: 'trend-up', color: '#10b981', date: 'Sep 5, 2026', accountName: 'Main Checking', amount: 5280, kind: 'in', status: 'Completed' },
  { merchant: 'Whole Foods Market', category: 'Food & Dining', icon: 'wallet', color: '#8b5cf6', date: 'Sep 5, 2026', accountName: 'Travel Credit', amount: 128.45, kind: 'out', status: 'Completed' },
  { merchant: 'Spotify', category: 'Subscriptions', icon: 'database', color: '#d946ef', date: 'Sep 4, 2026', accountName: 'Travel Credit', amount: 11.99, kind: 'out', status: 'Completed' },
  { merchant: 'Uber', category: 'Transport', icon: 'send', color: '#3b82f6', date: 'Sep 4, 2026', accountName: 'Travel Credit', amount: 32.6, kind: 'out', status: 'Completed' },
  { merchant: 'Apple Store', category: 'Shopping', icon: 'bag', color: '#f43f5e', date: 'Sep 3, 2026', accountName: 'Main Checking', amount: 249, kind: 'out', status: 'Pending' },
  { merchant: 'Stripe Payout', category: 'Income', icon: 'trend-up', color: '#10b981', date: 'Sep 3, 2026', accountName: 'Main Checking', amount: 1250, kind: 'in', status: 'Completed' },
  { merchant: 'Netflix', category: 'Subscriptions', icon: 'database', color: '#d946ef', date: 'Sep 2, 2026', accountName: 'Travel Credit', amount: 15.49, kind: 'out', status: 'Completed' },
  { merchant: 'Shell Gas', category: 'Transport', icon: 'send', color: '#3b82f6', date: 'Sep 2, 2026', accountName: 'Travel Credit', amount: 54.3, kind: 'out', status: 'Completed' },
  { merchant: 'Starbucks', category: 'Food & Dining', icon: 'wallet', color: '#8b5cf6', date: 'Sep 1, 2026', accountName: 'Main Checking', amount: 8.75, kind: 'out', status: 'Completed' },
  { merchant: 'Electric Bill', category: 'Utilities', icon: 'bolt', color: '#f59e0b', date: 'Sep 1, 2026', accountName: 'Main Checking', amount: 96.2, kind: 'out', status: 'Completed' },
  { merchant: 'Vanguard Dividends', category: 'Income', icon: 'trend-up', color: '#10b981', date: 'Aug 30, 2026', accountName: 'Growth Portfolio', amount: 860.12, kind: 'in', status: 'Completed' },
  { merchant: 'Amazon', category: 'Shopping', icon: 'bag', color: '#f43f5e', date: 'Aug 28, 2026', accountName: 'Main Checking', amount: 189.32, kind: 'out', status: 'Completed' },
  { merchant: 'Rent Payment', category: 'Housing', icon: 'home', color: '#84cc16', date: 'Aug 26, 2026', accountName: 'Main Checking', amount: 1850, kind: 'out', status: 'Completed' },
]

async function main() {
  const password = await hash('Finflow@123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'nova@finflow.app' },
    update: {},
    create: { email: 'nova@finflow.app', name: 'Nova Reyes', password, plan: 'pro' },
  })

  await prisma.account.deleteMany({ where: { userId: user.id } })
  await prisma.account.createMany({ data: seedAccounts.map((a) => ({ ...a, userId: user.id })) })

  await prisma.budget.deleteMany({ where: { userId: user.id } })
  await prisma.budget.createMany({ data: seedBudgets.map((b) => ({ ...b, userId: user.id })) })

  await prisma.transaction.deleteMany({ where: { userId: user.id } })
  await prisma.transaction.createMany({ data: seedTransactions.map((t) => ({ ...t, userId: user.id })) })

  // eslint-disable-next-line no-console
  console.log('Seeded demo user nova@finflow.app / Finflow@123 with accounts, budgets and transactions.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())