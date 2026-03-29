import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AutomakerEntity, AutomakerDocument } from './schemas/automaker.schema';
import { CreateAutomakerDto } from './dto/create-automaker.dto';
import { UpdateAutomakerDto } from './dto/update-automaker.dto';

@Injectable()
export class AutomakerEntityService {
  constructor(
    @InjectModel(AutomakerEntity.name)
    private automakerModel: Model<AutomakerDocument>,
  ) {}

  async create(dto: CreateAutomakerDto): Promise<AutomakerEntity> {
    try {
      return await this.automakerModel.create(dto);
    } catch (error) {
      if (error.code === 11000) throw new BadRequestException('Automaker with this name already exists');
      throw error;
    }
  }

  async findAll(query: { page?: string; limit?: string; search?: string }) {
    const { page = '1', limit = '10', search } = query;
    const filter: any = {};
    if (search) filter.name = { $regex: search, $options: 'i' };

    if (page === 'all') {
      const data = await this.automakerModel.find(filter).sort({ name: 1 }).exec();
      return { data, pagination: { total: data.length, page: 'all', limit: data.length, totalPages: 1, hasNextPage: false, hasPrevPage: false } };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      this.automakerModel.find(filter).sort({ name: 1 }).skip(skip).limit(limitNum).exec(),
      this.automakerModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limitNum);
    return { data, pagination: { total, page: pageNum, limit: limitNum, totalPages, hasNextPage: pageNum < totalPages, hasPrevPage: pageNum > 1 } };
  }

  async findOne(id: string): Promise<AutomakerEntity> {
    const automaker = await this.automakerModel.findById(id).exec();
    if (!automaker) throw new NotFoundException(`Automaker with ID ${id} not found`);
    return automaker;
  }

  async update(id: string, dto: UpdateAutomakerDto): Promise<AutomakerEntity> {
    try {
      const updated = await this.automakerModel.findByIdAndUpdate(id, dto, { new: true }).exec();
      if (!updated) throw new NotFoundException(`Automaker with ID ${id} not found`);
      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error.code === 11000) throw new BadRequestException('Automaker with this name already exists');
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const automaker = await this.automakerModel.findById(id).exec();
    if (!automaker) throw new NotFoundException(`Automaker with ID ${id} not found`);
    await this.automakerModel.findByIdAndDelete(id).exec();
  }
}
