import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { BsCheckAll, BsCheck } from 'react-icons/bs';

const ChatListItem = ({ chat, isSelected, onClick }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div 
      className={`chat-list-item ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="chat-avatar">
        <img
          src={chat.avatar || `https://ui-avatars.com/api/?name=${chat.name}&background=00a884&color=fff`}
          alt={chat.name}
        />
        {chat.online && <span className="online-indicator"></span>}
      </div>
      
      <div className="chat-info">
        <div className="chat-header">
          <h3 className="chat-name">{chat.name}</h3>
          <span className="chat-time">
            {formatTime(chat.timestamp)}
          </span>
        </div>
        
        <div className="chat-preview">
          <div className="last-message">
            {chat.lastMessageType === 'sent' && (
              <span className="message-status">
                {chat.lastMessageStatus === 'read' ? (
                  <BsCheckAll className="read" size={16} />
                ) : (
                  <BsCheck size={16} />
                )}
              </span>
            )}
            <span className="message-text">{chat.lastMessage}</span>
          </div>
          {chat.unread > 0 && (
            <span className="unread-badge">{chat.unread}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatListItem;