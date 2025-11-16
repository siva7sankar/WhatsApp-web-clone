import React from 'react';
import { IoMdClose } from 'react-icons/io';
import { MdEdit } from 'react-icons/md';

const Profile = ({ user, onClose }) => {
  return (
    <div className="profile-modal">
      <div className="profile-content">
        {/* Header */}
        <div className="profile-header">
          <button className="icon-button" onClick={onClose}>
            <IoMdClose size={24} />
          </button>
          <span>Profile</span>
        </div>

        {/* Avatar Section */}
        <div className="profile-avatar-section">
          <div className="profile-avatar-large">
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=00a884&color=fff&size=200`}
              alt={user.name}
            />
          </div>
        </div>

        {/* Info Sections */}
        <div className="profile-info">
          <div className="profile-section">
            <label>Your name</label>
            <div className="profile-field">
              <span>{user.name}</span>
              <button className="icon-button">
                <MdEdit size={20} />
              </button>
            </div>
          </div>

          <div className="profile-section">
            <label>Phone</label>
            <div className="profile-field">
              <span>{user.phone}</span>
            </div>
          </div>

          <div className="profile-section">
            <label>About</label>
            <div className="profile-field">
              <span>Hey there! I am using WhatsApp.</span>
              <button className="icon-button">
                <MdEdit size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;