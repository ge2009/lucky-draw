"use client";

import dynamic from "next/dynamic";

// 使用动态导入并禁用 SSR
const LuckyCard = dynamic(() => import("@/components/LuckyCard"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin text-pink-500 text-4xl">🎁</div>
    </div>
  ),
});

// 将整个页面组件也标记为客户端组件
const Home = () => {
  return (
    <main className="min-h-screen flex flex-col items-center justify-start p-4 relative bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
      <div className="fixed top-4 sm:top-8 z-10">
        <h1 className="text-2xl sm:text-4xl font-bold text-pink-500 animate-bounce">
          ✨ 抽卡片---随机作业 ✨
        </h1>
      </div>
      <div className="w-full max-w-3xl h-[calc(100vh-2rem)] sm:h-[800px] mt-16 sm:mt-24 relative bg-white/50 rounded-3xl shadow-xl p-4 sm:p-8 overflow-hidden">
        <LuckyCard />
      </div>
    </main>
  );
};

export default Home;
