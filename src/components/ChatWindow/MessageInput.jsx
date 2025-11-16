import React, { useState, useRef, useEffect } from 'react';
import { BsEmojiSmile } from 'react-icons/bs';
import { ImAttachment } from 'react-icons/im';
import { IoMdSend } from 'react-icons/io';
import { MdKeyboardVoice } from 'react-icons/md';
import EmojiPicker from 'emoji-picker-react';

const MessageInput = ({ onSend }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage('');
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setMessage(prev => prev + emojiObject.emoji);
    textareaRef.current.focus();
  };

  return (
    <div className="message-input">
      <div className="message-input-container">
        {/* Emoji Button */}
        <div className="emoji-button-container" ref={emojiPickerRef}>
          <button
            type="button"
            className="icon-button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Emoji"
          >
            <BsEmojiSmile size={24} />
          </button>
          
          {showEmojiPicker && (
            <div className="emoji-picker-wrapper">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme="dark"
                width={350}
                height={400}
                searchDisabled={false}
                skinTonesDisabled={false}
                previewConfig={{ showPreview: false }}
              />
            </div>
          )}
        </div>

        {/* Attachment Button */}
        <button type="button" className="icon-button" title="Attach">
          <ImAttachment size={20} />
        </button>

        {/* Input Field */}
        <form onSubmit={handleSubmit} className="message-form">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message"
            rows={1}
            className="message-textarea"
          />
        </form>

        {/* Send or Voice Button */}
        {message.trim() ? (
          <button
            type="button"
            className="icon-button send-button"
            onClick={handleSubmit}
            title="Send"
          >
            <IoMdSend size={24} />
          </button>
        ) : (
          <button type="button" className="icon-button" title="Voice message">
            <MdKeyboardVoice size={24} />
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
