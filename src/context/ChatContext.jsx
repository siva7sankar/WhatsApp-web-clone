import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import n8nService from '../services/n8nService';
import storageService from '../services/storageService';
import audioService from '../services/audioService';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState({});
  const [currentUser] = useState({
    id: process.env.REACT_APP_USER_ID,
    name: process.env.REACT_APP_USER_NAME,
    phone: process.env.REACT_APP_USER_PHONE,
    avatar: null,
  });

  // Initialize - Load from storage
  useEffect(() => {
    const savedChats = storageService.getChats();
    const savedMessages = storageService.getAllMessages();

    if (savedChats.length > 0) {
      setChats(savedChats);
    } else {
      // Create default bot chat
      const defaultChat = {
        id: 'bot_assistant',
        name: 'AI Assistant',
        avatar: null,
        lastMessage: 'Start a conversation',
        timestamp: Date.now(),
        unread: 0,
        online: true,
        type: 'bot',
      };
      setChats([defaultChat]);
      storageService.saveChats([defaultChat]);
    }

    if (Object.keys(savedMessages).length > 0) {
      setMessages(savedMessages);
    }
  }, []);

  // Listen for incoming messages from n8n
  useEffect(() => {
    const unsubscribe = n8nService.onMessage((data) => {
      const parsedMessage = n8nService.parseIncomingMessage(data);
      if (parsedMessage) {
        handleIncomingMessage(parsedMessage);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Handle incoming message from bot
  const handleIncomingMessage = useCallback((incomingMsg) => {
    const chatId = 'bot_assistant'; // For now, all bot messages go to this chat

    const message = {
      id: incomingMsg.id,
      text: incomingMsg.text,
      timestamp: incomingMsg.timestamp,
      type: 'received',
      status: 'delivered',
    };

    // Add message
    setMessages(prev => {
      const chatMessages = prev[chatId] || [];
      const updatedMessages = [...chatMessages, message];
      storageService.saveMessages(chatId, updatedMessages);
      return {
        ...prev,
        [chatId]: updatedMessages,
      };
    });

    // Update chat
    setChats(prev => {
      const updatedChats = prev.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            lastMessage: message.text,
            timestamp: message.timestamp,
            unread: (chat.unread || 0) + 1,
          };
        }
        return chat;
      });

      // Sort by timestamp
      updatedChats.sort((a, b) => b.timestamp - a.timestamp);
      storageService.saveChats(updatedChats);
      return updatedChats;
    });

    // Play notification
    audioService.playNotification();
    audioService.showNotification('New Message', message.text, null);
  }, []);

  // Send message
  const sendMessage = useCallback(async (chatId, text) => {
    const messageId = uuidv4();
    const timestamp = Date.now();

    const message = {
      id: messageId,
      text: text.trim(),
      timestamp,
      type: 'sent',
      status: 'pending',
    };

    // Add message optimistically
    setMessages(prev => {
      const chatMessages = prev[chatId] || [];
      const updatedMessages = [...chatMessages, message];
      storageService.saveMessages(chatId, updatedMessages);
      return {
        ...prev,
        [chatId]: updatedMessages,
      };
    });

    // Update chat
    setChats(prev => {
      const updatedChats = prev.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            lastMessage: text,
            timestamp,
          };
        }
        return chat;
      });

      updatedChats.sort((a, b) => b.timestamp - a.timestamp);
      storageService.saveChats(updatedChats);
      return updatedChats;
    });

    // Send to n8n
    try {
      const result = await n8nService.sendMessage(message);

      // Update message status
      setMessages(prev => {
        const chatMessages = prev[chatId] || [];
        const updatedMessages = chatMessages.map(msg => {
          if (msg.id === messageId) {
            return {
              ...msg,
              status: result.success ? 'sent' : 'failed',
            };
          }
          return msg;
        });
        storageService.saveMessages(chatId, updatedMessages);
        return {
          ...prev,
          [chatId]: updatedMessages,
        };
      });

      // Simulate message delivery
      if (result.success) {
        setTimeout(() => {
          updateMessageStatus(chatId, messageId, 'delivered');
        }, 1000);

        setTimeout(() => {
          updateMessageStatus(chatId, messageId, 'read');
        }, 2000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      updateMessageStatus(chatId, messageId, 'failed');
    }
  }, []);

  // Update message status
  const updateMessageStatus = useCallback((chatId, messageId, status) => {
    setMessages(prev => {
      const chatMessages = prev[chatId] || [];
      const updatedMessages = chatMessages.map(msg => {
        if (msg.id === messageId) {
          return { ...msg, status };
        }
        return msg;
      });
      storageService.saveMessages(chatId, updatedMessages);
      return {
        ...prev,
        [chatId]: updatedMessages,
      };
    });
  }, []);

  // Mark chat as read
  const markAsRead = useCallback((chatId) => {
    setChats(prev => {
      const updatedChats = prev.map(chat => {
        if (chat.id === chatId) {
          return { ...chat, unread: 0 };
        }
        return chat;
      });
      storageService.saveChats(updatedChats);
      return updatedChats;
    });
  }, []);

  // Create new chat
  const createChat = useCallback((chatData) => {
    const newChat = {
      id: uuidv4(),
      ...chatData,
      timestamp: Date.now(),
      unread: 0,
    };

    setChats(prev => {
      const updatedChats = [newChat, ...prev];
      storageService.saveChats(updatedChats);
      return updatedChats;
    });

    return newChat;
  }, []);

  // Delete chat
  const deleteChat = useCallback((chatId) => {
    setChats(prev => {
      const updatedChats = prev.filter(chat => chat.id !== chatId);
      storageService.saveChats(updatedChats);
      return updatedChats;
    });

    setMessages(prev => {
      const { [chatId]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const value = {
    chats,
    messages,
    currentUser,
    sendMessage,
    markAsRead,
    createChat,
    deleteChat,
    updateMessageStatus,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};