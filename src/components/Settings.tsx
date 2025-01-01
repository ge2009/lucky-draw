import React, { useState } from 'react';
import styled from 'styled-components';

interface Prize {
  id: number;
  name: string;
  colorCard: string;
  isDrawn?: boolean;
}

interface SettingsProps {
  prizes: Prize[];
  onSave: (prizes: Prize[]) => void;
  onClose: () => void;
}

export const Settings = ({ prizes, onSave, onClose }: SettingsProps) => {
  const [editedPrizes, setEditedPrizes] = useState<Prize[]>(prizes);

  const handleAdd = () => {
    const newPrize: Prize = {
      id: Math.max(...editedPrizes.map(p => p.id)) + 1,
      name: '',
      colorCard: '255, 192, 203'
    };
    setEditedPrizes([...editedPrizes, newPrize]);
  };

  const handleRemove = (id: number) => {
    setEditedPrizes(editedPrizes.filter(p => p.id !== id));
  };

  const handleChange = (id: number, name: string) => {
    setEditedPrizes(editedPrizes.map(p => 
      p.id === id ? { ...p, name } : p
    ));
  };

  return (
    <StyledSettings>
      <div className="modal">
        <div className="modal-header">
          <h2>✨ 奖品设置 ✨</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="prizes-list">
          {editedPrizes.map((prize) => (
            <div key={prize.id} className="prize-input">
              <div className="input-wrapper">
                <span className="emoji">🎁</span>
                <input
                  type="text"
                  value={prize.name}
                  onChange={(e) => handleChange(prize.id, e.target.value)}
                  placeholder="输入奖品名称"
                />
              </div>
              <button 
                className="delete-button" 
                onClick={() => handleRemove(prize.id)}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        <button className="add-button" onClick={handleAdd}>
          <span className="plus">+</span> 添加新奖品
        </button>

        <div className="buttons">
          <button className="save-button" onClick={() => onSave(editedPrizes)}>
            保存设置
          </button>
          <button className="cancel-button" onClick={onClose}>
            取消
          </button>
        </div>
      </div>
    </StyledSettings>
  );
};

const StyledSettings = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);

  .modal {
    background: white;
    padding: 1rem;
    border-radius: 1rem;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    animation: modalShow 0.3s ease-out;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding: 0.5rem;

    h2 {
      margin: 0;
      color: #ff69b4;
      font-size: 1.25rem;
      @media (min-width: 640px) {
        font-size: 1.5rem;
      }
    }

    .close-button {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #666;
      cursor: pointer;
      padding: 0.5rem;
      
      &:hover {
        color: #ff69b4;
      }
    }
  }

  .prizes-list {
    max-height: 50vh;
    overflow-y: auto;
    margin-bottom: 1rem;
    padding: 0.5rem;
  }

  .prize-input {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
    align-items: center;

    .input-wrapper {
      flex: 1;
      display: flex;
      align-items: center;
      background: #f5f5f5;
      border-radius: 0.75rem;
      padding: 0.5rem 1rem;
      transition: all 0.3s;

      &:focus-within {
        background: #fff;
        box-shadow: 0 0 0 2px #ff69b4;
      }

      .emoji {
        margin-right: 0.5rem;
        font-size: 1.25rem;
      }

      input {
        flex: 1;
        border: none;
        background: none;
        padding: 0.5rem 0;
        font-size: 1rem;
        outline: none;

        &::placeholder {
          color: #999;
        }
      }
    }

    .delete-button {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0.5rem;
      opacity: 0.6;
      transition: all 0.3s;

      &:hover {
        opacity: 1;
        transform: scale(1.1);
      }
    }
  }

  .add-button {
    width: 100%;
    padding: 0.75rem;
    background: #f0f0f0;
    border: 2px dashed #ccc;
    border-radius: 0.75rem;
    color: #666;
    font-size: 1rem;
    cursor: pointer;
    margin-bottom: 1.5rem;
    transition: all 0.3s;

    .plus {
      font-size: 1.25rem;
      margin-right: 0.5rem;
    }

    &:hover {
      border-color: #ff69b4;
      color: #ff69b4;
      background: #fff;
    }
  }

  .buttons {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;

    button {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 0.75rem;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s;

      &.save-button {
        background: #ff69b4;
        color: white;

        &:hover {
          background: #ff1493;
          transform: translateY(-2px);
        }
      }

      &.cancel-button {
        background: #f0f0f0;
        color: #666;

        &:hover {
          background: #e0e0e0;
          transform: translateY(-2px);
        }
      }
    }
  }

  @keyframes modalShow {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`; 