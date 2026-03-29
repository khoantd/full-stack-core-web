import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import axios from "axios";
import { FriendGateway } from './socket/friend.gateway';
import { Role } from './schemas/role.schema';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
    private readonly friendGateway: FriendGateway,
    private jwtService: JwtService,) { }
  async createUserWithFirebase(data: { uid: string; email: string; name: string }) {
    // Kiểm tra xem user đã tồn tại trong MongoDB

    let user = await this.userModel.findOne({ uid: data.uid }).populate('role', 'name');
    if (!user) {
      const defaultRole = await this.roleModel.findOne({ name: 'user' });
      // Nếu chưa tồn tại, tạo user mới
      user = new this.userModel({
        uid: data.uid,
        email: data.email,
        name: data.name,
        role: defaultRole?._id,
      });

      // Lưu user mới vào database
      await user.save();
      
      // Populate role sau khi save
      user = await this.userModel.findById(user._id).populate('role', 'name').exec();
    }

    const payload = { uid: user.uid, email: user.email };
    const tokens = await this.generateUserTokens(payload);
    user.refreshToken = tokens.refreshToken;
    await user.save();
    return { user, ...tokens };
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
        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
        if (user.failedLoginAttempts >= 5) {
          user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        }
        await user.save();
        throw new UnauthorizedException('Mật khẩu không chính xác');
      }

      user.failedLoginAttempts = 0;
      user.lockUntil = undefined;

      // Extract role name if populated
      const roleName = user.role && (user.role as any).name ? (user.role as any).name : user.role;
      const payload = { uid: user.uid, email: user.email, role: roleName };
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

  async createUserWithForm(data: { name: string; email: string; password: string; securityConfirmed?: boolean }) {
    const existingUser = await this.userModel.findOne({ email: data.email });
    if (existingUser) {
      throw new UnauthorizedException('Email already in use');
    }
    if (!data.securityConfirmed) {
      throw new UnauthorizedException('not securityConfirmed');
    }

    const userCount = await this.userModel.countDocuments();
    const roleName = userCount === 0 ? 'admin' : 'user';
    const role = await this.roleModel.findOne({ name: roleName });

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = new this.userModel({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      securityConfirmed: data.securityConfirmed,
      role: role?._id,
    });
    return newUser.save();
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
      // Verify signature 
      const decoded: any = this.jwtService.verify(token);
      
      const payload = decoded.payload;
      const user = await this.userModel.findOne({ email: payload.email });
      if (!user || user.refreshToken !== token) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = await this.generateUserTokens(payload);
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
    user.refreshToken = null; // invalidate existing sessions
    await user.save();

    return { message: 'Password has been reset successfully' };
  }























}
