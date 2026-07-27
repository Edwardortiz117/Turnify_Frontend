export interface AppNotification {
  id: string
  title: string
  body: string
  href: string
  createdAt: string
}

export type NotificationSource = {
  notifications: AppNotification[]
  loading: boolean
  unreadCount: number
  markAllRead: () => void | Promise<void>
  dismissOne: (id: string) => void | Promise<void>
}
