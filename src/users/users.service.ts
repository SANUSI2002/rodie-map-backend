import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private sanitize(user: any) {
    const { password, ...rest } = user;
    return rest;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
    return users.map((u) => this.sanitize(u));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.sanitize(user);
  }

  async invite(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('A user with this email already exists');

    const tempPassword = dto.password || randomBytes(6).toString('hex');
    const hash = await bcrypt.hash(tempPassword, 10);

    const user = await this.prisma.user.create({
      data: { name: dto.name, email: dto.email, role: dto.role, password: hash, active: true },
    });

    // In production this is where you'd email tempPassword to the invited user.
    return { ...this.sanitize(user), tempPassword: dto.password ? undefined : tempPassword };
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.password) data.password = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.update({ where: { id }, data });
    return this.sanitize(user);
  }

  async deactivate(id: string) {
    await this.findOne(id);
    const user = await this.prisma.user.update({ where: { id }, data: { active: false } });
    return this.sanitize(user);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }
}
