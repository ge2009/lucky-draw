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

const DEFAULT_COVER_IMAGE = '/images/red-packet-cover.png';

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
  const [coverImage, setCoverImage] = useState<string>(() => {
    try {
      return localStorage.getItem('redPacketCover') || DEFAULT_COVER_IMAGE;
    } catch {
      return DEFAULT_COVER_IMAGE;
    }
  });
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<{
    type: 'cover' | 'result';
    content: string;
  } | null>(null);

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
    if (isShuffling) return;
    window.location.reload(); // 直接刷新页面重新开始
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

  const handleSettingsSave = (newPrizes: Prize[], newCoverImage?: string) => {
    setPrizes(newPrizes);
    localStorage.setItem('prizes', JSON.stringify(newPrizes));
    if (newCoverImage) {
      setCoverImage(newCoverImage);
      localStorage.setItem('redPacketCover', newCoverImage);
    }
    setShowSettings(false);
  };

  const handlePacketClick = (packet: RedPacket) => {
    if (isShuffling || packet.isOpened) return;
    
    // 播放音效
    playSound(openSound);
    
    // 显示模态框和封面
    setModalContent({
      type: 'cover',
      content: coverImage
    });
    setShowModal(true);
    
    // 标记红包为已打开
    const newPackets = packets.map(p => 
      p.id === packet.id ? { ...p, isOpened: true } : p
    );
    setPackets(newPackets);
    setSelectedPacket(packet);
    
    // 1秒后翻转显示结果
    setTimeout(() => {
      setModalContent({
        type: 'result',
        content: packet.amount
      });
      
      // 触发烟花效果
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        zIndex: 2000, // 确保烟花显示在最上层
      });
      
      playSound(winSound);
    }, 1000);
  };

  return (
    <StyledWrapper>
      <div className="controls">
        <a 
          href="https://github.com/ge2009/lucky-draw"
          target="_blank"
          rel="noopener noreferrer"
          className="control-button github-button"
          aria-label="访问 GitHub 仓库"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
          </svg>
        </a>
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
          className="control-button reset-button" 
          onClick={handleReset}
          aria-label="重新开始"
        >
          🔄
        </button>
      </div>

      <div className="guide-text">
        <p>点击<span className="highlight">红包</span>抽取今天的作业内容</p>
        <p>使用<span className="highlight">🔄</span>重新开始游戏</p>
      </div>

      <div className="packets-container" data-count={packets.length}>
        {packets.map((packet) => (
          <div
            key={packet.id}
            className={`modern-red-packet ${packet.isOpened ? 'opened' : ''} ${
              isOpening && selectedPacket?.id === packet.id ? 'opening' : ''
            }`}
            onClick={() => handlePacketClick(packet)}
            style={{ 
              cursor: isShuffling || packet.isOpened ? 'default' : 'pointer',
              pointerEvents: isShuffling ? 'none' : 'auto'
            }}
          >
            <div className="packet-front">
              {coverImage ? (
                <div 
                  className="custom-cover"
                  style={{
                    backgroundImage: `url(${coverImage})`
                  }}
                />
              ) : (
                <div className="illustration">
                  <div className="character" />
                  <div className="decorations">
                    <div className="sun" />
                    <div className="cloud">☁️</div>
                    <div className="cloud">☁️</div>
                    <div className="flower">🌸</div>
                    <div className="flower">🌼</div>
                    <div className="pencil" />
                  </div>
                </div>
              )}
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

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-backdrop" />
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className={`modal-card ${modalContent?.type === 'result' ? 'flipped' : ''}`}>
              <div className="modal-front">
                <img src={modalContent?.content} alt="红包封面" />
              </div>
              <div className="modal-back">
                <div className="result-text">
                  <div className="result-content">{modalContent?.content}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <Settings
          prizes={prizes}
          onSave={handleSettingsSave}
          onClose={() => setShowSettings(false)}
          currentCoverImage={coverImage}
        />
      )}
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;

  .controls {
    position: fixed;
    top: 1rem;
    right: 1rem;
    display: flex;
    gap: 0.8rem;
    z-index: 100;

    .control-button {
      width: 2.5rem;
      height: 2.5rem;
      border: none;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(4px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        background: rgba(255, 255, 255, 1);
      }

      &:active {
        transform: translateY(0);
      }

      &.github-button {
        background: linear-gradient(45deg, #333, #24292e);
        color: white;
        padding: 0.5rem;

        svg {
          width: 1.5rem;
          height: 1.5rem;
        }

        &:hover {
          background: linear-gradient(45deg, #24292e, #1a1a1a);
        }
      }
    }
  }

  .guide-text {
    text-align: center;
    margin: 2rem 0;
    color: #666;
    font-size: 1.1rem;
    max-width: 800px;
    line-height: 1.6;
    
    .highlight {
      color: #ff4d4d;
      font-weight: 500;
    }
    
    @media (max-width: 768px) {
      font-size: 1rem;
      padding: 0 1rem;
    }
  }

  .packets-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1.5rem;
    padding: 1.5rem;
    width: 100%;
    max-width: 1200px;
    margin: 5rem auto 2rem;
    place-items: center;
    
    // 根据红包数量调整大小和布局
    &[data-count="1"] {
      max-width: 400px;
      margin-top: 8rem;
      .modern-red-packet {
        width: 300px;
        height: 400px;
      }
    }
    
    &[data-count="2"] {
      max-width: 800px;
      grid-template-columns: repeat(2, 1fr);
      margin-top: 7rem;
      .modern-red-packet {
        width: 250px;
        height: 333px;
      }
    }
    
    &[data-count="3"] {
      max-width: 900px;
      grid-template-columns: repeat(3, 1fr);
      margin-top: 6rem;
      .modern-red-packet {
        width: 220px;
        height: 293px;
      }
    }
    
    &[data-count="4"] {
      max-width: 1000px;
      grid-template-columns: repeat(2, 1fr);
      margin-top: 6rem;
      .modern-red-packet {
        width: 200px;
        height: 267px;
      }
    }
    
    &[data-count="5"], &[data-count="6"] {
      max-width: 1100px;
      grid-template-columns: repeat(3, 1fr);
      margin-top: 5.5rem;
      .modern-red-packet {
        width: 180px;
        height: 240px;
      }
    }
    
    &[data-count="7"], &[data-count="8"], &[data-count="9"] {
      max-width: 1200px;
      grid-template-columns: repeat(3, 1fr);
      margin-top: 5rem;
      .modern-red-packet {
        width: 160px;
        height: 213px;
      }
    }
    
    // 超过9个时使用默认大小
    &[data-count="10"] {
      grid-template-columns: repeat(4, 1fr);
      margin-top: 5rem;
      .modern-red-packet {
        width: 150px;
        height: 200px;
      }
    }
  }

  .modern-red-packet {
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.3s ease;
    margin: 0 auto;
    width: 150px;
    height: 200px;
    perspective: 1000px;
    cursor: pointer;

    &.opening {
      transform-style: preserve-3d;
      animation: flip 0.6s ease-in-out forwards;
    }

    &.opened {
      pointer-events: none;
      transform: rotateY(180deg);
    }

    .packet-front,
    .packet-back {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      border-radius: 12px;
      overflow: hidden;
    }

    .packet-front {
      background: #fff;
      transform: rotateY(0deg);
      
      .custom-cover {
        width: 100%;
        height: 100%;
        background-size: cover;
        background-position: center;
        transition: all 0.3s ease;
        transform-origin: center;

        &:hover {
          transform: scale(1.05);
          filter: brightness(1.1);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }
      }
    }

    .packet-back {
      background: linear-gradient(135deg, #ff4d4d 0%, #ff1a1a 100%);
      transform: rotateY(180deg);
      display: flex;
      align-items: center;
      justify-content: center;
      
      .amount {
        font-size: 1.5rem;
        color: #fff;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        padding: 1rem;
        text-align: center;
      }
    }
  }

  @keyframes flip {
    from {
      transform: rotateY(0deg);
    }
    to {
      transform: rotateY(180deg);
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

  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    
    .modal-backdrop {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(8px);
    }
    
    .modal-content {
      position: relative;
      z-index: 1001;
      width: 300px;
      height: 400px;
      perspective: 1000px;
      
      .modal-card {
        position: relative;
        width: 100%;
        height: 100%;
        transform-style: preserve-3d;
        transition: transform 0.6s;
        
        &.flipped {
          transform: rotateY(180deg);
        }
        
        .modal-front,
        .modal-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        
        .modal-front {
          background: #fff;
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
        
        .modal-back {
          background: linear-gradient(135deg, #ff4d4d 0%, #ff1a1a 100%);
          transform: rotateY(180deg);
          display: flex;
          align-items: center;
          justify-content: center;
          
          .result-text {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;

            .result-content {
              font-size: 2.5rem;
              font-weight: 500;
            }
          }
        }
      }
    }
  }
  
  @keyframes zoomIn {
    from {
      transform: scale(0.5);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

export default RedPacketComponent; 