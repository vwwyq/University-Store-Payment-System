import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, MessageSquare, DollarSign, ShoppingBag, Heart, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Mock notification data
const notifications = [
  {
    id: "1",
    type: "message",
    title: "New message from Alex Johnson",
    description: "Is the calculus textbook still available?",
    time: "5 minutes ago",
    read: false,
    link: "/profile/messages",
  },
  {
    id: "2",
    type: "sale",
    title: "Item Sold",
    description: "Your listing 'Desk Lamp' has been purchased",
    time: "2 hours ago",
    read: false,
    link: "/profile/listings",
  },
  {
    id: "3",
    type: "purchase",
    title: "Purchase Completed",
    description: "Your purchase of 'Psychology 101 Textbook' is complete",
    time: "1 day ago",
    read: true,
    link: "/profile/purchases",
  },
  {
    id: "4",
    type: "like",
    title: "New Interest",
    description: "Maria Rodriguez saved your 'Graphing Calculator' listing",
    time: "2 days ago",
    read: true,
    link: "/profile/listings",
  },
  {
    id: "5",
    type: "system",
    title: "Account Verified",
    description: "Your university email has been verified",
    time: "1 week ago",
    read: true,
    link: "/profile/settings",
  },
  {
    id: "6",
    type: "payment",
    title: "Payment Received",
    description: "You received $35.00 for 'Psychology 101 Textbook'",
    time: "1 week ago",
    read: true,
    link: "/profile/wallet",
  },
]

export default function NotificationsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
        <Button variant="outline" size="sm">
          Mark All as Read
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>Stay updated on messages, purchases, and activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <Link key={notification.id} href={notification.link}>
                  <div
                    className={`flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50 ${!notification.read ? "bg-muted/30" : ""}`}
                  >
                    <div className={`rounded-full p-2 ${getNotificationIconBackground(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className={`font-medium ${!notification.read ? "font-semibold" : ""}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.description}</p>
                    </div>
                    {!notification.read && <div className="h-2 w-2 rounded-full bg-primary"></div>}
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">No notifications</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  You're all caught up! Check back later for new notifications.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Manage how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch checked={true} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Push Notifications</h3>
                <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
              </div>
              <Switch checked={true} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Message Notifications</h3>
                <p className="text-sm text-muted-foreground">Notifications for new messages</p>
              </div>
              <Switch checked={true} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Purchase Notifications</h3>
                <p className="text-sm text-muted-foreground">Notifications for purchases and sales</p>
              </div>
              <Switch checked={true} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper functions for notification icons
function getNotificationIcon(type: string) {
  switch (type) {
    case "message":
      return <MessageSquare className="h-5 w-5 text-blue-600" />
    case "sale":
      return <ShoppingBag className="h-5 w-5 text-green-600" />
    case "purchase":
      return <DollarSign className="h-5 w-5 text-purple-600" />
    case "like":
      return <Heart className="h-5 w-5 text-red-600" />
    case "system":
      return <CheckCircle className="h-5 w-5 text-green-600" />
    case "payment":
      return <DollarSign className="h-5 w-5 text-green-600" />
    default:
      return <AlertCircle className="h-5 w-5 text-yellow-600" />
  }
}

function getNotificationIconBackground(type: string) {
  switch (type) {
    case "message":
      return "bg-blue-100 dark:bg-blue-900"
    case "sale":
      return "bg-green-100 dark:bg-green-900"
    case "purchase":
      return "bg-purple-100 dark:bg-purple-900"
    case "like":
      return "bg-red-100 dark:bg-red-900"
    case "system":
      return "bg-green-100 dark:bg-green-900"
    case "payment":
      return "bg-green-100 dark:bg-green-900"
    default:
      return "bg-yellow-100 dark:bg-yellow-900"
  }
}

