// "use server";
// C:\Users\HP\Desktop\hotal\apps\web\app\commiteeDashboard\CommitteeDashboard\components\DashboardTabs\DashboardT
// import { redirect } from 'next/navigation';
// import profileService from '@/services/profileService';
// import ProfileContent from './profileContent'; // تأكد من وجود هذا الملف ومساره الصحيح
// import { getSession } from '@/lib/session'; // تأكد من صحة مسار الجلسة في مشروعك
// async function getProfileData(role: string) {
//   console.log("--- [Server Component: ProfilePage] getProfileData: Attempting to fetch profile and ideas. ---");
//   try {
//     const session = await getSession();
//     // جلب بيانات البروفايل
//     console.log("--- [Server Component: ProfilePage] getProfileData: Calling profileService.getProfile(). ---");
//     const profileResponse = await profileService.getProfile();
//     console.log("--- [Server Component: ProfilePage] getProfileData: Received profileResponse. ---");
    
//     // جلب الأفكار مع معالجة الخطأ بشكل منفصل
//     console.log("--- [Server Component: ProfilePage] getProfileData: Calling profileService.getMyIdeas(). ---");
//     const ideasResponse = await profileService.getMyIdeas().catch((err) => {
//       console.error("--- [Server Component: ProfilePage] getProfileData: ❌ Ideas fetch failed:", err);
//       return []; 
//     });
//     console.log("--- [Server Component: ProfilePage] getProfileData: Received ideasResponse. ---");

//     // معالجة شكل البيانات القادمة من الباك إند
//     const ideas = Array.isArray(ideasResponse) 
//       ? ideasResponse 
//       : (ideasResponse?.ideas || []);
//     console.log(`--- [Server Component: ProfilePage] getProfileData: Processed ideas. Count: ${ideas.length} ---`);


//     const role = session.user.role as string;
//   console.log(`--- [Server Component: ProfilePage] Current User Role: ${role} ---`);

//   // 2. 🔀 إذا كان المستخدم عضو لجنة، قم بتوجيهه فوراً إلى لوحة تحكم اللجنة
//   if (role === 'COMMITTEE_MEMBER') { 
//     console.log("--- [Server Component: ProfilePage] User is a Committee Member. Redirecting to Committee Dashboard... ---");
    
//     // ⚠️ قم بتعديل هذا الرابط بناءً على اسم المجلد الفعلي لديك (مثلاً: /committee-dashboard أو /committee/dashboard)
//     redirect("/committee/dashboard");}
//     return {
//       profile: profileResponse,
//       ideas: ideas,
//     };
//   } catch (error: any) {
//     console.error("--- [Server Component: ProfilePage] getProfileData: 🔥 Profile Data Fetch Error:", error.message);
//     console.error(error); // سجل الكائن الخطأ بالكامل لمزيد من التفاصيل

//     // إذا كان الخطأ متعلق بالتوكن (Failed to refresh token) 
//     // أو إذا كان الرد 401 (غير مصرح)، نقوم بإرجاع null لتوجيه المستخدم
//     if (error.message?.includes("refresh token") || error.status === 401) {
//       console.log("--- [Server Component: ProfilePage] getProfileData: Authentication error detected. Returning null. ---");
//       return null;
//     }

//     // لأي أخطاء أخرى، نلقي الخطأ ليظهر في error boundary
//     console.error("--- [Server Component: ProfilePage] getProfileData: Re-throwing generic error for error boundary. ---");
//     throw new Error("Failed to load profile data");
//   }
// }

// export default async function ProfilePage() {
//   console.log("--- [Server Component: ProfilePage] 🚀 Step 1: Checking session and role before fetching anything ---");
  
//   // 1. جلب الجلسة أولاً للتحقق من هوية المستخدم ودوره
//   const session = await getSession();

//   if (!session || !session.user) {
//     console.log("--- [Server Component: ProfilePage] No active session, redirecting to signin ---");
//     redirect("/auth/signin");
//   }

//   const role = session.user.role as string;
//   console.log(`--- [Server Component: ProfilePage] Current User: ${session.user.name} | Role: ${role} ---`);

