import { Injectable, ConflictException, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private activityService: ActivityService,
  ) {}

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

  async invite(dto: CreateUserDto, actorName = 'Someone') {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('A user with this email already exists');

    const tempPassword = dto.password || randomBytes(4).toString('hex');
    const hash = await bcrypt.hash(tempPassword, 10);

    const user = await this.prisma.user.create({
      data: { name: dto.name, email: dto.email, role: dto.role, password: hash, active: true },
    });

    await this.activityService.log({
      actorName,
      action: 'created',
      entityType: 'User',
      entityName: user.name,
      detail: `role: ${dto.role}`,
    });

    // No email is sent — the admin copies this password from the UI and shares it directly.
    return { ...this.sanitize(user), tempPassword };
  }

  async update(id: string, dto: UpdateUserDto, actorName = 'Someone') {
    const before = await this.findOne(id);
    const data: any = { ...dto };
    if (dto.password) data.password = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.update({ where: { id }, data });
    await this.activityService.log({
      actorName,
      action: 'updated',
      entityType: 'User',
      entityName: user.name,
      detail: dto.role && dto.role !== before.role ? `role changed to ${dto.role}` : undefined,
    });
    return this.sanitize(user);
  }

  async deactivate(id: string, actorName = 'Someone') {
    await this.findOne(id);
    const user = await this.prisma.user.update({ where: { id }, data: { active: false } });
    await this.activityService.log({ actorName, action: 'deactivated', entityType: 'User', entityName: user.name });
    return this.sanitize(user);
  }

  // Super Admin resets any user's password to a freshly generated one, shown once in the UI.
  async resetPassword(id: string, actorName = 'Someone') {
    const before = await this.findOne(id);
    const tempPassword = randomBytes(4).toString('hex');
    const hash = await bcrypt.hash(tempPassword, 10);
    const user = await this.prisma.user.update({ where: { id }, data: { password: hash } });
    await this.activityService.log({ actorName, action: 'reset the password for', entityType: 'User', entityName: before.name });
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
    await this.activityService.log({ actorName: user.name, action: 'changed their own password', entityType: 'User', entityName: user.name });
    return { success: true };
  }

  async remove(id: string, actorName = 'Someone') {
    const user = await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    await this.activityService.log({ actorName, action: 'deleted', entityType: 'User', entityName: user.name });
    return { success: true };
  }
}
