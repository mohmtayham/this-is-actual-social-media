import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma :PrismaService) {}
  create(createNotificationDto: CreateNotificationDto) {
    return 'This action adds a new notification';
  }

  async ownerNotifications(userId: number) {
    // 1. جلب الإشعارات الخاصة بالمستخدم من قاعدة البيانات
    const notifications = await this.prisma.notification.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }, // ترتيب الإشعارات من الأحدث إلى الأقدم
    });

    return notifications;
  }
  async markAsRead(notificationId: number, userId: number) {
    const notification= await this.prisma.notification.findUnique({
      where:{id: notificationId}
    })
    const updatedNotification = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
    return {
    message: 'Notification marked as read successfully',
    notification: updatedNotification,
    }
  }



  findAll() {
    return `This action returns all notifications`;
  }

  findOne(id: number) {
    return `This action returns a #${id} notification`;
  }

  update(id: number, updateNotificationDto: UpdateNotificationDto) {
    return `This action updates a #${id} notification`;
  }

  remove(id: number) {
    return `This action removes a #${id} notification`;
  }
}