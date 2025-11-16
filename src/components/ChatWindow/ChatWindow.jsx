import React, { useState, useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useChat } from '../../context/ChatContext';
import './ChatWindow.css';

const ChatWindow = ({ chat, onBack }) => {
  const { messages, sendMessage, markAsRead } = useChat();
  const [chatMessages, setChatMessages] = useState([]);
  const messageListRef = useRef(null);

  useEffect(() => {
    if (chat) {
      const msgs = messages[chat.id] || [];
      setChatMessages(msgs);
      markAsRead(chat.id);
    }
  }, [chat, messages, markAsRead]);

  const handleSendMessage = async (text) => {
    if (text.trim()) {
      await sendMessage(chat.id, text);
    }
  };

  return (
    <div className="chat-window">
      <ChatHeader chat={chat} onBack={onBack} />
      <MessageList 
        ref={messageListRef}
        messages={chatMessages} 
        chat={chat}
      />
      <MessageInput onSend={handleSendMessage} />
    </div>
  );
};

export default ChatWindow;