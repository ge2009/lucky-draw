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
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [isChildLocked, setIsChildLocked] = useState(() => {
    try {
      return localStorage.getItem('isChildLocked') === 'true';
    } catch {
      return false;
    }
  });

  // 保存童锁状态到 localStorage
  useEffect(() => {
    localStorage.setItem('isChildLocked', String(isChildLocked));
  }, [isChildLocked]);

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
      shapes: ['square', 'circle'] as Array<'square' | 'circle'>,
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

  const checkPassword = () => {
    const today = new Date();
    const correctPassword = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    
    if (password === correctPassword) {
      setShowPasswordModal(false);
      if (showSettings) {
        // 如果是从设置按钮进入的，打开设置
        setShowSettings(true);
      } else {
        // 如果是从童锁按钮进入的，切换童锁状态
        setIsChildLocked(!isChildLocked);
      }
      setPassword('');
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 2000);
    }
  };

  const handleSettingsClick = () => {
    playSound(clickSound);
    if (isChildLocked) {
      setShowPasswordModal(true);
    } else {
      setShowSettings(true);
    }
  };

  const toggleChildLock = () => {
    playSound(clickSound);
    if (!isChildLocked) {
      // 开启童锁时需要验证密码
      setShowPasswordModal(true);
    } else {
      // 关闭童锁也需要验证密码
      setShowPasswordModal(true);
    }
  };

  return (
    <StyledWrapper $isChildLocked={isChildLocked}>
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
          className="control-button child-lock-button" 
          onClick={toggleChildLock}
          aria-label={isChildLocked ? "童锁已开启" : "童锁已关闭"}
        >
          {isChildLocked ? '🔒' : '🔓'}
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
            <span>
              {prize.name}
            </span>
            {prize.isDrawn && <div className="check-mark">✓</div>}
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

      {showPasswordModal && (
        <div className="password-modal">
          <div className="modal-content">
            <h3>请输入密码</h3>
            <div className="input-wrapper">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className={passwordError ? 'error' : ''}
                onKeyDown={(e) => e.key === 'Enter' && checkPassword()}
              />
              {passwordError && <div className="error-message">密码错误</div>}
            </div>
            <div className="buttons">
              <button onClick={checkPassword}>确认</button>
              <button onClick={() => {
                setShowPasswordModal(false);
                setPassword('');
                setPasswordError(false);
              }}>取消</button>
            </div>
          </div>
        </div>
      )}
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div<{ $isChildLocked?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  width: 100%;
  position: relative;
  gap: 1rem;

  .controls {
    position: absolute;
    top: 0;
    right: 0.5rem;
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
    text-decoration: none; // 为链接添加样式

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &.child-lock-button {
      background: ${props => props.$isChildLocked ? 
        'linear-gradient(45deg, #ff69b4, #ff1493)' : 
        'linear-gradient(45deg, #90EE90, #32CD32)'};
      color: white;
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

  .prize-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.75rem;
    width: 100%;
    padding: 1rem;
    margin-top: 4rem;
    max-height: 25vh;
    overflow-y: auto;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 1.5rem;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);

    @media (max-width: 640px) {
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      margin-top: 3.5rem;
      padding: 0.75rem;
      gap: 0.5rem;
    }

    .prize-item {
      background: white;
      padding: 0.75rem;
      border-radius: 1rem;
      text-align: center;
      font-size: 1rem;
      transition: all 0.3s;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 3.5rem;
      position: relative;
      overflow: hidden;

      @media (max-width: 640px) {
        padding: 0.5rem;
        font-size: 0.875rem;
        min-height: 3rem;
      }

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(45deg, rgba(255, 105, 180, 0.1), rgba(147, 112, 219, 0.1));
        opacity: 0;
        transition: opacity 0.3s;
      }

      &:hover:not(.drawn) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

        &::before {
          opacity: 1;
        }
      }

      &.drawn {
        opacity: 0.7;
        background: #f8f8f8;

        span {
          color: #666;
        }
      }

      span {
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: #333;
        font-weight: 500;
        padding: 0 0.25rem;
      }

      .check-mark {
        position: absolute;
        top: 0.25rem;
        right: 0.25rem;
        font-size: 0.875rem;
        color: #ff69b4;
      }
    }

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 105, 180, 0.3);
      border-radius: 3px;
      
      &:hover {
        background: rgba(255, 105, 180, 0.5);
      }
    }
  }

  .wrapper {
    position: relative;
    width: 100%;
    height: 45vh;
    perspective: 1000px;
    margin: 1rem 0;
  }

  .inner {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 0.5s;

    &.spinning {
      animation: spin 3s ease-out forwards;
    }
  }

  .card {
    position: absolute;
    width: 200px;
    height: 280px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) 
               rotateY(calc(var(--index) * 45deg)) 
               translateZ(300px);
    background: linear-gradient(
      135deg,
      rgb(var(--color-card)) 0%,
      rgba(var(--color-card), 0.8) 100%
    );
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    box-shadow: 
      0 10px 20px rgba(0, 0, 0, 0.1),
      0 2px 6px rgba(255, 255, 255, 0.3) inset,
      0 -2px 6px rgba(0, 0, 0, 0.1) inset;
    backface-visibility: visible;
    transition: all 0.5s;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.3);

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
    }

    &::after {
      content: '';
      position: absolute;
      inset: 1px;
      border-radius: 19px;
      background: repeating-linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.1) 0px,
        rgba(255, 255, 255, 0.1) 2px,
        transparent 2px,
        transparent 4px
      );
    }

    @media (max-width: 640px) {
      width: 150px;
      height: 210px;
      font-size: 20px;
      transform: translate(-50%, -50%) 
                 rotateY(calc(var(--index) * 45deg)) 
                 translateZ(200px);
    }

    &.move-to-front {
      animation: moveToFront 0.5s forwards;
      box-shadow: 
        0 20px 40px rgba(0, 0, 0, 0.2),
        0 4px 12px rgba(255, 255, 255, 0.4) inset,
        0 -4px 12px rgba(0, 0, 0, 0.1) inset;
    }

    &.return-to-pool {
      animation: returnToPool 0.5s forwards;
    }
  }

  .img {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
    padding: 1rem;
    text-align: center;
    word-break: break-all;
  }

  .prize-content {
    opacity: 1;
    transition: opacity 1s;
    font-size: 1.5rem;
    font-weight: bold;

    &.fade-out {
      opacity: 0;
    }
  }

  .draw-button {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(45deg, #ff69b4, #ff1493);
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 2rem;
    font-size: 1.25rem;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 4px 15px rgba(255, 105, 180, 0.3);
    z-index: 50;

    &:hover {
      transform: translateX(-50%) translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 105, 180, 0.4);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    @media (max-width: 640px) {
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      bottom: 1.5rem;
    }
  }

  .result {
    position: fixed;
    bottom: 6rem;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255, 255, 255, 0.9);
    padding: 1rem 2rem;
    border-radius: 2rem;
    font-size: 1.25rem;
    color: #ff1493;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(5px);
    z-index: 100;
    white-space: nowrap;

    @media (max-width: 640px) {
      bottom: 5rem;
      font-size: 1rem;
      padding: 0.75rem 1.5rem;
    }
  }

  .password-modal {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(5px);

    .modal-content {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      width: 90%;
      max-width: 400px;

      h3 {
        margin: 0 0 1rem;
        text-align: center;
        color: #ff69b4;
      }

      .input-wrapper {
        margin-bottom: 1rem;

        input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #eee;
          border-radius: 0.5rem;
          font-size: 1rem;
          outline: none;
          transition: all 0.3s;

          &:focus {
            border-color: #ff69b4;
          }

          &.error {
            border-color: #ff4444;
          }
        }

        .error-message {
          color: #ff4444;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }
      }

      .buttons {
        display: flex;
        gap: 1rem;
        justify-content: center;

        button {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;

          &:first-child {
            background: #ff69b4;
            color: white;

            &:hover {
              background: #ff1493;
            }
          }

          &:last-child {
            background: #eee;
            color: #666;

            &:hover {
              background: #ddd;
            }
          }
        }
      }
    }
  }

  @keyframes spin {
    from {
      transform: rotateY(0);
    }
    to {
      transform: rotateY(1440deg);
    }
  }

  @keyframes moveToFront {
    to {
      transform: translate(-50%, -50%) rotateY(0) translateZ(400px) scale(1.2);
      box-shadow: 
        0 30px 60px rgba(0, 0, 0, 0.3),
        0 6px 16px rgba(255, 255, 255, 0.4) inset,
        0 -6px 16px rgba(0, 0, 0, 0.1) inset;
    }
  }

  @keyframes returnToPool {
    from {
      transform: translate(-50%, -50%) rotateY(0) translateZ(400px) scale(1.2);
      box-shadow: 
        0 30px 60px rgba(0, 0, 0, 0.3),
        0 6px 16px rgba(255, 255, 255, 0.4) inset,
        0 -6px 16px rgba(0, 0, 0, 0.1) inset;
    }
    to {
      transform: translate(-50%, -50%) rotateY(0) translateZ(300px) scale(1);
      box-shadow: 
        0 10px 20px rgba(0, 0, 0, 0.1),
        0 2px 6px rgba(255, 255, 255, 0.3) inset,
        0 -2px 6px rgba(0, 0, 0, 0.1) inset;
    }
  }
`;

export default LuckyCard; 