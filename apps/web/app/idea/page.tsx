"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import ideaService from "@/services/ideaService";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";

// 1. تحديد شكل بيانات الفكرة (Interface)
interface Idea {
  id: string;
  title: string;
  description: string;
  created_at: string;
  roadmap_stage?: string; // علامة الاستفهام تعني أنه اختياري
}

export default function MyIdeasPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  
  // 2. نخبر useState أن هذه مصفوفة من نوع Idea
  const [ideas, setIdeas] = useState<Idea[]>([]);
  
  // 3. تحديد أن الخطأ قد يكون نصاً أو null
  const [error, setError] = useState<string | null>(null);
const fetchData = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);
    console.log("--- 🔵 [Frontend: MyIdeasPage] fetchData STARTED ---");

    const response = await ideaService.getMyIdeas();
    console.log("--- 🔵 [Frontend: MyIdeasPage] Response received from service:", response);

    // التحقق من نوع البيانات القادمة
    if (!response) {
       console.warn("--- 🔵 [Frontend] Warning: Response is null or undefined!");
    }
    
    setIdeas(Array.isArray(response) ? response : (response.ideas || []));
    console.log("--- 🔵 [Frontend] Ideas state updated successfully.");

  } catch (err: any) {
    console.error("--- 🔴 [Frontend: MyIdeasPage] ❌ Error caught in fetchData!");
    console.error(err);
    
    setError(err?.message || "Failed to load your ideas");
  } finally {
    setLoading(false);
    console.log("--- 🔵 [Frontend: MyIdeasPage] fetchData FINISHED ---");
  }
}, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  

  

  const handleNavigateToIdeaSubmission = () => {
    router.push("/submit-idea");
  };

  // 4. تحديد نوع الـ parameter هنا كـ Idea
  const handleIdeaClick = (idea: Idea) => {
    if (idea.roadmap_stage) {
      router.push(`/ideas/${idea.id}/roadmap`);
    } else {
      router.push(`/ideas/${idea.id}`);
    }
  };

  // 5. تحديد أنواع المدخلات للوظائف الأخرى
  const handleCommitteeClick = (committeeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/committees/${committeeId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading your ideas..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <button onClick={handleNavigateToIdeaSubmission} className="flex items-center gap-2">
        <Plus /> Add Idea
      </button>

      {error && <ErrorMessage message={error} onRetry={fetchData} />}

      <div className="mt-6 space-y-4">
        {ideas.map((idea) => (
          <div 
            key={idea.id} 
            onClick={() => handleIdeaClick(idea)}
            className="cursor-pointer border p-4 rounded-lg hover:bg-slate-50"
          >
            <h3 className="font-bold">{idea.title}</h3>
            <p className="text-gray-600">{idea.description}</p>
            <span className="text-sm text-gray-400">{formatDate(idea.created_at)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}