import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  ParseIntPipe, 
  Req 
} from '@nestjs/common';
import { MeetingService } from './meeting.service';

@Controller('meetings')
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  /**
   * 1. جلب الاجتماعات القادمة لفكرة معينة (خاص بصاحب الفكرة)
   */
  @Get('idea/:ideaId/upcoming')
  async getUpcomingMeetings(
    @Param('ideaId', ParseIntPipe) ideaId: number,
    @Req() req: any,
  ) {
    // يستخرج الـ userId من المستخدم المسجل، أو يستخدم 1 كقيمة افتراضية للاختبار
    const userId = req.user?.id || 1; 
    return this.meetingService.getUpcomingMeetings(userId, ideaId);
  }

  /**
   * 2. جلب جميع أفكار اللجنة والاجتماعات التابعة لها (خاص بعضو اللجنة)
   */

  
  @Get('committee/ideas')
  async committeeIdeasMeetings(@Req() req: any) {
    const userId = req.user?.id || 1;
    return this.meetingService.committeeIdeasMeetings(userId);
  }

  /**
   * 3. جدولة أو تحديث اجتماع متقدم لفكرة (خاص بعضو اللجنة المشرفة)
   */
  @Post('idea/:ideaId/schedule')
  async scheduleAdvancedMeeting(
    @Param('ideaId', ParseIntPipe) ideaId: number,
    @Body() dto: { meetingDate?: Date; meetingLink?: string; notes?: string },
    @Req() req: any,
  ) {
    const userId = req.user?.id || 1;
    return this.meetingService.scheduleAdvancedMeeting(userId, ideaId, dto);
  }

  /**
   * 4. جلب الاجتماعات القادمة الخاصة باللجنة (خاص بعضو اللجنة)
   */
  @Get('committee/upcoming')
  async upcomingCommitteeMeetings(@Req() req: any) {
    const userId = req.user?.id || 1;
    return this.meetingService.upcomingCommitteeMeetings(userId);
  }
}