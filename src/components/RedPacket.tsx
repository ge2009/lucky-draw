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
    playSound(clickSound);
    if (isChildLocked) {
      const password = prompt('请输入密码解锁设置:');
      if (password === '8888') {
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
    // 更新红包列表
    setPackets(newPrizes.map(prize => ({
      id: prize.id,
      amount: prize.name,
      isOpened: false
    })));
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
        <div className="settings-modal">
          <div className="modal-content">
            <Settings
              prizes={prizes}
              onSave={handleSettingsSave}
              onClose={() => setShowSettings(false)}
              currentCoverImage={coverImage}
            />
          </div>
        </div>
      )}
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;

  .controls {
    position: fixed;
    top: 1rem;
    right: 1rem;
    display: flex;
    gap: 0.5rem;
    z-index: 100;

    .control-button {
      width: 3rem;
      height: 3rem;
      border: none;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(4px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
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
          width: 2rem;
          height: 2rem;
        }

        &:hover {
          background: linear-gradient(45deg, #24292e, #1a1a1a);
        }
      }
    }
  }

  .guide-text {
    text-align: center;
    color: #666;
    margin-bottom: 1rem;
    font-size: 0.875rem;
    
    @media (min-width: 640px) {
      font-size: 1rem;
    }
  }

  .packets-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
    display: grid;
    gap: 1rem;
    overflow-y: auto;
    max-height: calc(100vh - 12rem);
    align-content: start;
    
    /* 根据红包数量调整布局 */
    &[data-count="1"] {
      grid-template-columns: repeat(1, 1fr);
      max-width: 400px;
      .modern-red-packet {
        height: 400px;
      }
    }
    
    &[data-count="2"] {
      grid-template-columns: repeat(2, 1fr);
      max-width: 800px;
      .modern-red-packet {
        height: 333px;
      }
    }
    
    &[data-count="3"] {
      grid-template-columns: repeat(3, 1fr);
      max-width: 900px;
      .modern-red-packet {
        height: 293px;
      }
    }
    
    &[data-count="4"] {
      grid-template-columns: repeat(2, 1fr);
      max-width: 1000px;
      .modern-red-packet {
        height: 267px;
      }
    }
    
    &[data-count="5"], &[data-count="6"] {
      grid-template-columns: repeat(3, 1fr);
      max-width: 1100px;
      .modern-red-packet {
        height: 240px;
      }
    }
    
    &[data-count="7"], &[data-count="8"], &[data-count="9"] {
      grid-template-columns: repeat(3, 1fr);
      max-width: 1200px;
      .modern-red-packet {
        height: 213px;
      }
    }
    
    &[data-count="10"], &[data-count="11"], &[data-count="12"] {
      grid-template-columns: repeat(4, 1fr);
      .modern-red-packet {
        height: 200px;
      }
    }
    
    @media (max-width: 768px) {
      grid-template-columns: repeat(2, 1fr) !important;
      .modern-red-packet {
        height: 180px !important;
      }
    }
    
    @media (max-width: 480px) {
      grid-template-columns: repeat(1, 1fr) !important;
      .modern-red-packet {
        height: 240px !important;
      }
    }
  }

  .modern-red-packet {
    position: relative;
    width: 100%;
    border-radius: 1rem;
    cursor: pointer;
    perspective: 1000px;
    transform-style: preserve-3d;
    transition: transform 0.6s;

    &:hover {
      transform: translateY(-5px) scale(1.02);
      
      .packet-front {
        filter: brightness(1.1);
        
        .custom-cover {
          opacity: 0.9;
        }
        
        .character {
          transform: scale(1.05);
        }
        
        .decorations {
          .sun {
            transform: rotate(180deg);
          }
          .cloud {
            transform: translateX(10px);
          }
          .flower {
            transform: rotate(45deg);
          }
          .pencil {
            transform: rotate(-10deg);
          }
        }
      }
    }

    &.opened {
      transform: rotateY(180deg);
      pointer-events: none;
    }

    .packet-front, .packet-back {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .packet-front {
      background: white;
      transform: rotateY(0deg);
      
      .custom-cover {
        width: 100%;
        height: 100%;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        border-radius: 1rem;
        transition: all 0.3s;
      }
      
      .illustration {
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
        
        .character {
          position: absolute;
          width: 60%;
          height: 60%;
          left: 20%;
          top: 20%;
          background-size: contain;
          background-position: center;
          background-repeat: no-repeat;
          transition: transform 0.3s;
        }
        
        .decorations {
          position: absolute;
          inset: 0;
          
          .sun {
            position: absolute;
            top: 10%;
            right: 10%;
            width: 2rem;
            height: 2rem;
            background: #FFD700;
            border-radius: 50%;
            transition: transform 0.3s;
          }
          
          .cloud {
            position: absolute;
            font-size: 1.5rem;
            transition: transform 0.3s;
            
            &:nth-of-type(1) {
              top: 15%;
              left: 10%;
            }
            
            &:nth-of-type(2) {
              bottom: 15%;
              right: 10%;
            }
          }
          
          .flower {
            position: absolute;
            font-size: 1.2rem;
            transition: transform 0.3s;
            
            &:nth-of-type(1) {
              top: 20%;
              left: 20%;
            }
            
            &:nth-of-type(2) {
              bottom: 20%;
              right: 20%;
            }
          }
          
          .pencil {
            position: absolute;
            bottom: 10%;
            left: 50%;
            transform: translateX(-50%);
            width: 1rem;
            height: 4rem;
            background: linear-gradient(to bottom, #FFD700 0%, #FFD700 20%, #FFA500 20%, #FFA500 90%, #8B4513 90%);
            transition: transform 0.3s;
          }
        }
      }
    }

    .packet-back {
      background: linear-gradient(135deg, #ff4d4d 0%, #ff0000 100%);
      transform: rotateY(180deg);
      
      .amount {
        font-size: 1.5rem;
        color: white;
        text-align: center;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 0.5rem;
        backdrop-filter: blur(4px);
        max-width: 80%;
      }
    }
  }

  .modal {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    
    .modal-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(8px);
    }
    
    .modal-content {
      position: relative;
      width: 90%;
      max-width: 500px;
      aspect-ratio: 3/4;
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
        
        .modal-front, .modal-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        
        .modal-front {
          background: white;
          
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
        
        .modal-back {
          background: linear-gradient(135deg, #ff4d4d 0%, #ff0000 100%);
          transform: rotateY(180deg);
          display: flex;
          align-items: center;
          justify-content: center;
          
          .result-text {
            text-align: center;
            color: white;
            padding: 2rem;
            
            .result-content {
              font-size: 2rem;
              font-weight: bold;
              margin-top: 1rem;
              background: rgba(255, 255, 255, 0.1);
              padding: 1rem 2rem;
              border-radius: 1rem;
              backdrop-filter: blur(4px);
            }
          }
        }
      }
    }
  }
`;

export default RedPacketComponent; 