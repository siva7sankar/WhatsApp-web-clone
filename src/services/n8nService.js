import axios from 'axios';

const N8N_WEBHOOK_URL = process.env.REACT_APP_N8N_WEBHOOK_URL;

class N8NService {
  constructor() {
    console.log('=== n8nService Initialized ===');
    console.log('Webhook URL:', N8N_WEBHOOK_URL);
    
    if (!N8N_WEBHOOK_URL) {
      console.error('❌ N8N_WEBHOOK_URL is not configured!');
      console.log('Check your .env file in React app root');
    }
  }

  async sendMessage(message) {
    try {
      const payload = this.createMessagePayload(message);

      console.group('🚀 Sending Request to Proxy');
      console.log('URL:', N8N_WEBHOOK_URL);
      console.log('Full URL:', N8N_WEBHOOK_URL);
      console.log('Payload:', JSON.stringify(payload, null, 2));
      console.groupEnd();

      const response = await axios.post(N8N_WEBHOOK_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      console.group('✅ Proxy Response Success');
      console.log('Status:', response.status);
      console.log('Data:', response.data);
      console.groupEnd();

      return {
        success: true,
        data: response.data,
        messageId: message.id,
      };
      
    } catch (error) {
      console.group('❌ Request Failed');
      console.error('Error Message:', error.message);
      console.error('Request URL:', error.config?.url);
      console.error('Request Method:', error.config?.method);
      
      if (error.response) {
        // Server responded with error status
        console.error('Response Status:', error.response.status);
        console.error('Response Data:', error.response.data);
        console.error('Response Headers:', error.response.headers);
      } else if (error.request) {
        // Request made but no response
        console.error('No response received');
        console.error('Request:', error.request);
      } else {
        // Error in request setup
        console.error('Request setup error');
      }
      console.groupEnd();

      return {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status,
        messageId: message.id,
      };
    }
  }

  createMessagePayload(message) {
    const userId = process.env.REACT_APP_USER_ID || 'user_unknown';
    const userPhone = process.env.REACT_APP_USER_PHONE || '+000000000';
    const userName = process.env.REACT_APP_USER_NAME || 'User';

    // Simple payload that matches n8n expectations
    const payload = {
      messageId: message.id,
      text: message.text,
      timestamp: message.timestamp,
      userId: userId,
      userName: userName,
      userPhone: userPhone,
      source: 'web_chat'
    };

    return payload;
  }

  // ... rest of the methods
}

export default new N8NService();