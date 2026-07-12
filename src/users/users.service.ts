import { Injectable, ConflictException, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
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

    const tempPassword = dto.password || randomBytes(4).toString('hex');
    const hash = await bcrypt.hash(tempPassword, 10);

    const user = await this.prisma.user.create({
      data: { name: dto.name, email: dto.email, role: dto.role, password: hash, active: true },
    });

    // No email is sent — the admin copies this password from the UI and shares it directly.
    return { ...this.sanitize(user), tempPassword };
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

  // Super Admin resets any user's password to a freshly generated one, shown once in the UI.
  async resetPassword(id: string) {
    await this.findOne(id);
    const tempPassword = randomBytes(4).toString('hex');
    const hash = await bcrypt.hash(tempPassword, 10);
    const user = await this.prisma.user.update({ where: { id }, data: { password: hash } });
    return { ...this.sanitize(user), tempPassword };
  }

  // Self-service: any logged-in user changes their own password, given they know the current one.
  async changeOwnPassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');
    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters');
    }
    const hash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { password: hash } });
    return { success: true };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }
}
