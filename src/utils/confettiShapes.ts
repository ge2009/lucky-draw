import confetti from 'canvas-confetti';

// note: you CAN only use a path for confetti.shapeFrompath(), but for
// performance reasons it is best to use it once in development and save
// the result to avoid the performance penalty at runtime

// pumpkin shape from https://thenounproject.com/icon/pumpkin-5253388/
export const pumpkin = confetti.shapeFromPath({
  path: 'M449.4 142c-5 0-10 .3-15 1a183 183 0 0 0-66.9-19.1V87.5a17.5 17.5 0 1 0-35 0v36.4a183 183 0 0 0-67 19c-4.9-.6-9.9-1-14.8-1C170.3 142 105 219.6 105 315s65.3 173 145.7 173c5 0 10-.3 14.8-1a184.7 184.7 0 0 0 169 0c4.9.7 9.9 1 14.9 1 80.3 0 145.6-77.6 145.6-173s-65.3-173-145.7-173zm-220 138 27.4-40.4a11.6 11.6 0 0 1 16.4-2.7l54.7 40.3a11.3 11.3 0 0 1-7 20.3H239a11.3 11.3 0 0 1-9.6-17.5zM444 383.8l-43.7 17.5a17.7 17.7 0 0 1-13 0l-37.3-15-37.2 15a17.8 17.8 0 0 1-13 0L256 383.8a17.5 17.5 0 0 1 13-32.6l37.3 15 37.2-15c4.2-1.6 8.8-1.6 13 0l37.3 15 37.2-15a17.5 17.5 0 0 1 13 32.6zm17-86.3h-82a11.3 11.3 0 0 1-6.9-20.4l54.7-40.3a11.6 11.6 0 0 1 16.4 2.8l27.4 40.4a11.3 11.3 0 0 1-9.6 17.5z',
  matrix: new DOMMatrix([0.020491803278688523, 0, 0, 0.020491803278688523, -7.172131147540983, -5.9016393442622945])
});

// tree shape from https://thenounproject.com/icon/pine-tree-1471679/
export const tree = confetti.shapeFromPath({
  path: 'M120 240c-41,14 -91,18 -120,1 29,-10 57,-22 81,-40 -18,2 -37,3 -55,-3 25,-14 48,-30 66,-51 -11,5 -26,8 -45,7 20,-14 40,-30 57,-49 -13,1 -26,2 -38,-1 18,-11 35,-25 51,-43 -13,3 -24,5 -35,6 21,-19 40,-41 53,-67 14,26 32,48 54,67 -11,-1 -23,-3 -35,-6 15,18 32,32 51,43 -13,3 -26,2 -38,1 17,19 36,35 56,49 -19,1 -33,-2 -45,-7 19,21 42,37 67,51 -19,6 -37,5 -56,3 25,18 53,30 82,40 -30,17 -79,13 -120,-1l0 41 -31 0 0 -41z',
  matrix: new DOMMatrix([0.03597122302158273, 0, 0, 0.03597122302158273, -4.856115107913669, -5.071942446043165])
});

// heart shape from https://thenounproject.com/icon/heart-1545381/
export const heart = confetti.shapeFromPath({
  path: 'M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z',
  matrix: new DOMMatrix([0.03333333333333333, 0, 0, 0.03333333333333333, -5.566666666666666, -5.533333333333333])
});

export const defaultConfettiConfig = {
  scalar: 1.2,           // 更小的形状，让动画更轻盈
  spread: 90,           // 更集中的扩散角度
  particleCount: 25,    // 增加粒子数量
  origin: { y: 0.2 },   // 从更高处开始
  startVelocity: 30,    // 适中的初始速度
  gravity: 0.65,        // 减小重力，让粒子飘得更久
  drift: 0.1,           // 轻微的水平漂移
  ticks: 400,           // 更长的动画时间
  decay: 0.94,          // 更慢的衰减速度
  zIndex: 2000,
  shapes: [pumpkin, tree, heart],
  colors: [
    ['#FFD700', '#FFA500', '#FF8C00', '#FF4500'], // 金色系
    ['#FF69B4', '#FF1493', '#FF0066', '#FF0033'], // 粉色系
    ['#4169E1', '#0000FF', '#000080', '#191970']  // 蓝色系
  ]
};

// 优化后的撒花效果配置
export const triggerOptimizedConfetti = () => {
  // 主要撒花效果
  defaultConfettiConfig.colors.forEach((colors, index) => {
    // 第一波：从中间向两侧发射
    setTimeout(() => {
      confetti({
        ...defaultConfettiConfig,
        shapes: [defaultConfettiConfig.shapes[index]],
        colors: colors,
        origin: { x: 0.5, y: defaultConfettiConfig.origin.y },
        angle: 90,
        spread: 120,
      });
    }, index * 150);

    // 第二波：从两侧向中间发射
    setTimeout(() => {
      confetti({
        ...defaultConfettiConfig,
        shapes: [defaultConfettiConfig.shapes[index]],
        colors: colors,
        origin: { x: 0.2, y: defaultConfettiConfig.origin.y },
        angle: 60 + index * 15,
      });

      confetti({
        ...defaultConfettiConfig,
        shapes: [defaultConfettiConfig.shapes[index]],
        colors: colors,
        origin: { x: 0.8, y: defaultConfettiConfig.origin.y },
        angle: 120 - index * 15,
      });
    }, 150 + index * 150);

    // 第三波：额外的装饰效果
    setTimeout(() => {
      confetti({
        ...defaultConfettiConfig,
        shapes: [defaultConfettiConfig.shapes[index]],
        colors: colors,
        particleCount: 15,
        spread: 60,
        origin: { x: 0.3 + index * 0.2, y: defaultConfettiConfig.origin.y },
        angle: 75 + index * 15,
      });

      confetti({
        ...defaultConfettiConfig,
        shapes: [defaultConfettiConfig.shapes[index]],
        colors: colors,
        particleCount: 15,
        spread: 60,
        origin: { x: 0.7 - index * 0.2, y: defaultConfettiConfig.origin.y },
        angle: 105 - index * 15,
      });
    }, 300 + index * 150);
  });

  // 最后的点缀效果
  setTimeout(() => {
    confetti({
      ...defaultConfettiConfig,
      particleCount: 30,
      spread: 180,
      origin: { x: 0.5, y: 0.3 },
      colors: defaultConfettiConfig.colors.flat(),
      shapes: defaultConfettiConfig.shapes,
      scalar: 0.8,
      ticks: 300,
      gravity: 0.8,
      drift: 0.2,
    });
  }, 800);
}; 