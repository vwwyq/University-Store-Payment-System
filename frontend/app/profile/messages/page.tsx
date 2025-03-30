"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import ChatInterface from "@/components/chat/chat-interface"
import { ScrollArea } from "@/components/ui/scroll-area"

// Mock data - this will be replaced with your Firestore data
const mockConversations = [
  {
    id: "1",
    user: {
      id: "user1",
      name: "Alex Johnson",
      avatar: "/placeholder.svg",
      isOnline: true,
    },
    lastMessage: {
      content: "Is the calculus textbook still available?",
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      read: false,
    },
    unreadCount: 1,
  },
  {
    id: "2",
    user: {
      id: "user2",
      name: "Maria Rodriguez",
      avatar: "/placeholder.svg",
      isOnline: false,
      lastSeen: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
    lastMessage: {
      content: "Great! I can meet you at the library tomorrow at 2pm.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: true,
    },
    unreadCount: 0,
  },
  {
    id: "3",
    user: {
      id: "user3",
      name: "James Wilson",
      avatar: "/placeholder.svg",
      isOnline: true,
    },
    lastMessage: {
      content: "Would you take $40 for the desk lamp?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      read: true,
    },
    unreadCount: 0,
  },
]

// Mock messages for each conversation
const mockMessages = {
  "1": [
    {
      id: "msg1",
      senderId: "user1",
      receiverId: "currentUser",
      content: "Hi there! I saw your listing for the calculus textbook.",
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      read: true,
    },
    {
      id: "msg2",
      senderId: "user1",
      receiverId: "currentUser",
      content: "Is the calculus textbook still available?",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      read: false,
    },
  ],
  "2": [
    {
      id: "msg3",
      senderId: "currentUser",
      receiverId: "user2",
      content: "Hi Maria, I'm interested in the psychology textbook. When can you meet?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      read: true,
    },
    {
      id: "msg4",
      senderId: "user2",
      receiverId: "currentUser",
      content: "I'm available tomorrow afternoon after 1pm.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5),
      read: true,
    },
    {
      id: "msg5",
      senderId: "currentUser",
      receiverId: "user2",
      content: "Perfect! How about 2pm at the library?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.2),
      read: true,
    },
    {
      id: "msg6",
      senderId: "user2",
      receiverId: "currentUser",
      content: "Great! I can meet you at the library tomorrow at 2pm.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: true,
    },
  ],
  "3": [
    {
      id: "msg7",
      senderId: "user3",
      receiverId: "currentUser",
      content: "Hello, I'm interested in the desk lamp you're selling.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
      read: true,
    },
    {
      id: "msg8",
      senderId: "currentUser",
      receiverId: "user3",
      content: "Hi James! It's still available for $50.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5.5),
      read: true,
    },
    {
      id: "msg9",
      senderId: "user3",
      receiverId: "currentUser",
      content: "Would you take $40 for the desk lamp?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      read: true,
    },
  ],
}

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const currentUserId = "currentUser" // This would come from your auth system

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    // If less than 24 hours ago, show time
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    // If less than 7 days ago, show day of week
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: "short" })
    }

    // Otherwise show date
    return date.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  const filteredConversations = mockConversations.filter((conversation) =>
    conversation.user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex-1 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Messages</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] gap-4 h-[calc(100vh-12rem)]">
        <Card className="h-full flex flex-col">
          <CardHeader className="px-4 py-3 border-b">
            <CardTitle>Conversations</CardTitle>
            <CardDescription>Chat with other students about items</CardDescription>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search conversations..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <ScrollArea className="flex-1">
            <CardContent className="p-0">
              {filteredConversations.length > 0 ? (
                <div className="divide-y">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedConversation === conversation.id ? "bg-muted" : ""
                      }`}
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={conversation.user.avatar} alt={conversation.user.name} />
                            <AvatarFallback>{conversation.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {conversation.user.isOnline && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{conversation.user.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatTime(conversation.lastMessage.timestamp)}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage.content}</p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <div className="ml-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-xs text-primary-foreground">{conversation.unreadCount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">No conversations found</div>
              )}
            </CardContent>
          </ScrollArea>
        </Card>

        <div className="h-full">
          {selectedConversation ? (
            <ChatInterface
              currentUserId={currentUserId}
              otherUser={mockConversations.find((c) => c.id === selectedConversation)!.user}
              initialMessages={mockMessages[selectedConversation] || []}
              isFullPage
            />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center p-8">
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p className="text-muted-foreground">Choose a conversation from the list to start chatting</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