//   // 2. 🔀 التوجيه الفوري لعضو اللجنة ومنعه من طلب بيانات البروفايل الخاصة بـ idea-owner
//   if (role === 'COMMITTEE_MEMBER') {
//     console.log("--- [Server Component: ProfilePage] 🔀 User is a Committee Member. Redirecting directly to dashboard... ---");
    
//     // ⚠️ تأكد أن هذا الرابط يطابق اسم المجلد الفعلي للوحة التحكم الخاصة باللجنة في مشروعك
//     redirect("/committee/dashboard"); 
//   }

//   // 3. إذا لم يكن عضو لجنة (أي أنه IDEA_OWNER)، يتم إكمال الكود بشكل طبيعي لجلب بياناته
//   console.log("--- [Server Component: ProfilePage] User is IDEA_OWNER. Proceeding to fetch data safely... ---");
  
//   try {
//     // جلب بيانات البروفايل الخاصة بصاحب الفكرة
//     const profileResponse = await profileService.getProfile(role);
    
//     // جلب الأفكار
//     const ideasResponse = await profileService.getMyIdeas().catch((err) => {
//       console.error("--- [Server Component: ProfilePage] ❌ Ideas fetch failed:", err);
//       return []; 
//     });
    
//     const ideas = Array.isArray(ideasResponse) 
//       ? ideasResponse 
//       : (ideasResponse?.ideas || []);

//     const data = {
//       profile: profileResponse,
//       ideas: ideas,
//       role: role
//     };

//     // استيراد المكون وعرضه هنا (يمكنك تركه كـ Dynamic Import أو عادي حسب مشروعك)
//     const ProfileContent = require('./profileContent').default;
//     return <ProfileContent initialData={data} />;

//   } catch (error: any) {
//     console.error("--- [Server Component: ProfilePage] 🔥 Profile Data Fetch Error:", error.message);

//     if (error.message?.includes("refresh token") || error.status === 401) {
//       redirect("/auth/signin");
//     }

//     throw new Error("Failed to load profile data");
//   }


// }
// // "use server";
// import { redirect } from 'next/navigation';
// import profileService from '@/services/profileService';
// import ProfileContent from './profileContent'; 
// import { getSession } from '@/lib/session'; 

// export default async function ProfilePage() {
//   console.log("--- [Server Component: ProfilePage] 🚀 Checking session and role ---");
  
//   // 1. جلب الجلسة والتحقق من صلاحية المستخدم
//   const session = await getSession();

//   if (!session || !session.user) {
//     console.log("--- [Server Component: ProfilePage] No active session, redirecting to signin ---");
//     redirect("/auth/signin");
//   }

//   const role = session.user.role as string;
//   console.log(`--- [Server Component: ProfilePage] Current User: ${session.user.name} | Role: ${role} ---`);

//   // 2. 🔀 التوجيه الفوري لعضو اللجنة (خارج أي try/catch لمنع اعتراض الـ redirect)
//   if (role === 'COMMITTEE_MEMBER') {
//     console.log("--- [Server Component: ProfilePage] 🔀 User is a Committee Member. Redirecting directly to dashboard... ---");
//     redirect("/commiteeDashboard"); 
//   }

//   // 3. إذا لم يكن عضو لجنة (أي أنه IDEA_OWNER)، يتم إكمال الكود بشكل طبيعي
//   console.log("--- [Server Component: ProfilePage] User is IDEA_OWNER. Fetching data... ---");
  
//   let profileResponse;
//   let ideasResponse;

//   try {
//     // جلب بيانات البروفايل
//     profileResponse = await profileService.getProfile();
    
//     // جلب الأفكار مع حمايتها من الانهيار
//     ideasResponse = await profileService.getMyIdeas().catch((err) => {
//       console.error("--- [Server Component: ProfilePage] ❌ Ideas fetch failed:", err);
//       return []; 
//     });

//   } catch (error: any) {
//     console.error("--- [Server Component: ProfilePage] 🔥 Profile Data Fetch Error:", error.message);

