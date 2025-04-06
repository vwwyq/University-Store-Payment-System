"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, PhoneCall, MoreVertical, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
}

interface Contact {
  id: string;
  name: string;
  lastMessage?: string;
  timestamp?: string;
  email?: string;
}

interface User {
  id: string;
  firebase_uid: string;
  firstname: string;
  lastname: string;
  email: string;
}

export default function MessagesPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [allUsers, setAllUsers] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch all users to create contacts list
  const fetchUsers = async (searchTerm = "") => {
    try {

        let url = `${process.env.NEXT_PUBLIC_API_URL}/api/users`;
    
        // Add search parameter if provided
        if (searchTerm) {
          url += `?search=${encodeURIComponent(searchTerm)}`;
        }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const usersData: User[] = await response.json();
      console.log(`Fetched ${usersData.length} users`);

      const contactsList = usersData.map(user => ({
        id: user.firebase_uid || user.id,
        name: `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.email.split('@')[0],
        email: user.email,
        lastMessage: "",
        timestamp: ""
      }));
        
      if (searchTerm) {
        // Just update the contact list without affecting all users
        setContacts(contactsList);
      } else {
        // Update both lists when fetching all users
        setContacts(contactsList);
        setAllUsers(contactsList);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users list');
      setLoading(false);
    }
  };

  // Initialize WebSocket and fetch user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me`, {
          credentials: "include"
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch user data');
        }
        
        const userData = await response.json();
        setCurrentUser({
          id: userData.firebase_uid || userData.id,
          name: `${userData.firstname || ''} ${userData.lastname || ''}`
        });
        
        // After getting user data, fetch contacts
        await fetchUsers();
        
        // Initialize WebSocket connection
        initializeWebSocket();
        
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
        setLoading(false);
      }
    };
    
    fetchCurrentUser();
    
    // Cleanup function
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [router]);

  const initializeWebSocket = () => {
    if (isConnecting) return;
    setIsConnecting(true);
    
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000';
    console.log("Connecting to WebSocket at:", wsUrl);
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setWsConnected(true);
      setIsConnecting(false);
      let token = null;

      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith('jwtToken=')) {
          token = cookie.substring('jwtToken='.length);
          console.log("Found token in cookies");
          break;
        }
      }
      if (!token) {
        token = sessionStorage.getItem('jwtToken') || localStorage.getItem('jwtToken');
        if (token) console.log("Found token in storage");
      }
        
      if (token) {
        console.log("JWT token found, sending auth");
        ws.send(JSON.stringify({ type: 'auth', token }));
      } else {
        console.warn("No JWT token found in cookies");
        // Attempt to get a new token by checking auth status
        refreshToken();
      }
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received WebSocket message:", data);
        
        if (data.type === 'auth_success') {
          console.log("WebSocket authenticated successfully");
        } else if (data.type === 'auth_error') {
          console.error("WebSocket authentication failed:", data.message);
        } else if (data.type === 'message') {
          // Handle incoming message
          if (selectedContact && data.from === selectedContact.id) {
            setMessages(prev => [...prev, {
              _id: Date.now().toString(),
              senderId: data.from,
              receiverId: currentUser?.id || '',
              content: data.content,
              timestamp: data.timestamp || new Date().toISOString()
            }]);
          }
          
          // Update contacts list with new message
          setContacts(prev => {
            const contactIndex = prev.findIndex(c => c.id === data.from);
            if (contactIndex !== -1) {
              const updatedContacts = [...prev];
              updatedContacts[contactIndex] = {
                ...updatedContacts[contactIndex],
                lastMessage: data.content,
                timestamp: data.timestamp || new Date().toISOString()
              };
              return updatedContacts;
            }
            return prev;
          });
        } else if (data.type === 'message_sent') {
          console.log("Message sent confirmation received", data);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };
    
    ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      setWsConnected(false);
      setIsConnecting(false);
      
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (currentUser) {
          console.log("Attempting to reconnect WebSocket...");
          initializeWebSocket();
        }
      }, 3000);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnecting(false);
    };
    
    setWebSocket(ws);
  };

  const refreshToken = async () => {
    try {
      // Make a request to an endpoint that checks authentication status
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        console.log("Auth check successful, token should be refreshed");
        // Re-initialize WebSocket after token refresh
       
        try {
            const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, {
              method: 'GET',
              credentials: 'include'
            });
            
            if (tokenResponse.ok) {
              const data = await tokenResponse.json();
              if (data.token) {
                // Store token in sessionStorage as fallback
                sessionStorage.setItem('jwtToken', data.token);
                console.log("Got fresh token, stored in sessionStorage");
              }
            }
          } catch (tokenError) {
            console.error("Error fetching fresh token:", tokenError);
          }
          
       
        setTimeout(initializeWebSocket, 500);
      } else {
        console.error("Authentication failed, redirecting to login");
        router.push('/login');
      }
    } catch (error) {
      console.error("Error refreshing authentication:", error);
    }
  }

  // Fetch messages when a contact is selected
  useEffect(() => {
    if (selectedContact && currentUser) {
      const fetchMessages = async () => {
        try {
          setLoading(true);
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/${selectedContact.id}`, {
            credentials: 'include'
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch messages');
          }
          
          const messagesData = await response.json();
          setMessages(messagesData);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching messages:', err);
          setError('Failed to load messages');
          setLoading(false);
        }
      };
      
      fetchMessages();
    }
  }, [selectedContact, currentUser]);

  // Scroll to bottom of messages when new ones arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Update last messages for contacts
  useEffect(() => {
    if (currentUser) {
      const updateLastMessages = async () => {
        try {
          // For each contact, fetch the most recent message
          const updatedContacts = await Promise.all(
            contacts.map(async (contact) => {
              try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/${contact.id}/latest`, {
                  credentials: 'include'
                });
                
                if (!response.ok) {
                  return contact;
                }
                
                const latestMessage = await response.json();
                if (latestMessage && latestMessage.content) {
                  return {
                    ...contact,
                    lastMessage: latestMessage.content,
                    timestamp: latestMessage.timestamp
                  };
                }
                return contact;
              } catch (error) {
                console.error(`Error fetching latest message for ${contact.id}:`, error);
                return contact;
              }
            })
          );
          
          setContacts(updatedContacts);
        } catch (err) {
          console.error('Error updating last messages:', err);
        }
      };
      
      updateLastMessages();
    }
  }, [currentUser]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedContact || !wsConnected || !currentUser) {
      if (!wsConnected) {
        console.error("Cannot send message: WebSocket not connected");
        // Try to reconnect
        initializeWebSocket();
      }
      return;
    }
    
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error("WebSocket not ready, message not sent");
      initializeWebSocket();
      return;
    }
    
    // Send message via WebSocket
    const messageData = {
      type: 'message',
      receiverId: selectedContact.id,
      content: newMessage
    };
    
    console.log("Sending message via WebSocket:", messageData);
    ws.send(JSON.stringify(messageData));
    
    // Optimistically add message to UI
    const tempMessage: Message = {
      _id: Date.now().toString(),
      senderId: currentUser.id,
      receiverId: selectedContact.id,
      content: newMessage,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempMessage]);
    
    // Update contact's last message
    setContacts(prev => {
      const contactIndex = prev.findIndex(c => c.id === selectedContact.id);
      if (contactIndex !== -1) {
        const updatedContacts = [...prev];
        updatedContacts[contactIndex] = {
          ...updatedContacts[contactIndex],
          lastMessage: newMessage,
          timestamp: new Date().toISOString()
        };
        return updatedContacts;
      }
      return prev;
    });
    
    setNewMessage("");
  };

  // Format timestamp to display time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format timestamp for conversation list
  const formatConversationTime = (timestamp?: string) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return formatTime(timestamp);
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  // Handle search functionality
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (query.length >= 2) {
        // Debounce the search to avoid too many requests
        const timeoutId = setTimeout(() => {
          fetchUsers(query);
        }, 300);
        return () => clearTimeout(timeoutId);
      } else if (!query) {
        setContacts(allUsers);
      }
    /*if (!query) {
      setContacts(allUsers);
      return;
    }
    
    const filteredContacts = allUsers.filter(contact => 
      contact.name.toLowerCase().includes(query) || 
      (contact.email && contact.email.toLowerCase().includes(query))
    );
    
    setContacts(filteredContacts);*/
  };

  if (loading && !selectedContact) {
    return <div className="flex items-center justify-center h-screen">Loading conversations...</div>;
  }

  if (error && !contacts.length) {
    return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold">Messages</h1>
          {!wsConnected && (
            <span className="ml-2 text-xs text-red-500">
              (Disconnected)
            </span>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Contacts sidebar */}
        <aside className="w-64 border-r flex flex-col">
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search users..." 
                className="pl-8 bg-background"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* Active conversations */}
            {contacts.length > 0 ? (
              contacts.map((contact) => (
                <div 
                  key={contact.id} 
                  className={`flex items-center gap-3 p-3 hover:bg-muted cursor-pointer ${selectedContact?.id === contact.id ? 'bg-muted' : ''}`}
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="flex-shrink-0">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{contact.name}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {contact.lastMessage }
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatConversationTime(contact.timestamp)}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                {loading ? "Loading contacts..." : 
                 searchQuery ? "No matching users found" : "No contacts found"}
              </div>
            )}
          </div>
        </aside>

        {/* Chat area */}
        {selectedContact ? (
          <div className="flex-1 flex flex-col">
            {/* Chat header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="w-8 h-8 mr-3">
                  <AvatarFallback>{getInitials(selectedContact.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{selectedContact.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <MoreVertical size={20} />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  Loading messages...
                </div>
              ) : messages.length > 0 ? (
                messages.map((message) => {
                  const isCurrentUser = message.senderId === currentUser?.id;
                  
                  return (
                    <div key={message._id} className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : ''}`}>
                      {!isCurrentUser && (
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>{getInitials(selectedContact.name)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`rounded-lg p-3 max-w-md ${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <p>{message.content}</p>
                        <div className="text-xs opacity-70 mt-1">
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                      {isCurrentUser && (
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>{currentUser ? getInitials(currentUser.name) : 'ME'}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No messages yet. Start a conversation!
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex items-center gap-2">
                <Input 
                  placeholder="Type a message..." 
                  className="flex-1"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button 
                  type="submit" 
                  disabled={!newMessage.trim() || !wsConnected}
                  title={!wsConnected ? "Reconnecting..." : ""}
                >
                  <Send size={18} />
                </Button>
              </div>
              {!wsConnected && (
                <div className="text-xs text-red-500 mt-1">
                  Reconnecting to server...
                </div>
              )}
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
}