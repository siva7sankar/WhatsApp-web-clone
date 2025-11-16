import React, { useEffect, useRef, forwardRef } from 'react';
import Message from './Message';
import { formatDistanceToNow } from 'date-fns';

const MessageList = forwardRef(({ messages, chat }, ref) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatDateDivider = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'TODAY';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'YESTERDAY';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      }).toUpperCase();
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="message-list" ref={containerRef}>
      <div className="message-list-content">
        {Object.keys(groupedMessages).length === 0 ? (
          <div className="no-messages">
            <div className="no-messages-content">
              <div className="lock-icon">🔒</div>
              <p>Your messages are end-to-end encrypted</p>
              <span>Start the conversation by sending a message</span>
            </div>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              <div className="date-divider">
                <span>{formatDateDivider(msgs[0].timestamp)}</span>
              </div>
              {msgs.map((message, index) => (
                <Message 
                  key={message.id} 
                  message={message}
                  showAvatar={message.type === 'received' && (
                    index === msgs.length - 1 || 
                    msgs[index + 1]?.type === 'sent'
                  )}
                  chat={chat}
                />
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
});

export default MessageList;