import axios from 'axios';

const N8N_WEBHOOK_URL = process.env.REACT_APP_N8N_WEBHOOK_URL;
const POLL_INTERVAL = parseInt(process.env.REACT_APP_POLL_INTERVAL) || 2000;

class N8NService {
  constructor() {
    this.pollingInterval = null;
    this.messageCallbacks = [];
    this.lastMessageTimestamp = Date.now();
  }

  /**
 * Send message to n8n webhook
 */
async sendMessage(message) {
  try {
    const payload = this.createMessagePayload(message);

    console.group('🚀 Sending to n8n');
    console.log('URL:', N8N_WEBHOOK_URL);
    console.log('Payload:', JSON.stringify(payload, null, 2));
    console.log('Message Object:', message);
    console.groupEnd();

    const response = await axios.post(N8N_WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    console.group('✅ n8n Response');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    console.groupEnd();

    return {
      success: true,
      data: response.data,
      messageId: message.id,
    };
  } catch (error) {
    console.group('❌ n8n Error');
    console.error('Error Message:', error.message);
    console.error('Error Response:', error.response?.data);
    console.error('Error Status:', error.response?.status);
    console.error('Error Headers:', error.response?.headers);
    console.error('Full Error:', error);
    console.groupEnd();

    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status,
      messageId: message.id,
    };
  }
}

  /**
   * Create WhatsApp-style message payload
   */
  createMessagePayload(message) {
    const userId = process.env.REACT_APP_USER_ID;
    const userPhone = process.env.REACT_APP_USER_PHONE;
    const userName = process.env.REACT_APP_USER_NAME;

    return {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'web_chat_client',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: userPhone,
                  phone_number_id: userId,
                },
                contacts: [
                  {
                    profile: {
                      name: userName,
                    },
                    wa_id: userPhone,
                  },
                ],
                messages: [
                  {
                    from: userPhone,
                    id: message.id,
                    timestamp: message.timestamp.toString(),
                    text: {
                      body: message.text,
                    },
                    type: 'text',
                  },
                ],
              },
              field: 'messages',
            },
          ],
        },
      ],
      // Additional metadata for web chat
      source: 'web_chat',
      sessionId: this.getSessionId(),
      user: {
        id: userId,
        name: userName,
        phone: userPhone,
      },
    };
  }

  /**
   * Subscribe to incoming messages from n8n
   */
  onMessage(callback) {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Start polling for messages (alternative to WebSocket)
   */
  startPolling() {
    if (this.pollingInterval) {
      return;
    }

    console.log('Starting message polling...');

    this.pollingInterval = setInterval(async () => {
      try {
        await this.pollMessages();
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, POLL_INTERVAL);
  }

  /**
   * Stop polling
   */
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('Stopped message polling');
    }
  }

  /**
   * Poll for new messages from n8n
   */
  async pollMessages() {
    try {
      const pollUrl = `${N8N_WEBHOOK_URL}/poll`;
      const response = await axios.get(pollUrl, {
        params: {
          userId: process.env.REACT_APP_USER_ID,
          since: this.lastMessageTimestamp,
        },
        timeout: 5000,
      });

      if (response.data && response.data.messages) {
        const messages = response.data.messages;

        if (messages.length > 0) {
          console.log('Received messages from n8n:', messages);

          messages.forEach(msg => {
            this.notifyMessageCallbacks(msg);
          });

          // Update last timestamp
          this.lastMessageTimestamp = Math.max(
            ...messages.map(m => m.timestamp),
            this.lastMessageTimestamp
          );
        }
      }
    } catch (error) {
      // Silently handle polling errors
      if (error.code !== 'ECONNABORTED') {
        console.debug('Polling request failed:', error.message);
      }
    }
  }

  /**
   * Notify all message callbacks
   */
  notifyMessageCallbacks(message) {
    this.messageCallbacks.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error('Error in message callback:', error);
      }
    });
  }

  /**
   * Parse incoming message from n8n (WhatsApp format)
   */
  parseIncomingMessage(data) {
    try {
      // Handle direct message format
      if (data.text && data.from) {
        return {
          id: data.id || `msg_${Date.now()}`,
          text: data.text.body || data.text,
          from: data.from,
          timestamp: parseInt(data.timestamp) || Date.now(),
          type: 'received',
          status: 'delivered',
        };
      }

      // Handle WhatsApp webhook format
      if (data.entry && data.entry[0]) {
        const value = data.entry[0].changes[0].value;
        const message = value.messages[0];

        return {
          id: message.id,
          text: message.text.body,
          from: message.from,
          timestamp: parseInt(message.timestamp),
          type: 'received',
          status: 'delivered',
        };
      }

      return null;
    } catch (error) {
      console.error('Error parsing incoming message:', error);
      return null;
    }
  }

  /**
   * Get or create session ID
   */
  getSessionId() {
    let sessionId = localStorage.getItem('chat_session_id');

    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('chat_session_id', sessionId);
    }

    return sessionId;
  }

  /**
   * Clear session
   */
  clearSession() {
    localStorage.removeItem('chat_session_id');
  }
}

export default new N8NService();