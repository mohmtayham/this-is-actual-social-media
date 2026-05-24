//submit-idea/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; // تغيير من react-router-dom
import dynamic from "next/dynamic";
import CreativeIdea from '@/assets/animations/Creative Idea.json';
// تأكد من تحديث مسار الـ service ليتناسب مع Next.js
import { submitIdeaAction } from "@/lib/actions"; 

// استيراد Lottie بشكل ديناميكي لمنع أخطاء Hydration
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const IdeaSubmissionForm = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    problem: "",
    solution: "",
    target_audience: "",
    additional_notes: "",
    terms_accepted: false
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      const result = await submitIdeaAction(formData);
      if (!result.success) {
        setErrorMessage(result.message || "Failed to submit idea.");
        setLoading(false);
        return;
      }
      setSuccessMessage(result.message || "Idea submitted successfully!");

      setFormData({
        title: "",
        description: "",
        problem: "",
        solution: "",
        target_audience: "",
        additional_notes: "",
        terms_accepted: false
      });

      // استخدام router.push بدلاً من navigate
      if (result.idea?.id) {
        router.push(`/ideas/${result.idea.id}/roadmap`);
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || "Failed to submit idea");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { id: "title", label: "Idea Title", type: "text", placeholder: "Enter your idea title", required: true },
    { id: "description", label: "Idea Description", type: "textarea", placeholder: "Describe your idea in detail", rows: 4, required: true },
    { id: "problem", label: "Problem Statement", type: "textarea", placeholder: "What problem does this idea solve? (Optional)", rows: 3, required: false },
    { id: "solution", label: "Proposed Solution", type: "textarea", placeholder: "How does your idea solve this problem? (Optional)", rows: 3, required: false },
    { id: "target_audience", label: "Target Audience", type: "text", placeholder: "Who will benefit from this idea? (Optional)", required: false },
    { id: "additional_notes", label: "Additional Notes", type: "textarea", placeholder: "Any additional info (Optional)", rows: 3, required: false }
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-orange-50 via-pink-50 to-purple-100 p-0">
      <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2">

        {/* القسم الأيسر */}
        <div className="w-full flex flex-col justify-center items-center bg-[#FFE2AF] p-8 space-y-8">
          <div className="w-80 h-80 lg:w-96 lg:h-96">
            <Lottie animationData={CreativeIdea} loop={true} className="w-full h-full" />
          </div>
          <div className="text-center lg:text-left max-w-xs text-gray-700">
            <h2 className="text-2xl font-bold mb-4">Instructions</h2>
            <ul className="space-y-2 text-sm">
               <li><span className="font-bold text-red-500">*</span> Required fields: Title, Description</li>
               <li>1. Be clear and concise about your idea.</li>
               <li>2. Explain the problem your idea solves.</li>
               <li>3. Describe your proposed solution.</li>
               <li>4. Indicate the target audience.</li>
            </ul>
          </div>
        </div>

        {/* القسم الأيمن */}
        <div className="w-full flex flex-col justify-center items-center p-10 lg:p-16 bg-[#FFF8F0]">
          <div className="w-full max-w-xl">
            <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center lg:text-left">Submit Your Idea</h1>
            <p className="text-gray-600 mb-8 text-center lg:text-left">
              Fields marked with <span className="text-red-500 font-bold">*</span> are required
            </p>

            {successMessage && <div className="mb-6 bg-green-100 text-green-800 px-6 py-4 rounded-xl shadow-sm">{successMessage}</div>}
            {errorMessage && <div className="mb-6 bg-red-100 text-red-800 px-6 py-4 rounded-xl shadow-sm">{errorMessage}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              {fields.map(f => (
                <div key={f.id} className="space-y-2">
                  <label htmlFor={f.id} className="block text-gray-700 font-semibold">
                    {f.label} {f.required && <span className="text-red-500">*</span>}
                  </label>
                  {f.type === "textarea" ? (
                    <textarea
                      id={f.id}
                      name={f.id}
                      rows={f.rows}
                      value={formData[f.id as keyof typeof formData] as string}
                      onChange={handleInputChange}
                      placeholder={f.placeholder}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-300 outline-none transition-all bg-white"
                      required={f.required}
                    />
                  ) : (
                    <input
                      type={f.type}
                      id={f.id}
                      name={f.id}
                      value={formData[f.id as keyof typeof formData] as string}
                      onChange={handleInputChange}
                      placeholder={f.placeholder}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-300 outline-none transition-all bg-white"
                      required={f.required}
                    />
                  )}
                </div>
              ))}

              <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-xl">
                <input
                  type="checkbox"
                  id="terms_accepted"
                  name="terms_accepted"
                  checked={formData.terms_accepted}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-400 mt-1"
                  required
                />
                <label htmlFor="terms_accepted" className="text-gray-700 text-sm">
                  I agree to the terms and conditions. <span className="text-red-500">*</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-700 py-4 rounded-full text-white font-bold text-lg hover:opacity-90 transition-all disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Send Your Idea"}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default IdeaSubmissionForm;
