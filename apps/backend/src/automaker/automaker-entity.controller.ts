import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { AutomakerEntityService } from './automaker-entity.service';
import { CreateAutomakerDto } from './dto/create-automaker.dto';
import { UpdateAutomakerDto } from './dto/update-automaker.dto';

@UseGuards(AuthGuard)
@Controller('automakers')
export class AutomakerEntityController {
  constructor(private readonly automakerEntityService: AutomakerEntityService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  create(@Body() dto: CreateAutomakerDto) {
    return this.automakerEntityService.create(dto);
  }

  @Get()
  findAll(@Query() query: { page?: string; limit?: string; search?: string }) {
    return this.automakerEntityService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.automakerEntityService.findOne(id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  update(@Param('id') id: string, @Body() dto: UpdateAutomakerDto) {
    return this.automakerEntityService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.automakerEntityService.remove(id);
  }
}
