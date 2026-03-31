"use client"; // إضافة ضرورية جداً في Next.js لأننا نستخدم تفاعلات المستخدم (onClick, useRouter, Lottie)

import React from 'react';
import { useRouter } from 'next/navigation'; // استخدام موجه Next.js بدلاً من react-router-dom
import Link from 'next/link'; // استخدام رابط Next.js
import Lottie from 'lottie-react';

// تأكد من مسار الاستيراد بناءً على هيكلة مشروعك، يفضل استخدام Alias مثل @
import bubleAnimation from "../../assets/animations/buble.json";

const ProdifyLanding = () => {
  const router = useRouter(); 

  const handleStartBuilding = () => {
    router.push('/'); // تغيير navigate إلى router.push
  };

  const features = [
    {
      title: "Submit & Innovate",
      description: "Present your groundbreaking ideas. Our platform is designed to transform creative concepts into actionable business plans with structured guidance and expert feedback.",
      color: "from-orange-500 to-amber-500"
    },
    {
      title: "Committee Evaluation",
      description: "Your idea is reviewed by a specialized committee of industry experts, investors, and technical advisors who provide comprehensive assessment and strategic direction.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Roadmap Development",
      description: "Receive a customized development roadmap with clear milestones, timelines, and resource allocation to ensure systematic project progression.",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Funding & Support",
      description: "Access to investment opportunities, technical resources, and mentorship programs to accelerate your project's growth and market readiness.",
      color: "from-emerald-500 to-green-500"
    },
    {
      title: "Launch & Scale",
      description: "Deploy your solution to market with our launch support, marketing strategies, and post-launch monitoring to ensure sustainable growth.",
      color: "from-red-500 to-orange-500"
    },
    {
      title: "Profit Distribution",
      description: "Clear and transparent profit-sharing model that rewards all contributors: idea owners, committee members, investors, and platform administration.",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  const benefits = [
    "Expert committee evaluation and guidance",
    "Structured development roadmap",
    "Access to funding and investors",
    "Technical and business mentorship",
    "Market launch support",
    "Transparent profit distribution",
    "Legal and intellectual property protection",
    "Continuous performance monitoring"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
      {/* Hero Section */}
      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          <Lottie 
            animationData={bubleAnimation}
            loop={true}
            autoplay={true}
            className="w-full h-full"
            style={{ width: '100vw', height: '100vh' }}
          />
        </div>

        <div className="absolute inset-0 z-1">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-gradient-to-r from-orange-400 to-red-600 opacity-20 animate-float"
              style={{
                width: Math.random() * 25 + 10 + 'px',
                height: Math.random() * 25 + 10 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                animationDelay: Math.random() * 5 + 's',
                animationDuration: Math.random() * 10 + 10 + 's'
              }}
            />
          ))}
        </div>

        <div className="relative z-10 min-h-screen flex flex-col justify-center items-center p-8">
          <div className="max-w-7xl mx-auto text-center w-full">
            <div 
              className="flex flex-col items-center cursor-pointer select-none mb-8" 
              onClick={() => router.push("/")}
            >
              <span className="text-7xl md:text-8xl font-black text-[#f87115] tracking-tighter leading-[0.8]">
                Idea
              </span>
              <div className="relative">
                <div className="bg-gradient-to-r from-orange-500 to-red-600 px-4 py-2 rounded-lg mt-2 ml-24 transform -rotate-1">
                  <span className="text-white text-4xl md:text-5xl font-black tracking-tighter">
                    2Life
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mb-12">
              <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">
                Where <span className="bg-gradient-to-r from-orange-500 to-red-600 text-transparent bg-clip-text">Innovation</span> Meets <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-transparent bg-clip-text">Execution</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-light">
                A comprehensive ecosystem that transforms your ideas into successful ventures through expert evaluation, structured development, and sustainable growth.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <button
                onClick={handleStartBuilding}
                className="group relative bg-gradient-to-r from-orange-500 to-red-600 py-4 px-10 rounded-full text-white font-bold text-lg transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/30 transform hover:scale-105"
              >
                Launch Your Venture
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              From <span className="bg-gradient-to-r from-orange-500 to-red-600 text-transparent bg-clip-text">Concept</span> to <span className="bg-gradient-to-r from-emerald-500 to-green-500 text-transparent bg-clip-text">Commercialization</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our structured 6-step process ensures your idea receives the attention, resources, and guidance needed to succeed in today's competitive market.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group relative p-8 rounded-3xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:border-transparent transition-all duration-500 hover:transform hover:scale-[1.02] hover:shadow-2xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`}></div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Why <span className="bg-gradient-to-r from-orange-500 to-red-600 text-transparent bg-clip-text">Choose</span> Idea2Life?
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Comprehensive Benefits
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Ready to Transform Your <span className="bg-gradient-to-r from-orange-500 to-red-600 text-transparent bg-clip-text">Idea</span>?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join hundreds of innovators who have successfully launched their ventures through our platform. 
          </p>
          
          <button
            onClick={handleStartBuilding}
            className="bg-gradient-to-r from-orange-500 to-red-600 py-4 px-12 rounded-full text-white font-bold text-lg hover:shadow-2xl hover:shadow-orange-500/30 transition-all transform hover:scale-105"
          >
            Start Your Journey
          </button>

          <div className="mt-12 pt-8 border-t border-gray-700">
            <p className="text-gray-400 text-sm">
              By proceeding, you acknowledge and agree to our{' '}
              {/* تغيير سمة "to" إلى "href" لتتوافق مع Next.js */}
              <Link href="/terms-and-conditions" className="text-orange-400 hover:text-orange-300 font-bold underline">
                Platform Policies
              </Link>
              {' '}including execution commitments, financial obligations, and profit distribution terms.
            </p>
          </div>
        </div>
      </div>

      {/* في Next.js يفضل استخدام <style> عادية بدلاً من style jsx إذا لم تكن مفعلة */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ProdifyLanding;