import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service'
import { RegisterDto, LoginDto } from './dto/auth.dto'
import { compare, hash } from 'bcryptjs'

type TokenUser = { id: string; email: string; name: string; plan: string }

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase()
    const existing = await this.prisma.user.findUnique({ where: { email } })
    if (existing) throw new ConflictException('An account with this email already exists.')
    const password = await hash(dto.password, 10)
    const user = await this.prisma.user.create({
      data: { email, name: dto.name, password },
    })
    return this.token(user)
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } })
    if (!user || !(await compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid email or password.')
    }
    return this.token(user)
  }

  async profile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new UnauthorizedException('Account not found.')
    const { password: _pw, ...safe } = user
    return safe
  }

  private token(user: TokenUser) {
    return {
      token: this.jwt.sign({ sub: user.id, email: user.email }),
      user: { id: user.id, email: user.email, name: user.name, plan: user.plan },
    }
  }
}