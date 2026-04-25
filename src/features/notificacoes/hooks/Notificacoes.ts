import { useState } from "react"

export function useNotifications() {
  const [notifications, setNotifications] = useState([])

  return {
    notifications,
    setNotifications,
  }
}