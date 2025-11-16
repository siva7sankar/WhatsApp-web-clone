import React, { useState } from 'react';
import { FiMoreVertical, FiMessageCircle, FiSearch } from 'react-icons/fi';
import { IoMdNotificationsOff } from 'react-icons/io';
import ChatListItem from './ChatListItem';
import Profile from './Profile';
import { useChat } from '../../context/ChatContext';
import './Sidebar.css';

const Sidebar = ({ onSelectChat, selectedChat }) => {
  const { chats, currentUser } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfile, setShowProfile] = useState(false);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div 
          className="sidebar-avatar"
          onClick={() => setShowProfile(true)}
        >
          <img
            src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.name}&background=00a884&color=fff`}
            alt="Profile"
          />
        </div>
        <div className="sidebar-header-icons">
          <button className="icon-button" title="New chat">
            <FiMessageCircle size={20} />
          </button>
          <button className="icon-button" title="Menu">
            <FiMoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      <div className="notification-banner">
        <IoMdNotificationsOff size={48} />
        <div className="notification-text">
          <span>Get notified of new messages</span>
          <a href="#" onClick={(e) => {
            e.preventDefault();
            // Request notification permission
          }}>Turn on desktop notifications</a>
        </div>
      </div>

      {/* Search Bar */}
      <div className="sidebar-search">
        <div className="search-container">
          <FiSearch className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="chat-list">
        {filteredChats.length > 0 ? (
          filteredChats.map(chat => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              isSelected={selectedChat?.id === chat.id}
              onClick={() => onSelectChat(chat)}
            />
          ))
        ) : (
          <div className="no-chats">
            <p>No chats found</p>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <Profile
          user={currentUser}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
};

export default Sidebar;