"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

// Mock message type - this will be replaced with your Firestore types
interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: Date
  read: boolean
}

// Mock user type - this will be replaced with your user authentication system
interface ChatUser {
  id: string
  name: string
  avatar?: string
  lastSeen?: Date
  isOnline?: boolean
}

interface ChatInterfaceProps {
  currentUserId: string
  otherUser: ChatUser
  initialMessages?: Message[]
  onClose?: () => void
  isFullPage?: boolean
}

export default function ChatInterface({
  currentUserId,
  otherUser,
  initialMessages = [],
  onClose,
  isFullPage = false,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // This function will be replaced with your Firestore implementation
  const sendMessage = () => {
    if (!newMessage.trim()) return

    // Create a new message
    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      receiverId: otherUser.id,
      content: newMessage,
      timestamp: new Date(),
      read: false,
    }

    // Add to local state (this will be replaced with Firestore)
    setMessages([...messages, message])
    setNewMessage("")

    // In a real implementation, you would save this to Firestore here
    // Example: firestore.collection('messages').add(message)
  }

  // This effect would be replaced with a Firestore listener
  useEffect(() => {
    // In a real implementation, you would set up a Firestore listener here
    // Example:
    // const unsubscribe = firestore
    //   .collection('messages')
    //   .where('conversationId', '==', `${currentUserId}_${otherUser.id}`)
    //   .orderBy('timestamp')
    //   .onSnapshot(snapshot => {
    //     const newMessages = snapshot.docs.map(doc => ({
    //       id: doc.id,
    //       ...doc.data()
    //     }))
    //     setMessages(newMessages)
    //   })
    //
    // return () => unsubscribe()

    // For now, we'll just use the initial messages
    return () => {}
  }, [currentUserId, otherUser.id])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <Card className={`${isFullPage ? "h-[calc(100vh-8rem)]" : "h-[500px]"} flex flex-col`}>
      <CardHeader className="px-4 py-3 border-b flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={otherUser.avatar || "/placeholder.svg"} alt={otherUser.name} />
            <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">{otherUser.name}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {otherUser.isOnline
                ? "Online"
                : otherUser.lastSeen
                  ? `Last seen ${formatTime(otherUser.lastSeen)}`
                  : "Offline"}
            </p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === currentUserId ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.senderId === currentUserId ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 text-right mt-1">{formatTime(message.timestamp)}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <CardFooter className="p-4 pt-2 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage()
          }}
          className="flex w-full items-center space-x-2"
        >
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

