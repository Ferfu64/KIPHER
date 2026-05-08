export function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('Browser does not support notifications');
    return;
  }

  if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification('KIPHER // PROTOCOL_ESTABLISHED', {
          body: 'Tactical link secured. Network awareness active.',
          icon: '/kipher_logo.png' // Or any icon if available
        });
      }
    });
  }
}

export function sendNetworkNotification(title: string, body: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  
  new Notification(`KIPHER // ${title}`, {
    body,
    silent: false,
  });
}
