import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../auth/schemas/user.schema';
import { Role } from '../auth/schemas/role.schema';
import * as bcrypt from 'bcryptjs';

// Helper function để loại bỏ dấu tiếng Việt
function removeVietnameseTones(str: string): string {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
  str = str.replace(/Đ/g, 'D');
  return str;
}

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
  ) {}

  // 🟢 Lấy tất cả users với phân trang và search (scoped to tenant)
  async findAll(query: {
    page?: string;
    limit?: string;
    search?: string;
    role?: string;
    tenantId?: string;
  }) {
    const isGetAll = query.page === 'all';
    const page = isGetAll ? 1 : parseInt(query.page) || 1;
    const limit = isGetAll
      ? 1000 // Limit to 1000 for page=all to prevent server crashes
      : parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    // Tạo filter
    const filter: any = {};

    // Scope to tenant
    if (query.tenantId) {
      filter.tenantId = new Types.ObjectId(query.tenantId);
    }

    // Filter theo role nếu có
    if (query.role) {
      filter.role = new Types.ObjectId(query.role);
    }

    if (query.search && query.search.trim()) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [
        { name: { $regex: searchRegex } },
        { email: { $regex: searchRegex } }
      ];
    }

    const total = await this.userModel.countDocuments(filter);

    const data = await this.userModel
      .find(filter)
      .populate('role', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  // 🟢 Lấy user theo ID
  async findById(id: string) {
    const user = await this.userModel
      .findById(id)
      .populate('role', 'name')
      .exec();

    if (!user) {
      throw new NotFoundException('Không tìm thấy user');
    }

    return user;
  }

  // 🟢 Tạo mới user
  async create(data: {
    name: string;
    email: string;
    password?: string;
    uid?: string;
    role?: string;
    securityConfirmed?: boolean;
    tenantId?: string;
  }) {
    try {
      // Kiểm tra email đã tồn tại chưa
      const existingUser = await this.userModel.findOne({ email: data.email });

      if (existingUser) {
        throw new BadRequestException(`Email "${data.email}" đã tồn tại`);
      }

      // Kiểm tra uid đã tồn tại chưa (nếu có)
      if (data.uid) {
        const existingUid = await this.userModel.findOne({ uid: data.uid });
        if (existingUid) {
          throw new BadRequestException(`UID "${data.uid}" đã tồn tại`);
        }
      }

      // Store password
      let hashedPassword = data.password;
      if (data.password) {
        hashedPassword = await bcrypt.hash(data.password, 10);
      }

      // Kiểm tra role có tồn tại không (nếu có)
      if (data.role) {
        const roleExists = await this.roleModel.findById(data.role);
        if (!roleExists) {
          throw new BadRequestException('Role không tồn tại');
        }
      }

      const newUser = new this.userModel({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        uid: data.uid,
        role: data.role ? new Types.ObjectId(data.role) : undefined,
        securityConfirmed: data.securityConfirmed || false,
        tenantId: data.tenantId ? new Types.ObjectId(data.tenantId) : undefined,
      });

      const savedUser = await newUser.save();

      // Populate role khi trả về
      return this.userModel
        .findById(savedUser._id)
        .populate('role', 'name')
        .exec();
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException('Tạo user thất bại');
    }
  }

  // 🟡 Cập nhật user
  async update(
    id: string,
    data: {
      name?: string;
      email?: string;
      password?: string;
      uid?: string;
      role?: string;
      securityConfirmed?: boolean;
    },
  ) {
    try {
      const user = await this.userModel.findById(id);

      if (!user) {
        throw new NotFoundException('Không tìm thấy user');
      }

      // Kiểm tra email mới có trùng với user khác không
      if (data.email && data.email !== user.email) {
        const existing = await this.userModel.findOne({
          email: data.email,
          _id: { $ne: id },
        });

        if (existing) {
          throw new BadRequestException(`Email "${data.email}" đã tồn tại`);
        }
      }

      // Kiểm tra uid mới có trùng với user khác không (nếu có)
      if (data.uid && data.uid !== user.uid) {
        const existingUid = await this.userModel.findOne({
          uid: data.uid,
          _id: { $ne: id },
        });

        if (existingUid) {
          throw new BadRequestException(`UID "${data.uid}" đã tồn tại`);
        }
      }

      // Kiểm tra role có tồn tại không (nếu có)
      if (data.role) {
        const roleExists = await this.roleModel.findById(data.role);
        if (!roleExists) {
          throw new BadRequestException('Role không tồn tại');
        }
      }

      // Hash password mới nếu có (for production, use bcrypt)
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }

      // Cập nhật các field
      if (data.name) user.name = data.name;
      if (data.email) user.email = data.email;
      if (data.password) user.password = data.password;
      if (data.uid !== undefined) user.uid = data.uid;
      if (data.role) user.role = new Types.ObjectId(data.role) as any;
      if (data.securityConfirmed !== undefined)
        user.securityConfirmed = data.securityConfirmed;

      await user.save();

      // Populate role khi trả về
      return this.userModel
        .findById(user._id)
        .populate('role', 'name')
        .exec();
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Cập nhật user thất bại');
    }
  }

  // 🔴 Xóa user
  async delete(id: string) {
    try {
      const user = await this.userModel.findById(id);

      if (!user) {
        throw new NotFoundException('Không tìm thấy user');
      }

      await this.userModel.findByIdAndDelete(id);

      return { message: 'Xóa user thành công', id };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Xóa user thất bại');
    }
  }

  // 🔴 Deactivate user — invalidates their session (refresh token nulled)
  async deactivate(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('Không tìm thấy user');
    user.status = 'inactive';
    user.refreshToken = null;
    await user.save();
    return { message: 'User đã bị vô hiệu hóa', id };
  }

  // 🟢 Activate user
  async activate(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('Không tìm thấy user');
    user.status = 'active';
    await user.save();
    return { message: 'User đã được kích hoạt', id };
  }

  // 📊 Dashboard stats
  async getDashboardStats() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalUsers, newTodayUsers, totalByStatus] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ createdAt: { $gte: startOfDay } }),
      this.userModel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const activeUsers = totalByStatus.find((s) => s._id === 'active')?.count ?? 0;
    const inactiveUsers = totalByStatus.find((s) => s._id === 'inactive')?.count ?? 0;

    return {
      totalUsers,
      newTodayUsers,
      activeUsers,
      inactiveUsers,
      systemStatus: 'healthy',
      generatedAt: now.toISOString(),
    };
  }

  // 🟢 Lấy tất cả roles
  async findAllRoles() {
    try {
      const roles = await this.roleModel.find().sort({ name: 1 }).exec();
      return {
        message: 'Danh sách roles',
        data: roles,
        total: roles.length,
      };
    } catch (error) {
      throw new BadRequestException('Không thể lấy danh sách roles');
    }
  }

  // 🟢 GET /users/me — current user profile
  async getMe(email: string) {
    const user = await this.userModel
      .findOne({ email })
      .populate('role', 'name')
      .select('-password -refreshToken -resetPasswordToken -resetPasswordExpires')
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // 🟢 GET /users/me/preferences
  async getPreferences(email: string) {
    const user = await this.userModel.findOne({ email }).select('preferences').exec();
    if (!user) throw new NotFoundException('User not found');
    return { data: user.preferences ?? {} };
  }

  // 🟡 PUT /users/me/preferences
  async updatePreferences(
    email: string,
    prefs: {
      language?: string;
      timezone?: string;
      emailNotifications?: boolean;
      dashboardAlerts?: boolean;
    },
  ) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('User not found');
    user.preferences = { ...(user.preferences ?? {}), ...prefs };
    await user.save();
    return { message: 'Preferences updated', data: user.preferences };
  }

  // 🟢 Kiểm tra trạng thái securityConfirmed của user hiện tại
  async checkSecurityStatus(email: string) {
    try {
      const user = await this.userModel.findOne({ email }).select('securityConfirmed name email');
      
      if (!user) {
        throw new NotFoundException('Không tìm thấy user');
      }

      return {
        message: 'Trạng thái xác thực bảo mật',
        data: {
          email: user.email,
          name: user.name,
          securityConfirmed: user.securityConfirmed,
          requiresVerification: !user.securityConfirmed, // Nếu false thì cần xác thực thêm
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Không thể kiểm tra trạng thái bảo mật');
    }
  }

  // 🟡 Cập nhật securityConfirmed (không cần verify password)
  async updateSecurityConfirm(
    email: string,
    data: { securityConfirmed: boolean },
  ) {
    try {
      const user = await this.userModel.findOne({ email });

      if (!user) {
        throw new NotFoundException('Không tìm thấy user');
      }

      // Cập nhật trạng thái (không cần verify password)
      user.securityConfirmed = data.securityConfirmed;
      await user.save();

      return {
        message: data.securityConfirmed
          ? 'Đã bật xác thực bảo mật thành công'
          : 'Đã tắt xác thực bảo mật',
        data: {
          email: user.email,
          securityConfirmed: user.securityConfirmed,
        },
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Không thể cập nhật trạng thái bảo mật');
    }
  }
}

