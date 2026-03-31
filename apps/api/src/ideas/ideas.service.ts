// src/ideas/ideas.service.ts
import { Injectable, ForbiddenException, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { IdeaStatus } from '@prisma/client'; // أضف هذا السطر
import { UpdateIdeaDto } from './dto/update-idea.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class IdeasService {
  private readonly logger = new Logger(IdeasService.name);

  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateIdeaDto) {
    try {
      // Check terms acceptance
      if (!dto.terms_accepted) {
        throw new ForbiddenException('You must accept the terms and conditions to proceed');
      }

      // Verify user role
      const user = await this.prisma.user.findUnique({ 
        where: { id: userId } 
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

       if (user.role !== 'IDEA_OWNER') {
         throw new ForbiddenException('This action is only available for idea owners');
       }

      // Find the committee with the least ideas for fair distribution
      const committee = await this.findBestCommittee();
      
      if (!committee) {
        throw new InternalServerErrorException('No committees available');
      }

      // Create the idea
      const idea = await this.prisma.idea.create({
        data: {
          ownerId: userId,
          committeeId: committee.id,
          title: dto.title,
          description: dto.description,
          problem: dto.problem,
          solution: dto.solution,
          targetAudience: dto.target_audience,
          additionalNotes: dto.additional_notes,
          status: IdeaStatus.UNDER_REVIEW, // بدلاً من 'pending'
          roadmapStage: 'Idea Submission',
        },
      });

      this.logger.log(`Idea created successfully with ID: ${idea.id}`);
      
      return {
        message: 'Idea submitted and assigned to committee successfully',
        ideaId: idea.id,
      };
    } catch (error) {
      this.logger.error(`Failed to create idea: ${error.message}`);
      throw error;
    }
  }
 async findByOwner(userId: number) {
  console.log(`--- 🔍 [Backend: IdeasService] findByOwner STARTED for userId: ${userId} ---`);
  
  try {
    // طباعة نوع البيانات للتأكد هل هو Number أم String
    console.log(`[IdeasService] Type of userId is: ${typeof userId}`);

    const ideas = await this.prisma.idea.findMany({
      where: {
        // ⚠️ تأكد من أن اسم الحقل هنا (مثلاً ownerId) هو نفسه الموجود في prisma.schema لديك
        ownerId: userId, 
      },
    });

    console.log(`--- 🔍 [Backend: IdeasService] Prisma query finished. Found ${ideas.length} ideas.`);
    
    if (ideas.length === 0) {
      console.warn(`[IdeasService] ⚠️ Note: Database returned 0 records for ownerId: ${userId}`);
    }

    return ideas;

  } catch (error: any) {
    console.error(`--- ❌ [Backend: IdeasService] Error querying database in findByOwner!`);
    console.error(error.message);
    throw error;
  }
}

  // Method for updating idea content (title, description, etc.) - ONLY OWNER
  async updateContent(ideaId: number, userId: number, dto: UpdateIdeaDto) {
    try {
      // Find the idea
      const idea = await this.prisma.idea.findUnique({
        where: { id: ideaId }
      });

      if (!idea) {
        throw new NotFoundException('Idea not found');
      }

      // Check ownership
      if (idea.ownerId !== userId) {
        throw new ForbiddenException('You do not have permission to modify this idea');
      }

      // Check if idea can be modified based on status
      const restrictedStatuses = ['approved', 'rejected'];
      if (restrictedStatuses.includes(idea.status)) {
        throw new ForbiddenException(`Cannot modify idea because it is ${idea.status}`);
      }

      // Update roadmap stage if needed
      // بدلاً من 'needs_revision' جرب استخدام القيمة من الـ Enum مباشرة
const roadmapStage = idea.status === IdeaStatus.NEEDS_REVISION ? 'Revising' : idea.roadmapStage;

      // Update the idea (only content fields, no status change)
      const updatedIdea = await this.prisma.idea.update({
  where: { id: ideaId },
  data: {
    title: dto.title,
    description: dto.description,
    problem: dto.problem,
    solution: dto.solution,
    targetAudience: dto.target_audience,
    additionalNotes: dto.additional_notes,
    roadmapStage,
  },
});

      this.logger.log(`Idea content updated successfully for ID: ${ideaId}`);

      return {
        message: 'Idea content updated successfully',
        idea: updatedIdea,
      };
    } catch (error) {
      this.logger.error(`Failed to update idea content: ${error.message}`);
      throw error;
    }
  }

  // Method for updating status only - COMMITTEE MEMBERS OR ADMINS
  async updateStatus(ideaId: number, userId: number, dto: UpdateStatusDto) {
    try {
      // Find the idea
      const idea = await this.prisma.idea.findUnique({
        where: { id: ideaId }
      });

      if (!idea) {
        throw new NotFoundException('Idea not found');
      }

      // Check if user is committee member or admin
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.role !== 'COMMITTEE_MEMBER' && user.role !== 'ADMIN') {
        throw new ForbiddenException('Only committee members or admins can update idea status');
      }

      // Update roadmap stage based on new status
      let roadmapStage = idea.roadmapStage;
      if (dto.status === IdeaStatus.NEEDS_REVISION) {
        roadmapStage = 'Revising';
      } else if (dto.status === IdeaStatus.APPROVED) {
        roadmapStage = 'Approved';
      } else if (dto.status === IdeaStatus.REJECTED) {
        roadmapStage = 'Rejected';
      } else if (dto.status === IdeaStatus.UNDER_REVIEW) {
        roadmapStage = 'Under Review';
      }

 // status: IdeaStatus;
      // Update only the status
      const updatedIdea = await this.prisma.idea.update({
        where: { id: ideaId },
        data: {
          status: dto.status,
          roadmapStage,
        },
      });

      this.logger.log(`Idea status updated successfully for ID: ${ideaId} to ${dto.status}`);

      return {
        message: `Idea status updated to ${dto.status} successfully`,
        idea: updatedIdea,
      };
    } catch (error) {
      this.logger.error(`Failed to update idea status: ${error.message}`);
      throw error;
    }
  }

  async findAll() {
    try {
      const ideas = await this.prisma.idea.findMany({
        include: {
          owner: {
            select: { 
              id: true, 
              name: true, 
              email: true,
              role: true 
            }
          },
          committee: true,
          profitDistributions: true,
        },
      });

      return {
        data: ideas,
        count: ideas.length,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch ideas: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch ideas');
    }
  }

  async findOne(id: number) {
    try {
      const idea = await this.prisma.idea.findUnique({
        where: { id },
        include: {
          owner: {
            select: { 
              id: true, 
              name: true, 
              email: true,
              role: true,
              phone: true,
              profileImage: true,
              bio: true
            }
          },
          committee: true,
          profitDistributions: {
            include: {
              user: {
                select: { id: true, name: true, email: true, role: true }
              }
            }
          },
        },
      });

      if (!idea) {
        throw new NotFoundException(`Idea with ID ${id} not found`);
      }

      return idea;
    } catch (error) {
      this.logger.error(`Failed to fetch idea: ${error.message}`);
      throw error;
    }
  }

  private async findBestCommittee() {
    try {
      const committees = await this.prisma.committee.findMany({
        include: {
          _count: {
            select: { ideas: true }
          }
        },
        orderBy: {
          ideas: {
            _count: 'asc'
          }
        }
      });

      return committees.length > 0 ? committees[0] : null;
    } catch (error) {
      this.logger.error(`Error finding best committee: ${error.message}`);
      throw new InternalServerErrorException('Failed to assign committee');
    }
  }

  async delete(ideaId: number, userId: number) {
    try {
      const idea = await this.prisma.idea.findUnique({
        where: { id: ideaId },
        include: {
          profitDistributions: true
        }
      });

      if (!idea) {
        throw new NotFoundException('Idea not found');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Allow owner or admin to delete
      if (idea.ownerId !== userId && user.role !== 'ADMIN') {
        throw new ForbiddenException('You do not have permission to delete this idea');
      }

      // Delete related profit distributions first
      if (idea.profitDistributions?.length > 0) {
        await this.prisma.profitDistribution.deleteMany({
          where: { ideaId },
        });
      }

      // Delete the idea
      await this.prisma.idea.delete({
        where: { id: ideaId },
      });

      this.logger.log(`Idea deleted successfully with ID: ${ideaId}`);

      return {
        message: 'Idea deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to delete idea: ${error.message}`);
      throw error;
    }
  }
}