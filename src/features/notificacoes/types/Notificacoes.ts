export type NotificationType = "urgent" | "info" | "success" | "system"
export type NotificationStatus = "read" | "unread"
export type NotificationTag = "Urgente" | "Informacao" | "Sucesso" | "Sistema"

export interface Notification {
  id: number
  type: NotificationType
  title: string
  description: string
  time: string
  read?: boolean
}