class AudioService {
  constructor() {
    this.notificationSound = null;
    this.loadNotificationSound();
  }

  /**
   * Load notification sound
   */
  loadNotificationSound() {
    try {
      this.notificationSound = new Audio('/notification.mp3');
      this.notificationSound.volume = 0.5;
    } catch (error) {
      console.error('Error loading notification sound:', error);
    }
  }

  /**
   * Play notification sound
   */
  playNotification() {
    if (this.notificationSound && !document.hidden) {
      this.notificationSound.play().catch(error => {
        console.error('Error playing notification:', error);
      });
    }
  }

  /**
   * Show browser notification
   */
  async showNotification(title, body, icon) {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: icon || '/favicon.ico',
          badge: '/favicon.ico',
        });
      } catch (error) {
        console.error('Error showing notification:', error);
      }
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
      }
    }
    return Notification.permission === 'granted';
  }
}

export default new AudioService();