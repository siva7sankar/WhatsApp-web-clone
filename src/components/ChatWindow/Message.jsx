import React from 'react';
import { BsCheck, BsCheckAll } from 'react-icons/bs';
import { MdError } from 'react-icons/md';

const Message = ({ message, showAvatar, chat }) => {
  const isSent = message.type === 'sent';

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case 'pending':
        return <div className="status-icon pending">🕐</div>;
      case 'sent':
        return <BsCheck className="status-icon" size={16} />;
      case 'delivered':
        return <BsCheckAll className="status-icon" size={16} />;
      case 'read':
        return <BsCheckAll className="status-icon read" size={16} />;
      case 'failed':
        return <MdError className="status-icon failed" size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className={`message ${isSent ? 'message-sent' : 'message-received'}`}>
      {!isSent && showAvatar && (
        <div className="message-avatar">
          <img
            src={chat.avatar || `https://ui-avatars.com/api/?name=${chat.name}&background=00a884&color=fff&size=32`}
alt={chat.name}
/>
</div>
)}
  <div className={`message-bubble ${isSent ? 'sent' : 'received'}`}>
    <div className="message-text">{message.text}</div>
    <div className="message-meta">
      <span className="message-time">{formatTime(message.timestamp)}</span>
      {isSent && <span className="message-status">{getStatusIcon()}</span>}
    </div>
  </div>
</div>
);
};
export default Message;