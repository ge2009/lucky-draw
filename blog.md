---
description: "使用 Next.js 和 React 开发的一个有趣的作业抽取应用，帮助孩子克服选择困难" 
date: 2025-01-04
math: false
title: 用代码表达父爱：开发一个趣味作业抽卡应用
license: MIT
hidden: false
comments: true
draft: false    
params:
  author: JasonAir
---

# 缘起：一个父亲的小心思

作为一个程序员爸爸，看着女儿每天面对作业时的选择困难症，总是纠结着"先写语文还是数学"、"要不要先做口算"，我突发奇想 —— 何不把这个选择的过程变成一个有趣的游戏呢？

于是，这个名为"Lucky Draw"的作业抽卡应用就诞生了。

# 设计理念：让作业选择变得有趣

整个应用的设计理念很简单：通过精美的 3D 卡片动画、炫彩的撒花效果和悦耳的音效，将枯燥的作业选择转变为一个充满期待和乐趣的过程。

## 主要特色

1. **精美的视觉效果**
   - 3D 旋转的彩色卡片墙
   - 抽中卡片时的立体动画
   - celebratory 撒花特效
   - 渐变色和毛玻璃效果的界面设计

2. **人性化的交互**
   - 一键抽取作业
   - 清晰的奖品列表展示
   - 已完成作业的标记系统
   - 响应式设计，完美支持手机端

3. **贴心的功能设计**
   - 自定义作业内容
   - 童锁保护（防止孩子自行修改）
   - 音效开关控制
   - 一键重置功能

## 技术实现

项目采用了现代化的技术栈：
- Next.js 框架
- React 组件系统
- TypeScript 类型安全
- Styled Components 样式管理
- Canvas Confetti 特效

### 一些有趣的技术细节

1. **3D 卡片效果**
```css
.card {
  transform-style: preserve-3d;
  transition: all 0.5s;
  background: linear-gradient(
    135deg,
    rgb(var(--color-card)) 0%,
    rgba(var(--color-card), 0.8) 100%
  );
}
```

2. **撒花特效**
```typescript
const triggerConfetti = () => {
  // 从四个角和中心同时发射彩带
  confetti({
    particleCount: 100,
    spread: 360,
    origin: { x: 0.5, y: 0.5 }
  });
};
```

3. **童锁功能**
```typescript
const [isChildLocked, setIsChildLocked] = useState(() => {
  try {
    return localStorage.getItem('isChildLocked') === 'true';
  } catch {
    return false;
  }
});
```

# 使用效果

效果出乎意料的好！女儿现在每天都期待着抽取今天的第一个作业，不仅解决了选择困难的问题，还让整个做作业的过程变得更加轻松愉快。

特别是当抽到"休息5分钟"这张卡片时，她总是特别开心，这种小小的期待和惊喜，让做作业不再是一件令人焦虑的事情。

# 开源分享

项目已经开源在 GitHub 上：[lucky-draw](https://github.com/ge2009/lucky-draw)，欢迎感兴趣的朋友们查看和使用。

你可以直接访问 [https://lucky-draw.v2ex.com.cn/](https://lucky-draw.v2ex.com.cn/) 体验这个应用。密码就是当天的日期（比如：20240301）。

# 未来计划

1. 添加更多的动画效果
2. 支持自定义卡片样式
3. 加入任务完成打卡功能
4. 增加奖励系统

# 结语

作为一个程序员父亲，能够用自己的技术为孩子解决实际问题，这种感觉真的很棒。这个小项目虽然简单，但却满载着一份父爱，希望它也能帮助到其他有类似困扰的家庭。

正如项目中的一行注释所说：
```typescript
// 这不仅仅是一个抽卡程序，更是一份来自程序员爸爸的爱
```

欢迎各位朋友们试用和提出建议，让我们一起把这个小工具做得更好！ 