import React, { useState, useRef } from 'react';
import styled from 'styled-components';

interface Prize {
  id: number;
  name: string;
  colorCard: string;
  isDrawn?: boolean;
}

interface SettingsProps {
  prizes: Prize[];
  onSave: (prizes: Prize[], coverImage?: string) => void;
  onClose: () => void;
  currentCoverImage?: string;
}

export const Settings = ({ prizes, onSave, onClose, currentCoverImage }: SettingsProps) => {
  const [editedPrizes, setEditedPrizes] = useState<Prize[]>(prizes);
  const [coverImage, setCoverImage] = useState<string>(currentCoverImage || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    const newPrize: Prize = {
      id: Math.max(...editedPrizes.map(p => p.id), 0) + 1,
      name: '',
      colorCard: '255, 0, 0'
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <StyledSettings>
      <div className="modal">
        <div className="modal-header">
          <h2>✨ 设置 ✨</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {currentCoverImage !== undefined && (
          <div className="cover-upload">
            <h3>红包封面图片</h3>
            <div 
              className="image-preview" 
              onClick={handleImageClick}
              style={{
                backgroundImage: coverImage ? `url(${coverImage})` : 'none'
              }}
            >
              {!coverImage && <span>点击上传图片</span>}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </div>
        )}
        
        <div className="prizes-list">
          <h3>奖品列表</h3>
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

        <div className="bottom-section">
          <button className="add-button" onClick={handleAdd}>
            <span className="plus">+</span> 添加新奖品
          </button>

          <div className="buttons">
            <button 
              className="save-button" 
              onClick={() => onSave(editedPrizes, coverImage)}
            >
              保存设置
            </button>
            <button className="cancel-button" onClick={onClose}>
              取消
            </button>
          </div>
        </div>
      </div>
    </StyledSettings>
  );
};

const StyledSettings = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .modal {
    background: white;
    border-radius: 1rem;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #eee;

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

  .cover-upload {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #eee;

    h3 {
      margin: 0 0 0.75rem;
      color: #666;
      font-size: 1rem;
    }

    .image-preview {
      width: 100%;
      height: 160px;
      border: 2px dashed #ccc;
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      transition: all 0.3s;

      @media (min-width: 640px) {
        height: 200px;
      }

      span {
        color: #666;
        font-size: 1rem;
      }

      &:hover {
        border-color: #ff69b4;
        color: #ff69b4;
        background-color: #f8f8f8;
      }
    }
  }

  .prizes-list {
    flex: 1;
    overflow-y: auto;
    padding: 1rem 1.5rem;
    
    h3 {
      margin: 0 0 1rem;
      color: #666;
      font-size: 1rem;
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
  }

  .bottom-section {
    padding: 1rem 1.5rem;
    border-top: 1px solid #eee;
    background: #fff;

    .add-button {
      width: 100%;
      padding: 0.75rem;
      background: #f0f0f0;
      border: 2px dashed #ccc;
      border-radius: 0.75rem;
      color: #666;
      font-size: 1rem;
      cursor: pointer;
      margin-bottom: 1rem;
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

        @media (max-width: 640px) {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }
      }
    }
  }
`; 