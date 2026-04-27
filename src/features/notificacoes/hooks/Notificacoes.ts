import { useState } from 'react';

type Notification = {
  id: number;
  title: string;
};

function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  return {
    notifications,
    setNotifications,
  };
}

export { useNotifications };
