import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import confetti from 'canvas-confetti';

// 导入音效
const drawSound = '/sounds/draw.mp3';
const winSound = '/sounds/win.mp3';
const clickSound = '/sounds/click.mp3';

import { Settings } from './Settings';

interface Prize {
  id: number;
  name: string;
  colorCard: string;
  isDrawn?: boolean;
}

const DEFAULT_PRIZES: Prize[] = [
  { id: 1, name: '抄作文', colorCard: '255, 183, 197' },
  { id: 2, name: '自主练习', colorCard: '173, 216, 230' },
  { id: 3, name: '数学阳光', colorCard: '255, 218, 185' },
  { id: 4, name: '数学口算', colorCard: '221, 160, 221' },
  { id: 5, name: '英语试卷', colorCard: '176, 224, 230' },
  { id: 6, name: '语文试卷', colorCard: '255, 192, 203' },
  { id: 7, name: '休息5分钟', colorCard: '255, 215, 0' },  // 金色
];

const LuckyCard = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [prizes, setPrizes] = useState<Prize[]>(DEFAULT_PRIZES);
  const [showMoveAnimation, setShowMoveAnimation] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [fadeOutName, setFadeOutName] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isReturning, setIsReturning] = useState(false);

  // 初始化加载所有奖品
  useEffect(() => {
    try {
      const savedPrizes = localStorage?.getItem('prizes');
      if (savedPrizes) {
        setPrizes(JSON.parse(savedPrizes));
      } else {
        setPrizes(DEFAULT_PRIZES);
      }
    } catch {
      setPrizes(DEFAULT_PRIZES);
    }
  }, []);

  // 音效播放函数
  const playSound = useCallback((audioSrc: string, duration?: number) => {
    if (isSoundEnabled) {
      const audio = new Audio(audioSrc);
      if (duration) {
        audio.loop = true;
        audio.play().catch(e => console.log('音频播放失败:', e));
        setTimeout(() => {
          audio.loop = false;
          audio.pause();
        }, duration);
      } else {
        audio.play().catch(e => console.log('音频播放失败:', e));
      }
    }
  }, [isSoundEnabled]);

  // 全屏撒花效果
  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { 
      startVelocity: 45, 
      spread: 360, 
      ticks: 100, 
      zIndex: 0,
      shapes: ['square', 'circle'],
      colors: ['#ff69b4', '#ff1493', '#9370db', '#20b2aa']
    };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 100 * (timeLeft / duration);
      
      // 从四个角发射
      confetti({
        ...defaults,
        particleCount: particleCount / 4,
        origin: { x: 0, y: 0 }
      });
      
      confetti({
        ...defaults,
        particleCount: particleCount / 4,
        origin: { x: 1, y: 0 }
      });
      
      confetti({
        ...defaults,
        particleCount: particleCount / 4,
        origin: { x: 0, y: 0.8 }
      });
      
      confetti({
        ...defaults,
        particleCount: particleCount / 4,
        origin: { x: 1, y: 0.8 }
      });
      
      // 从中间发射
      confetti({
        ...defaults,
        particleCount: particleCount / 2,
        origin: { x: 0.5, y: 0.5 }
      });
    }, 150); // 缩短间隔，增加密度
  };

  const handleDraw = () => {
    if (isSpinning || isReturning) return;

    if (showMoveAnimation) {
      // 如果有卡片在前面，先让它返回
      setIsReturning(true);
      setTimeout(() => {
        setShowMoveAnimation(false);
        setIsReturning(false);
        setSelectedPrize(null);
        // 重置后开始新的抽奖
        startNewDraw();
      }, 500);
    } else {
      startNewDraw();
    }
  };

  const startNewDraw = () => {
    playSound(drawSound, 3000); // 播放 3 秒的抽奖音效
    setIsSpinning(true);
    setShowResult(false);
    setFadeOutName(false);
    
    setTimeout(() => {
      const undrawnPrizes = prizes.filter(p => !p.isDrawn);
      if (undrawnPrizes.length === 0) {
        alert('所有奖品都已抽完啦！');
        setIsSpinning(false);
        return;
      }
      
      const randomIndex = Math.floor(Math.random() * undrawnPrizes.length);
      const prize = undrawnPrizes[randomIndex];
      
      setSelectedPrize(prize);
      setPrizes(prizes.map(p => 
        p.id === prize.id ? { ...p, isDrawn: true } : p
      ));
      
      setIsSpinning(false);
      setShowResult(true);
      
      // 延迟显示卡片移动动画
      setTimeout(() => {
        setShowMoveAnimation(true);
        triggerConfetti();
        playSound(winSound);
        // 延长文字消失的时间
        setTimeout(() => {
          setFadeOutName(true);
        }, 3000);
      }, 500);
    }, 3000);
  };

  const handleSavePrizes = (newPrizes: Prize[]) => {
    setPrizes(newPrizes);
    localStorage.setItem('prizes', JSON.stringify(newPrizes));
    setShowSettings(false);
  };

  const handleReset = () => {
    if (isSpinning || isReturning) return;
    
    playSound(clickSound);
    setPrizes(prizes.map(p => ({ ...p, isDrawn: false })));
    setSelectedPrize(null);
    setShowResult(false);
    setShowMoveAnimation(false);
    setFadeOutName(false);
  };

  return (
    <StyledWrapper>
      <div className="controls">
        <button 
          className="control-button settings-button" 
          onClick={() => {
            playSound(clickSound);
            setShowSettings(true);
          }}
          aria-label="设置"
        >
          ⚙️
        </button>
        <button 
          className="control-button sound-button" 
          onClick={() => setIsSoundEnabled(!isSoundEnabled)}
          aria-label={isSoundEnabled ? "关闭声音" : "开启声音"}
        >
          {isSoundEnabled ? '🔊' : '🔇'}
        </button>
        <button 
          className="control-button reset-button" 
          onClick={handleReset}
          aria-label="重新开始"
          disabled={isSpinning || isReturning}
        >
          🔄
        </button>
      </div>
      
      <div className="prize-list">
        {prizes.map((prize) => (
          <div 
            key={prize.id} 
            className={`prize-item ${prize.isDrawn ? 'drawn' : ''}`}
          >
            <span className={prize.isDrawn ? 'drawn' : ''}>
              {prize.name} {prize.isDrawn && '✓'}
            </span>
          </div>
        ))}
      </div>

      <div className="wrapper">
        <div className={`inner ${isSpinning ? 'spinning' : ''}`}>
          {prizes.map((prize, index) => (
            <div
              key={prize.id}
              className={`card ${
                showMoveAnimation && selectedPrize?.id === prize.id 
                  ? 'move-to-front' 
                  : isReturning && selectedPrize?.id === prize.id 
                  ? 'return-to-pool' 
                  : ''
              }`}
              style={{ 
                '--index': index, 
                '--color-card': prize.colorCard 
              } as React.CSSProperties}
            >
              <div className="img">
                {showResult && selectedPrize && prize.id === selectedPrize.id && (
                  <div className={`prize-content ${fadeOutName ? 'fade-out' : ''}`}>
                    {selectedPrize.name}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button 
        className="draw-button" 
        onClick={handleDraw}
        disabled={isSpinning}
      >
        {isSpinning ? '抽取中...' : '抽取福袋'}
      </button>

      {showResult && selectedPrize && (
        <div className="result">
          恭喜你抽中了：{selectedPrize.name}
        </div>
      )}

      {showSettings && (
        <Settings 
          prizes={prizes} 
          onSave={handleSavePrizes} 
          onClose={() => setShowSettings(false)}
        />
      )}
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 20px;
  position: relative;

  .prize-list {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
    margin-bottom: 30px;
    max-width: 600px;
    perspective: 1000px;
  }

  .prize-item {
    padding: 10px 20px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 20px;
    font-size: 16px;
    color: #666;
    transition: all 0.5s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    transform-style: preserve-3d;
    
    &.drawn {
      animation: boxFadeOut 1s forwards;
    }

    span {
      display: inline-block;
      transition: all 0.5s ease;

      &.drawn {
        color: #ff69b4;
        animation: particleEffect 1s forwards;
      }
    }
  }

  @keyframes boxFadeOut {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(0.9);
      opacity: 0.5;
    }
    100% {
      transform: scale(0);
      opacity: 0;
      margin: 0;
      padding: 0;
      width: 0;
      height: 0;
    }
  }

  .controls {
    position: fixed;
    top: 20px;
    right: 20px;
    display: flex;
    gap: 12px;
    z-index: 1000;
  }

  .control-button {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: inherit;
      transition: all 0.3s ease;
      opacity: 0.7;
    }

    &:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);

      &::before {
        opacity: 1;
      }
    }

    &:active:not(:disabled) {
      transform: translateY(-1px);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .settings-button {
    background: linear-gradient(135deg, #ff69b4, #ff1493);
  }

  .sound-button {
    background: linear-gradient(135deg, #9370db, #8a2be2);
  }

  .reset-button {
    background: linear-gradient(135deg, #20b2aa, #008b8b);
    
    &:not(:disabled) {
      animation: pulse 2s infinite;
    }
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(32, 178, 170, 0.4);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(32, 178, 170, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(32, 178, 170, 0);
    }
  }

  .wrapper {
    width: 100%;
    height: 400px;
    position: relative;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: visible;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  .inner {
    --quantity: 6;
    --w: 180px;
    --h: 260px;
    --translateZ: 220px;
    --rotateX: -5deg;
    --perspective: 1200px;
    position: absolute;
    width: var(--w);
    height: var(--h);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) perspective(var(--perspective)) rotateX(var(--rotateX));
    transform-style: preserve-3d;
  }

  .spinning {
    animation: rotating 3s linear infinite;
  }

  @keyframes rotating {
    from {
      transform: translate(-50%, -50%) perspective(var(--perspective)) rotateX(var(--rotateX)) rotateY(0);
    }
    to {
      transform: translate(-50%, -50%) perspective(var(--perspective)) rotateX(var(--rotateX)) rotateY(1turn);
    }
  }

  .card {
    position: absolute;
    border-radius: 16px;
    overflow: hidden;
    inset: 0;
    transform: rotateY(calc((360deg / var(--quantity)) * var(--index)))
      translateZ(var(--translateZ));
    background: linear-gradient(135deg, 
      rgba(var(--color-card), 0.9) 0%,
      rgba(var(--color-card), 0.7) 100%
    );
    box-shadow: 
      0 4px 15px rgba(0, 0, 0, 0.1),
      0 1px 2px rgba(255, 255, 255, 0.3),
      inset 0 0 15px rgba(255, 255, 255, 0.2);
    border: 3px solid rgba(255, 255, 255, 0.3);
    transition: transform 0.5s ease-out;
    
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.4) 0%,
        rgba(255, 255, 255, 0.1) 100%
      );
      opacity: 0.7;
      z-index: 1;
    }

    &::after {
      content: '';
      position: absolute;
      inset: 1px;
      border-radius: 14px;
      background: repeating-linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.1) 0px,
        rgba(255, 255, 255, 0.1) 2px,
        transparent 2px,
        transparent 4px
      );
      z-index: 2;
    }

    &.move-to-front {
      transform: translateZ(400px) scale(1.3) !important;
      z-index: 1000;
      box-shadow: 
        0 8px 30px rgba(0, 0, 0, 0.2),
        0 2px 4px rgba(255, 255, 255, 0.3),
        inset 0 0 30px rgba(255, 255, 255, 0.3);
      border-width: 4px;
    }
  }

  .img {
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .prize-content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 24px;
    font-weight: bold;
    text-shadow: 
      0 2px 4px rgba(0, 0, 0, 0.3),
      0 0 10px rgba(255, 255, 255, 0.5);
    letter-spacing: 2px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 
      0 4px 15px rgba(0, 0, 0, 0.1),
      inset 0 0 20px rgba(255, 255, 255, 0.2);
    
    &.fade-out {
      animation: fadeOutGradually 2s ease-out forwards;
    }
  }

  @keyframes fadeOutGradually {
    0% {
      opacity: 1;
      filter: blur(0);
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      filter: blur(2px);
      transform: scale(0.98);
    }
    100% {
      opacity: 0;
      filter: blur(8px);
      transform: scale(0.95);
    }
  }

  .draw-button {
    position: fixed; // 改为固定定位
    bottom: 40px; // 距离底部距离
    padding: 15px 40px;
    font-size: 20px;
    background: linear-gradient(45deg, #ff69b4, #ff1493);
    color: white;
    border: none;
    border-radius: 30px;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 4px 15px rgba(255, 105, 180, 0.3);
    z-index: 1000; // 确保按钮始终在最上层

    &:disabled {
      background: linear-gradient(45deg, #ffb6c1, #ffc0cb);
      cursor: not-allowed;
    }

    &:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(255, 105, 180, 0.4);
    }

    &:active:not(:disabled) {
      transform: translateY(-1px);
    }
  }

  .result {
    position: fixed;
    bottom: 120px;
    font-size: 24px;
    color: #ff69b4;
    text-align: center;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    animation: fadeIn 0.5s ease-in;
    background: rgba(255, 255, 255, 0.9);
    padding: 10px 30px;
    border-radius: 20px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes moveToFront {
    0% {
      transform: rotateY(calc((360deg / var(--quantity)) * var(--index)))
        translateZ(var(--translateZ));
    }
    100% {
      transform: translateZ(400px) scale(1.3);
    }
  }

  .prize-item {
    span.drawn {
      animation: fadeOutGradually 2.5s ease-out forwards;
    }
  }

  @keyframes fadeOutGradually {
    0% {
      opacity: 1;
      filter: blur(0);
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      filter: blur(2px);
      transform: scale(0.98);
    }
    100% {
      opacity: 0;
      filter: blur(8px);
      transform: scale(0.95);
    }
  }
`;

export default LuckyCard; 