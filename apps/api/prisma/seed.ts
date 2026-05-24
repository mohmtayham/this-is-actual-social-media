/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');
  
  const hashedPassword = await argon2.hash('password123@@');

  // 1. إنشاء حساب المسؤول (Admin)
// 1. إنشاء حساب المسؤول (Admin)
const admin = await prisma.user.upsert({
  where: { email: 'admin@hotal.com' },
  update: {
    password: hashedPassword, // 🔥 This will now update the password if the user exists
  },
  create: {
    name: 'System Admin',
    email: 'admin@hotal.com',
    password: hashedPassword,
    role: 'ADMIN',
  },
});

// 2. 🔥 إنشاء حساب جديد مخصص ليكون عضو لجنة
const committeeUser = await prisma.user.upsert({
  where: { email: 'member@hotal.com' },
  update: {
    password: hashedPassword, // 🔥 This will update this user's password too
  },
  create: {
    name: 'Dr. Ahmad Mustafa',
    email: 'member@hotal.com',
    password: hashedPassword,
    role: 'COMMITTEE_MEMBER', 
    phone: '+966500000000',
    bio: 'خبير تقني ومتخصص في تقييم المشاريع الناشئة والذكاء الاصطناعي.',
  },
});
  // 3. إنشاء أو جلب اللجنة
  // استخدمنا findFirst/create هنا لتجنب مشاكل التكرار إذا تم تشغيل الـ seed أكثر من مرة
  let committee = await prisma.committee.findFirst({
    where: { name: 'Main Committee' }
  });

  if (!committee) {
    committee = await prisma.committee.create({
      data: {
        name: 'Main Committee',
        description: 'The main committee responsible for reviewing ideas.',
      },
    });
  }

  // 4. 🔥 ربط المستخدم باللجنة عبر جدول الـ CommitteeMember
  const isAlreadyMember = await prisma.committeeMember.findFirst({
    where: {
      userId: committeeUser.id,
      committeeId: committee.id,
    }
  });

  if (!isAlreadyMember) {
    await prisma.committeeMember.create({
      data: {
        userId: committeeUser.id,
        committeeId: committee.id,
        roleInCommittee: 'TECHNICAL_EXPERT', // متوافق مع Enum CommitteeMemberRole (LEADER, MEMBER, INVESTOR, TECHNICAL_EXPERT)
      },
    });
    console.log('👥 Committee Member linked successfully.');
  }

  // 5. إنشاء فكرة تجريبية وربطها بالمستخدم واللجنة
  const sampleIdea = await prisma.idea.findFirst({
    where: { title: 'Sample Idea' }
  });

  if (!sampleIdea) {
    await prisma.idea.create({
      data: {
        title: 'Sample Idea',
        description: 'This is a sample idea for testing purposes.',
        ownerId: admin.id, 
        committeeId: committee.id, 
        status: 'SUBMITTED',
      },
    });
    console.log('💡 Sample Idea created.');
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });