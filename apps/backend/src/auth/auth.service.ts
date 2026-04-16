import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import mongoose, { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import axios from "axios";
import { FriendGateway } from './socket/friend.gateway';
import { Role } from './schemas/role.schema';
import { Tenant, TenantDocument } from '../tenant/schemas/tenant.schema';
import { TenantMembershipService } from '../tenant-membership/tenant-membership.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    private readonly tenantMembershipService: TenantMembershipService,
    private readonly friendGateway: FriendGateway,
    private jwtService: JwtService,) { }

  /** Organization slug embedded in JWT for tenant-scoped requests. */
  private async resolvePayloadTenantSlug(tenantId: string | undefined): Promise<string | undefined> {
    if (!tenantId || !Types.ObjectId.isValid(tenantId)) return undefined;
    const doc = await this.tenantModel.findById(tenantId).select('slug').lean().exec();
    return doc?.slug ?? undefined;
  }

  /**
   * Ensure we always put a stable user identifier in JWTs.
   * `User.uid` is optional (e.g. form signup), so fall back to Mongo `_id`.
   */
  private resolveJwtUid(user: { uid?: string; _id?: unknown }): string {
    const uid = typeof user?.uid === 'string' ? user.uid : undefined;
    if (uid && uid.trim()) return uid.trim();
    return String(user?._id ?? '');
  }

  async login(email: string, password: string) {
    try {
      const user = await this.userModel.findOne({ email }).populate('role', 'name');

      if (!user) {
        throw new NotFoundException('Người dùng không tồn tại');
      }

      if (user.lockUntil && user.lockUntil > new Date()) {
        throw new UnauthorizedException('Tài khoản đã bị tạm khóa. Vui lòng thử lại sau 15 phút.');
      }

      const isMatch = await bcrypt.compare(password, user.password || '');
      if (!isMatch) {
        // User has no password (previously signed up via OAuth/Firebase) — guide them to set one
        if (!user.password) {
          throw new UnauthorizedException('This account has no password set. Please use "Forgot password" to create one.');
        }
        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
        if (user.failedLoginAttempts >= 5) {
          user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        }
        await user.save();
        throw new UnauthorizedException('Mật khẩu không chính xác');
      }

      user.failedLoginAttempts = 0;
      user.lockUntil = undefined;

      // Extract role name if populated; repair missing role for legacy accounts
      let roleName = user.role && (user.role as any).name ? (user.role as any).name : null;
      if (!roleName) {
        // Legacy account with no role — assign default 'admin' role and persist it
        const defaultRole = await this.roleModel.findOne({ name: 'admin' });
        if (defaultRole) {
          user.role = defaultRole as any;
          roleName = defaultRole.name;
        }
      }

      // Repair missing tenantId for legacy accounts
      let tenantId = (user as any).tenantId?.toString();
      let tenantSlug: string | undefined;
      if (!tenantId) {
        const defaultTenant = await this.tenantModel.findOne().sort({ createdAt: 1 }).exec();
        if (defaultTenant) {
          (user as any).tenantId = defaultTenant._id;
          tenantId = (defaultTenant._id as any).toString();
          tenantSlug = defaultTenant.slug;
          await user.save();
        }
      }

      if (!tenantId) {
        throw new NotFoundException('No tenant found for this account. Please contact support.');
      }

      if (tenantSlug === undefined) {
        tenantSlug = await this.resolvePayloadTenantSlug(tenantId);
      }

      // Ensure membership exists for the active tenant (for multi-tenant switching).
      if (Types.ObjectId.isValid(String(user._id)) && Types.ObjectId.isValid(String(tenantId))) {
        await this.tenantMembershipService.ensureMembership({
          userId: new Types.ObjectId(String(user._id)),
          tenantId: new Types.ObjectId(String(tenantId)),
          roleInTenant: roleName === 'admin' || roleName === 'superadmin' ? 'admin' : 'member',
        });
      }

      const payload = { uid: this.resolveJwtUid(user as any), email: user.email, role: roleName, tenantId, tenantSlug };
      const tokens = await this.generateUserTokens(payload);
      
      user.refreshToken = tokens.refreshToken;
      await user.save();

      return { user, ...tokens };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error; // ⚡ Giữ nguyên lỗi gốc
      }
      throw new BadRequestException('Không thể đăng nhập. Vui lòng thử lại sau!');
    }
  }

  async createUserWithForm(data: {
    name: string;
    email: string;
    password: string;
    securityConfirmed?: boolean;
    organizationName?: string;
    organizationSlug?: string;
  }) {
    const existingUser = await this.userModel.findOne({ email: data.email });
    if (existingUser) {
      throw new UnauthorizedException('Email already in use');
    }
    if (!data.securityConfirmed) {
      throw new UnauthorizedException('not securityConfirmed');
    }

    // Each signup creates a new tenant; the registering user becomes its admin
    const orgName = data.organizationName?.trim() || `${data.name}'s Organization`;
    const baseSlug = (data.organizationSlug || orgName)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 30);

    // Ensure slug uniqueness by appending a suffix if needed
    let slug = baseSlug;
    let suffix = 1;
    while (await this.tenantModel.findOne({ slug })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const tenant = await this.tenantModel.create({ name: orgName, slug });

    const role = await this.roleModel.findOne({ name: 'admin' });
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = new this.userModel({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      securityConfirmed: data.securityConfirmed,
      role: role?._id,
      tenantId: tenant._id,
    });
    const savedUser = await newUser.save();

    // Create membership for the registering user.
    await this.tenantMembershipService.ensureMembership({
      userId: savedUser._id as unknown as Types.ObjectId,
      tenantId: tenant._id as unknown as Types.ObjectId,
      roleInTenant: 'admin',
    });

    // Issue tokens so the frontend can auto-login after registration
    const roleName = role?.name ?? 'admin';
    const payload = {
      uid: this.resolveJwtUid(savedUser as any),
      email: savedUser.email,
      role: roleName,
      tenantId: tenant._id.toString(),
      tenantSlug: tenant.slug,
    };
    const tokens = await this.generateUserTokens(payload);
    savedUser.refreshToken = tokens.refreshToken;
    await savedUser.save();

    const user = await this.userModel.findById(savedUser._id).populate('role', 'name').exec();
    return { user, ...tokens };
  }

  async switchTenant(params: { email: string; tenantId: string }) {
    const { email, tenantId } = params;
    if (!email) throw new UnauthorizedException('Missing user context');
    if (!Types.ObjectId.isValid(tenantId)) throw new BadRequestException('Invalid tenantId');

    const user = await this.userModel.findOne({ email }).populate('role', 'name').exec();
    if (!user) throw new NotFoundException('User not found');

    const tenant = await this.tenantModel.findById(tenantId).exec();
    if (!tenant) throw new NotFoundException('Tenant not found');

    const isMember = await this.tenantMembershipService.isMember({
      userId: String(user._id),
      tenantId: String(tenant._id),
    });
    if (!isMember) throw new UnauthorizedException('You are not a member of this organization');

    // Keep User.tenantId as the active tenant for compatibility with TenantGuard.
    (user as any).tenantId = tenant._id as Types.ObjectId;

    const roleName =
      user.role && (user.role as any).name ? (user.role as any).name : String((user as any).role ?? 'user');

    const payload = {
      uid: this.resolveJwtUid(user as any),
      email: user.email,
      role: roleName,
      tenantId: (tenant._id as Types.ObjectId).toString(),
      tenantSlug: tenant.slug,
    };
    const tokens = await this.generateUserTokens(payload);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return { user, ...tokens };
  }

  async generateUserTokens(payload) {
    const accessToken = this.jwtService.sign({ payload }, {
      expiresIn: '15m'
    });
    const refreshToken = this.jwtService.sign({ payload }, {
      expiresIn: '7d'
    });
    return { accessToken, refreshToken };
  }

  async refreshToken(token: string) {
    try {
      const decoded: any = this.jwtService.verify(token);
      const payload = decoded.payload;
      const user = await this.userModel.findOne({ email: payload.email });
      if (!user || user.refreshToken !== token) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Re-build payload with latest role from DB (populate to get name)
      await user.populate('role', 'name');
      let roleName = user.role && (user.role as any).name ? (user.role as any).name : null;
      if (!roleName) {
        const defaultRole = await this.roleModel.findOne({ name: 'admin' });
        if (defaultRole) {
          user.role = defaultRole as any;
          roleName = defaultRole.name;
        }
      }
      const tid = (user as any).tenantId?.toString();
      const tenantSlug = await this.resolvePayloadTenantSlug(tid);
      const freshPayload = { uid: this.resolveJwtUid(user as any), email: user.email, role: roleName, tenantId: tid, tenantSlug };
      const tokens = await this.generateUserTokens(freshPayload);
      user.refreshToken = tokens.refreshToken;
      await user.save();

      return tokens;
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string) {
    try {
      await this.userModel.findByIdAndUpdate(userId, { refreshToken: null });
    } catch (e) {
      throw new BadRequestException('Cannot logout currently');
    }
  }

  async getRoles() {
    try {
      const roles = await this.roleModel.find();
      return {
        message: 'Danh sách role',
        data: roles,
      };
    } catch (error) {
      throw new Error('Không thể lấy danh sách role');
    }
  }

  async getTokenUser(email: string) {
    const user = await this.userModel.findOne({ email }).populate('role', 'name').select('-password -refreshToken -resetPasswordToken');
    return { user, roleInDb: (user?.role as any)?.name ?? user?.role ?? null };
  }

  async forgotPassword(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      // Return success regardless to avoid email enumeration
      return { message: 'If that email exists, a reset link has been sent.' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: 'Password Reset Request',
        html: `
          <p>You requested a password reset.</p>
          <p>Click the link below to reset your password. This link expires in 1 hour.</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>If you did not request this, please ignore this email.</p>
        `,
      });
    } catch (mailErr) {
      console.error('[forgotPassword] Failed to send reset email:', mailErr);
      // Don't expose mail errors to the client
    }

    return { message: 'If that email exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Populate role and repair if missing
    await user.populate('role', 'name');
    let roleName = user.role && (user.role as any).name ? (user.role as any).name : null;
    if (!roleName) {
      const defaultRole = await this.roleModel.findOne({ name: 'admin' });
      if (defaultRole) {
        user.role = defaultRole as any;
        roleName = defaultRole.name;
      }
    }

    const tid = (user as any).tenantId?.toString();
    const tenantSlug = await this.resolvePayloadTenantSlug(tid);
    const payload = { uid: this.resolveJwtUid(user as any), email: user.email, role: roleName, tenantId: tid, tenantSlug };
    const tokens = await this.generateUserTokens(payload);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return { message: 'Password has been reset successfully', ...tokens };
  }

  /**
   * Sets a default tenantId (organization) for users who don't have one.
   * Uses the provided tenantId, or falls back to the oldest tenant in the system.
   * Returns the number of users updated.
   */
  async setDefaultOrganization(tenantId?: string): Promise<{ updated: number; tenantId: string }> {
    let resolvedId: Types.ObjectId;

    if (tenantId) {
      resolvedId = new Types.ObjectId(tenantId);
    } else {
      const defaultTenant = await this.tenantModel.findOne().sort({ createdAt: 1 }).exec();
      if (!defaultTenant) throw new BadRequestException('No tenant found to use as default');
      resolvedId = defaultTenant._id as Types.ObjectId;
    }

    const result = await this.userModel.updateMany(
      { $or: [{ tenantId: { $exists: false } }, { tenantId: null }] },
      { $set: { tenantId: resolvedId } },
    );

    return { updated: result.modifiedCount, tenantId: resolvedId.toString() };
  }























}
