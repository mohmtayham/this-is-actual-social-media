// src/ideas/ideas.controller.ts
import { 
  Controller, 
  Post, 
  Body, 
  Req, 
  UseGuards, 
  Put, 
  Param, 
  Get, 
  ParseIntPipe,
  Delete,
  HttpCode,
  HttpStatus,
  Patch,
  Logger
} from '@nestjs/common';
import { IdeasService } from './ideas.service';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { UpdateIdeaDto } from './dto/update-idea.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('ideas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IdeasController {
  private readonly logger = new Logger(IdeasController.name);

  constructor(private readonly ideasService: IdeasService) {}
@Post()
  async create(@Req() req, @Body() dto: CreateIdeaDto) {
    this.logger.log(`--- [Backend: create idea] started for user: ${req.user?.id} ---`);
    this.logger.log(`Payload: ${JSON.stringify(dto)}`);
    try {
      const result = await this.ideasService.create(req.user.id, dto);
      this.logger.log('--- [Backend: create idea] SUCCESS ---');
      return result;
    } catch (error: any) {
      this.logger.error(`--- [Backend: create idea] FAILED: ${error.message} ---`, error.stack);
      throw error;
    }
  }

  @Get()
  async findAll() {
    return this.ideasService.findAll();
  }

  @Get('my-ideas')
  async getMyIdeas(@Req() req) {
    this.logger.log('--- 🟢 [Backend: IdeasController] getMyIdeas endpoint HIT! ---');
    try {
      const userId = req.user?.id || req.user?.userId;
      this.logger.log(`[Backend] Extracted userId is: ${userId}`);
      
      const result = await this.ideasService.findByOwner(userId);
      return result;
    } catch (error: any) {
      this.logger.error(`[Backend] ❌ ERROR in getMyIdeas Controller: ${error.message}`);
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ideasService.findOne(id);
  }

  @Roles('IDEA_OWNER')
  @Patch(':id/content')
  async updateContent(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body() updateIdeaDto: UpdateIdeaDto,
  ) {
    // 🟢 تصحيح المتغير ليكون req.user.id بدلاً من userId
    return this.ideasService.updateContent(id, req.user.id, updateIdeaDto);
  }

  @Patch(':id/status')
  @Roles('COMMITTEE_MEMBER', 'ADMIN')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    // 🟢 تصحيح المتغير ليكون req.user.id بدلاً من userId
    this.logger.log(`Updating idea status ${id} to ${updateStatusDto.status} by user: ${req.user.id}`);
    return this.ideasService.updateStatus(id, req.user.id, updateStatusDto);
  }

  @Delete(':id')
  @Roles('IDEA_OWNER', 'ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number, @Req() req) {
    // 🟢 تصحيح المتغير ليكون req.user.id بدلاً من userId
    this.logger.log(`Deleting idea ${id} for user: ${req.user.id}`);
    await this.ideasService.delete(id, req.user.id);
  }
}