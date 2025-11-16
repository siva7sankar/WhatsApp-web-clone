import React from 'react';
import { IoMdArrowBack } from 'react-icons/io';
import { FiSearch, FiMoreVertical } from 'react-icons/fi';

const ChatHeader = ({ chat, onBack }) => {
  return (
    <div className="chat-header">
      <div className="chat-header-info">
        {onBack && (
          <button className="icon-button back-button" onClick={onBack}>
            <IoMdArrowBack size={24} />
          </button>
        )}
        <div className="chat-header-avatar">
          <img
            src={chat.avatar || `https://ui-avatars.com/api/?name=${chat.name}&background=00a884&color=fff`}
            alt={chat.name}
          />
          {chat.online && <span className="online-status"></span>}
        </div>
        <div className="chat-header-details">
          <h3>{chat.name}</h3>
          <span className="chat-status">
            {chat.online ? 'online' : 'offline'}
          </span>
        </div>
      </div>
      
      <div className="chat-header-actions">
        <button className="icon-button" title="Search">
          <FiSearch size={20} />
        </button>
        <button className="icon-button" title="Menu">
          <FiMoreVertical size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;