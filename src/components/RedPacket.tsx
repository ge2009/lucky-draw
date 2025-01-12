import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import confetti from 'canvas-confetti';
import { Settings } from '@/components/Settings';

// 导入音效
const openSound = '/sounds/open.mp3';
const winSound = '/sounds/win.mp3';
const clickSound = '/sounds/click.mp3';

interface RedPacket {
  id: number;
  amount: string;
  isOpened?: boolean;
}

interface Prize {
  id: number;
  name: string;
  colorCard: string;
  isDrawn?: boolean;
}

const DEFAULT_PACKETS: RedPacket[] = [
  { id: 1, amount: '语文作业' },
  { id: 2, amount: '数学作业' },
  { id: 3, amount: '英语作业' },
  { id: 4, amount: '课外阅读' },
  { id: 5, amount: '休息时间' },
];

const RedPacketComponent = () => {
  const [packets, setPackets] = useState<RedPacket[]>(DEFAULT_PACKETS);
  const [selectedPacket, setSelectedPacket] = useState<RedPacket | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isChildLocked, setIsChildLocked] = useState(() => {
    try {
      return localStorage.getItem('isChildLocked') === 'true';
    } catch {
      return false;
    }
  });
  const [showSettings, setShowSettings] = useState(false);
  const [prizes, setPrizes] = useState<Prize[]>(() => {
    try {
      const saved = localStorage.getItem('prizes');
      return saved ? JSON.parse(saved) : DEFAULT_PACKETS.map(p => ({
        id: p.id,
        name: p.amount,
        colorCard: '255, 0, 0'
      }));
    } catch {
      return DEFAULT_PACKETS.map(p => ({
        id: p.id,
        name: p.amount,
        colorCard: '255, 0, 0'
      }));
    }
  });
  const [isShuffling, setIsShuffling] = useState(false);

  useEffect(() => {
    setPackets(prizes.map((prize: Prize) => ({
      id: prize.id,
      amount: prize.name,
      isOpened: false
    })));
  }, [prizes]);

  // 音效播放函数
  const playSound = useCallback((audioSrc: string) => {
    if (isSoundEnabled) {
      const audio = new Audio(audioSrc);
      audio.play().catch(e => console.log('音频播放失败:', e));
    }
  }, [isSoundEnabled]);

  // 撒花效果
  const triggerConfetti = () => {
    const duration = 3000;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 0,
      particleCount: 150,
      colors: ['#ff0000', '#ffd700', '#ff69b4', '#ff4500']
    };

    const interval: any = setInterval(function() {
      const timeLeft = duration;

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      confetti({
        ...defaults,
        particleCount: 50,
        origin: { x: 0.3, y: 0.5 }
      });

      confetti({
        ...defaults,
        particleCount: 50,
        origin: { x: 0.7, y: 0.5 }
      });
    }, 250);

    setTimeout(() => clearInterval(interval), duration);
  };

  const handleOpenPacket = (packet: RedPacket) => {
    if (isOpening || packet.isOpened) return;

    setIsOpening(true);
    setSelectedPacket(packet);
    playSound(openSound);

    // 提前设置卡片为已打开状态，这样文字会更快显示
    setPackets(packets.map(p => 
      p.id === packet.id ? { ...p, isOpened: true } : p
    ));

    setTimeout(() => {
      setShowResult(true);
      triggerConfetti();
      playSound(winSound);
      setIsOpening(false);
    }, 1000);
  };

  const shufflePackets = () => {
    if (isShuffling) return;
    
    setIsShuffling(true);
    playSound(clickSound);

    // 获取所有红包元素
    const packetElements = document.querySelectorAll('.red-packet');
    const containerRect = document.querySelector('.packets-container')?.getBoundingClientRect();
    
    if (!containerRect) return;

    // 计算容器中心点
    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2;

    // 添加初始动画类
    packetElements.forEach((el, i) => {
      const element = el as HTMLElement;
      element.style.transition = 'all 0.8s ease-in-out';
      element.style.position = 'relative';
      element.style.pointerEvents = 'none'; // 动画过程中禁用点击
      
      // 随机分散到容器四周
      const angle = (Math.PI * 2 * i) / packetElements.length;
      const radius = Math.min(containerRect.width, containerRect.height) * 0.4;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      element.style.transform = `translate(${x}px, ${y}px) rotate(${Math.random() * 360}deg)`;
    });

    // 第二阶段：聚拢到中心
    setTimeout(() => {
      packetElements.forEach((el) => {
        const element = el as HTMLElement;
        element.style.transform = 'translate(0, 0) rotate(0deg)';
      });
    }, 800);

    // 第三阶段：应用新顺序并恢复点击
    setTimeout(() => {
      const newPackets = [...packets];
      for (let i = newPackets.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newPackets[i], newPackets[j]] = [newPackets[j], newPackets[i]];
      }
      setPackets(newPackets);

      // 恢复点击事件并清理样式
      packetElements.forEach((el) => {
        const element = el as HTMLElement;
        element.style.transition = '';
        element.style.transform = '';
        element.style.position = '';
        element.style.pointerEvents = 'auto';
      });

      setIsShuffling(false);
    }, 1600);
  };

  const handleReset = () => {
    if (isShuffling) return; // 防止动画过程中重置
    
    playSound(clickSound);
    setPackets(packets.map(p => ({ ...p, isOpened: false })));
    setSelectedPacket(null);
    setShowResult(false);
    // 移除自动洗牌
    shufflePackets();
  };

  const handleSettingsClick = () => {
    if (isChildLocked) {
      const password = prompt('请输入密码解锁设置:');
      if (password === '1234') {
        setShowSettings(true);
      } else {
        alert('密码错误!');
      }
    } else {
      setShowSettings(true);
    }
  };

  const handleSettingsSave = (newPrizes: Prize[]) => {
    setPrizes(newPrizes);
    localStorage.setItem('prizes', JSON.stringify(newPrizes));
    setShowSettings(false);
  };

  return (
    <StyledWrapper>
      <div className="controls">
        <button 
          className="control-button home-button" 
          onClick={() => window.location.href = '/'}
          aria-label="返回主页"
        >
          🏠
        </button>
        <button 
          className="control-button settings-button" 
          onClick={handleSettingsClick}
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
          className="control-button shuffle-button" 
          onClick={shufflePackets}
          disabled={isShuffling}
          aria-label="洗牌"
        >
          🔀
        </button>
        <button 
          className="control-button reset-button" 
          onClick={handleReset}
          aria-label="重新开始"
        >
          🔄
        </button>
      </div>

      <div className="packets-container">
        {packets.map((packet) => (
          <div
            key={packet.id}
            className={`modern-red-packet ${packet.isOpened ? 'opened' : ''} ${
              isOpening && selectedPacket?.id === packet.id ? 'opening' : ''
            }`}
            onClick={() => !isShuffling && handleOpenPacket(packet)}
            style={{ 
              cursor: isShuffling ? 'default' : 'pointer',
              pointerEvents: isShuffling ? 'none' : 'auto'
            }}
          >
            <div className="packet-front">
              {/* Golden border */}
              <div className="golden-border" />
              
              {/* Main content */}
              <div className="main-content">
                {/* Abstract lines */}
                <svg className="abstract-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0,50 Q25,25 50,50 T100,50" fill="none" stroke="rgba(255,215,0,0.3)" strokeWidth="0.5" />
                  <path d="M0,70 Q25,45 50,70 T100,70" fill="none" stroke="rgba(255,215,0,0.3)" strokeWidth="0.5" />
                  <path d="M0,30 Q25,5 50,30 T100,30" fill="none" stroke="rgba(255,215,0,0.3)" strokeWidth="0.5" />
                </svg>
                
                {/* Modern 福 character */}
                <div className="fu-character">福</div>
                
                {/* Decorative elements */}
                <div className="corner-decoration top-left" />
                <div className="corner-decoration bottom-right" />
              </div>
            </div>
            <div className="packet-back">
              <div className="amount" style={{ 
                opacity: packet.isOpened ? 1 : 0,
                transition: 'opacity 0.3s ease-in',
                transitionDelay: '0.3s'
              }}>
                {packet.amount}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showResult && selectedPacket && (
        <div className="result">
          抽中作业：{selectedPacket.amount}
        </div>
      )}

      {showSettings && (
        <Settings
          prizes={prizes}
          onSave={handleSettingsSave}
          onClose={() => setShowSettings(false)}
        />
      )}
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  width: 100%;
  position: relative;
  gap: 2rem;

  .controls {
    position: absolute;
    top: 1rem;
    right: 1rem;
    display: flex;
    gap: 0.5rem;
    z-index: 10;
  }

  .control-button {
    background: rgba(255, 255, 255, 0.8);
    border: none;
    border-radius: 50%;
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.25rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    backdrop-filter: blur(5px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }

  .packets-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 2rem;
    padding: 2rem;
    width: 100%;
    max-width: 800px;
    margin-top: 2rem;
  }

  .modern-red-packet {
    position: relative;
    width: 150px;
    height: 200px;
    margin: 0 auto;
    perspective: 1000px;
    cursor: pointer;
    transform-style: preserve-3d;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      transform: translateY(-8px) scale(1.02);
      filter: brightness(1.1);
      
      .golden-border {
        opacity: 1;
        background: linear-gradient(to bottom right, #fcd34d, #f59e0b);
      }
      
      .fu-character {
        transform: rotate(-12deg) scale(1.1);
        text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.4);
      }

      .corner-decoration {
        opacity: 0.8;
        &.top-left {
          transform: translate(-2px, -2px);
        }
        &.bottom-right {
          transform: translate(2px, 2px);
        }
      }

      .abstract-lines path {
        stroke: rgba(255, 215, 0, 0.5);
        stroke-width: 0.8;
      }
    }

    &.opening {
      animation: openPacket 1s forwards;
    }

    &.opened {
      transform: rotateY(180deg);
      
      &:hover {
        transform: rotateY(180deg) translateY(-8px) scale(1.02);
        
        .amount {
          transform: scale(1.1);
          text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.4);
        }
      }
    }

    .packet-front,
    .packet-back {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      border-radius: 0.75rem;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
                  0 2px 4px -1px rgba(0, 0, 0, 0.06);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 
                   0 4px 6px -2px rgba(0, 0, 0, 0.1);
      }
    }

    .packet-front {
      background: linear-gradient(to bottom right, #dc2626, #991b1b);
      
      .golden-border {
        position: absolute;
        inset: 0.125rem;
        background: linear-gradient(to bottom right, #fbbf24, #d97706);
        border-radius: 0.75rem;
        opacity: 0.8;
        transition: all 0.4s ease;
      }

      .main-content {
        position: absolute;
        inset: 0.25rem;
        background: linear-gradient(to bottom right, #dc2626, #991b1b);
        border-radius: 0.75rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .abstract-lines {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        
        path {
          transition: all 0.4s ease;
        }
      }

      .fu-character {
        font-size: 4rem;
        font-weight: bold;
        color: #fbbf24;
        transform: rotate(-12deg);
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        z-index: 1;
        transition: all 0.4s ease;
      }

      .corner-decoration {
        position: absolute;
        width: 2rem;
        height: 2rem;
        transition: all 0.4s ease;
        
        &.top-left {
          top: 1rem;
          left: 1rem;
          border-top: 2px solid #fbbf24;
          border-left: 2px solid #fbbf24;
          opacity: 0.5;
        }
        
        &.bottom-right {
          bottom: 1rem;
          right: 1rem;
          border-bottom: 2px solid #fbbf24;
          border-right: 2px solid #fbbf24;
          opacity: 0.5;
        }
      }
    }

    .packet-back {
      background: linear-gradient(to bottom right, #ef4444, #dc2626);
      transform: rotateY(180deg);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;

      .amount {
        color: #fbbf24;
        font-size: 1.5rem;
        font-weight: bold;
        text-align: center;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        transition: all 0.4s ease;
      }
    }
  }

  @keyframes openPacket {
    0% {
      transform: scale(1) rotateY(0);
    }
    50% {
      transform: scale(1.2) rotateY(90deg);
    }
    100% {
      transform: scale(1) rotateY(180deg);
    }
  }

  @keyframes shake {
    0%, 100% { 
      transform: translate(0, 0) rotate(0deg); 
    }
    25% { 
      transform: translate(-10px, -5px) rotate(-5deg); 
    }
    50% { 
      transform: translate(5px, 10px) rotate(5deg); 
    }
    75% { 
      transform: translate(10px, -10px) rotate(-3deg); 
    }
  }

  .shuffling {
    animation: shake 0.3s ease-in-out infinite;
  }

  .result {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255, 255, 255, 0.9);
    padding: 1rem 2rem;
    border-radius: 2rem;
    font-size: 1.25rem;
    color: #ff4d4d;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(5px);
    z-index: 100;
    white-space: nowrap;
  }

  @media (max-width: 640px) {
    .packets-container {
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
      padding: 1rem;
    }

    .modern-red-packet {
      width: 120px;
      height: 160px;

      .fu-character {
        font-size: 3rem;
      }

      .amount {
        font-size: 1.25rem;
      }
    }

    .result {
      font-size: 1rem;
      padding: 0.75rem 1.5rem;
    }
  }
`;

export default RedPacketComponent; 