// src/roadmap/roadmap.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { RoadmapService } from './roadmap.service';
import { CreateRoadmapDto } from './dto/create-roadmap.dto';
import { UpdateRoadmapDto } from './dto/update-roadmap.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard'; // تأكد من المسار الصحيح

@Controller('roadmap')
@UseGuards(JwtAuthGuard) // حماية جميع المسارات (يتطلب تسجيل الدخول)
export class RoadmapController {
  constructor(private readonly roadmapService: RoadmapService) {}

  // إنشاء roadmap جديد (POST /roadmap)
  @Post()
  async create(@Req() req, @Body() createRoadmapDto: CreateRoadmapDto) {
    const userId = req.user.id; // استخراج userId من التوكن
    return this.roadmapService.create(userId, createRoadmapDto);
  }

  // جلب جميع roadmaps (GET /roadmap)
  @Get()
  async findAll() {
    return this.roadmapService.findAll();
  }
  @Get('idea/:ideaId')
  async findByIdea(@Param('ideaId', ParseIntPipe) ideaId: number) {
    return this.roadmapService.findByIdea(ideaId);
  }
  // جلب جميع مراحل خارطة الطريق (GET /roadmap/stages)
  @Get('stages')
  async getAllStages() {
    const stages = this.roadmapService.getAllStages();
    return { platform_roadmap_stages: stages };
  }

  // جلب roadmap واحد بواسطة id (GET /roadmap/:id)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roadmapService.findOne(id);
  }

  // تحديث roadmap (PATCH /roadmap/:id)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoadmapDto: UpdateRoadmapDto,
  ) {
    return this.roadmapService.update(id, updateRoadmapDto);
  }

  // حذف roadmap (DELETE /roadmap/:id)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.roadmapService.remove(id);
  }
}