import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar/Sidebar';
import ChatWindow from './components/ChatWindow/ChatWindow';
import { ChatProvider } from './context/ChatContext';
import n8nService from './services/n8nService';
import audioService from './services/audioService';

function App() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    // Request notification permission
    audioService.requestPermission();

    // Start polling for messages
    n8nService.startPolling();

    // Handle window resize
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      n8nService.stopPolling();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  const handleBackToChats = () => {
    setSelectedChat(null);
  };

  return (
    <ChatProvider>
      <div className="app">
        <div className="app-container">
          {/* Sidebar - Chat List */}
          <div className={`sidebar-container ${isMobile && selectedChat ? 'hidden' : ''}`}>
            <Sidebar onSelectChat={handleSelectChat} selectedChat={selectedChat} />
          </div>

          {/* Chat Window */}
          <div className={`chat-container ${isMobile && !selectedChat ? 'hidden' : ''}`}>
            {selectedChat ? (
              <ChatWindow 
                chat={selectedChat} 
                onBack={isMobile ? handleBackToChats : null}
              />
            ) : (
              <div className="no-chat-selected">
                <div className="no-chat-content">
                  <div className="whatsapp-logo">
                    <svg viewBox="0 0 303 303" width="200" height="200">
                      <path fill="#EDEDED" d="M0 0h303v303H0z"/>
                      <path fill="#FFF" d="M35.8 35.8h231.4v231.4H35.8z"/>
                      <path fill="#00BFA5" d="M152 35.8c-64.1 0-116.2 52.1-116.2 116.2 0 20.4 5.3 39.6 14.6 56.3L35.8 267.2l60.5-14.4c16.3 8.9 35 14 54.7 14 64.1 0 116.2-52.1 116.2-116.2S216.1 35.8 152 35.8z"/>
                    </svg>
                  </div>
                  <h1>WhatsApp Web Clone</h1>
                  <p>Select a chat to start messaging</p>
                  <p className="hint">
                    Send and receive messages through n8n workflows
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ChatProvider>
  );
}

export default App;