//     // التحقق إذا كان الخطأ بسبب صلاحيات التوكن لتوجه المستخدم لتسجيل الدخول
//     if (error.status === 401 || error.message?.includes("refresh token")) {
//       redirect("/auth/signin");
//     }

//     // لرمي أي خطأ حقيقي آخر للـ Error Boundary
//     throw error;
//   }

//   // معالجة مصفوفة الأفكار وتجهيز الـ Data للمكون
//   const ideas = Array.isArray(ideasResponse) 
//     ? ideasResponse 
//     : (ideasResponse?.ideas || []);

//   const data = {
//     profile: profileResponse,
//     ideas: ideas,
//     role: role
//   };

//   console.log("--- [Server Component: ProfilePage] ✅ Rendering ProfileContent for IDEA_OWNER ---");
//   return <ProfileContent initialData={data} />;
// }
// app/profile/page.tsx

// 💡 ملاحظة: تم حذف "use server" لأن هذا الملف Server Component افتراضياً.

import { redirect } from 'next/navigation';
import profileService from '@/services/profileService';
import ProfileContent from './profileContent'; 
import { getSession } from '@/lib/session'; 

export default async function ProfilePage() {
  console.log("--- [Server Component: ProfilePage] 🚀 Checking session and role ---");
  
  // 1. جلب الجلسة والتحقق من صلاحية المستخدم
  const session = await getSession();

  if (!session || !session.user) {
    console.log("--- [Server Component: ProfilePage] No active session, redirecting to signin ---");
    redirect("/auth/signin");
  }

  const role = String(session.user.role || "").trim().toUpperCase();
  console.log(`--- [Server Component: ProfilePage] Current User: ${session.user.name} | Role: ${role} ---`);

  // 2. 🔀 التوجيه الفوري لعضو اللجنة (خارج try/catch لضمان عمل الـ redirect بشكل صحيح في Next.js)
  if (role.includes("COMMITTEE_MEMBER")) {
    console.log("--- [Server Component: ProfilePage] 🔀 User is a Committee Member. Redirecting directly to dashboard... ---");
    
    // ✅ تم تحديث المسار ليطابق الهيكلية الجديدة الصحيحة إملائياً ومجلداتك الحالية
 redirect("/commiteeDashboard");
  }

  // 3. إذا لم يكن عضو لجنة (أي أنه IDEA_OWNER)، يتم إكمال الكود بشكل طبيعي لجلب بياناته
  console.log("--- [Server Component: ProfilePage] User is IDEA_OWNER. Fetching data... ---");
  
  let profileResponse;
  let ideasResponse;

  try {
    // جلب بيانات البروفايل الخاصة بصاحب الفكرة
    profileResponse = await profileService.getProfile();
    
    // جلب الأفكار مع حمايتها من الانهيار (إذا فشل جلب الأفكار لا تنهار الصفحة كاملة)
    ideasResponse = await profileService.getMyIdeas().catch((err) => {
      console.error("--- [Server Component: ProfilePage] ❌ Ideas fetch failed:", err);
      return []; 
    });

  } catch (error: any) {
    console.error("--- [Server Component: ProfilePage] 🔥 Profile Data Fetch Error:", error.message);

    // التحقق إذا كان الخطأ بسبب انتهاء صلاحية التوكن (401) لتوجه المستخدم لتسجيل الدخول
    if (error.status === 401 || error.message?.includes("refresh token")) {
      redirect("/auth/signin");
    }

    // لرمي أي خطأ حقيقي آخر ليتم الإمساك به في الـ Error Boundary القريب
    throw error;
  }

  // معالجة مصفوفة الأفكار وتجهيز الـ Data للمكون الكليينت
  const ideas = Array.isArray(ideasResponse) 
    ? ideasResponse 
    : (ideasResponse?.ideas || []);

  const data = {
    profile: profileResponse,
    ideas: ideas,
    role: role
  };

  console.log("--- [Server Component: ProfilePage] ✅ Rendering ProfileContent for IDEA_OWNER ---");
  return <ProfileContent initialData={data} />;
}