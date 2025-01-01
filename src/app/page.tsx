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
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
      <div className="fixed top-8">
        <h1 className="text-4xl font-bold text-pink-500 animate-bounce">
          ✨ 抽卡片---随机作业 ✨
        </h1>
      </div>
      <div className="w-full max-w-3xl h-[800px] relative bg-white/50 rounded-3xl shadow-xl p-8">
        <LuckyCard />
      </div>
    </main>
  );
};

export default Home;
