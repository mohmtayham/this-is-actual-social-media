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
import { Public } from '../auth/decorators/public.decorator'; // تأكد من مسار الملف الصحيح لديك
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('ideas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IdeasController {
  private readonly logger = new Logger(IdeasController.name);

  constructor(private readonly ideasService: IdeasService) {}
 @Post()
create(@Req() req, @Body() dto: CreateIdeaDto) {
  return this.ideasService.create(req.user.userId, dto);
}

  @Get()
  async findAll() {
    return this.ideasService.findAll();
  
  }@Get('my-ideas')
async getMyIdeas(@Req() req) {
  this.logger.log('--- 🟢 [Backend: IdeasController] getMyIdeas endpoint HIT! ---');
  
  try {
    // 1. فحص كائن الـ user القادم من الـ JWT
    this.logger.log(`[Backend] req.user object is: ${JSON.stringify(req.user)}`);
    
    // 2. محاولة استخراج الـ ID بكل الطرق الممكنة
    const userId = req.user?.userId || req.user?.id || req.user?.sub;
    this.logger.log(`[Backend] Extracted userId is: ${userId}`);
    
    if (!userId) {
      this.logger.warn('[Backend] ⚠️ WARNING: No user ID could be extracted from req.user!');
    }

    // 3. استدعاء السيرفيس ومراقبة النتيجة
    this.logger.log(`[Backend] Calling ideasService.findByOwner with userId: ${userId}`);
    const result = await this.ideasService.findByOwner(userId);
    
    this.logger.log(`[Backend] ✅ Success! Found (${result?.length || 0}) ideas for this user.`);
    return result;

  } catch (error: any) {
    this.logger.error(`[Backend] ❌ ERROR in getMyIdeas Controller: ${error.message}`);
    this.logger.error(error.stack); // لطباعة مكان الخطأ بالتفصيل
    throw error;
  }
}
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ideasService.findOne(id);
  }

@Roles('IDEA_OWNER')
  // PATCH for updating content - only owner
  @Patch(':id/content')

  async updateContent(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body() updateIdeaDto: UpdateIdeaDto,
    
  ) {
return this.ideasService.updateContent(id, req.user.userId, updateIdeaDto);
  }

  // PATCH for updating status - only committee/admin
  @Patch(':id/status')
  @Roles('COMMITTEE_MEMBER', 'ADMIN')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    this.logger.log(`Updating idea status ${id} to ${updateStatusDto.status} by user: ${req.user.userId}`);
    return this.ideasService.updateStatus(id, req.user.userId, updateStatusDto);
  }

  @Delete(':id')
  @Roles('IDEA_OWNER', 'ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number, @Req() req) {
    this.logger.log(`Deleting idea ${id} for user: ${req.user.userId}`);
    await this.ideasService.delete(id, req.user.userId);
  }
}