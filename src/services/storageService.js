const MESSAGES_KEY = 'chat_messages';
const CHATS_KEY = 'chat_list';
const USER_KEY = 'user_profile';

class StorageService {
  /**
   * Save messages to localStorage
   */
  saveMessages(chatId, messages) {
    try {
      const allMessages = this.getAllMessages();
      allMessages[chatId] = messages;
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(allMessages));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  }

  /**
   * Get messages for a chat
   */
  getMessages(chatId) {
    try {
      const allMessages = this.getAllMessages();
      return allMessages[chatId] || [];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  /**
   * Get all messages
   */
  getAllMessages() {
    try {
      const data = localStorage.getItem(MESSAGES_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting all messages:', error);
      return {};
    }
  }

  /**
   * Add a new message
   */
  addMessage(chatId, message) {
    try {
      const messages = this.getMessages(chatId);
      messages.push(message);
      this.saveMessages(chatId, messages);
      return message;
    } catch (error) {
      console.error('Error adding message:', error);
      return null;
    }
  }

  /**
   * Update message status
   */
  updateMessageStatus(chatId, messageId, status) {
    try {
      const messages = this.getMessages(chatId);
      const message = messages.find(m => m.id === messageId);

      if (message) {
        message.status = status;
        this.saveMessages(chatId, messages);
      }
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  }

  /**
   * Save chat list
   */
  saveChats(chats) {
    try {
      localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
    } catch (error) {
      console.error('Error saving chats:', error);
    }
  }

  /**
   * Get chat list
   */
  getChats() {
    try {
      const data = localStorage.getItem(CHATS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting chats:', error);
      return [];
    }
  }

  /**
   * Update chat
   */
  updateChat(chatId, updates) {
    try {
      const chats = this.getChats();
      const chatIndex = chats.findIndex(c => c.id === chatId);

      if (chatIndex !== -1) {
        chats[chatIndex] = { ...chats[chatIndex], ...updates };
      } else {
        chats.push({ id: chatId, ...updates });
      }

      this.saveChats(chats);
    } catch (error) {
      console.error('Error updating chat:', error);
    }
  }

  /**
   * Clear all data
   */
  clearAll() {
    localStorage.removeItem(MESSAGES_KEY);
    localStorage.removeItem(CHATS_KEY);
    localStorage.removeItem('chat_session_id');
  }
}

export default new StorageService();