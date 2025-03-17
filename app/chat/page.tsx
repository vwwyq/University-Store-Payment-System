"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";

export default function ChatPage() {
  const [messages, setMessages] = useState<{ id: string; text: string; user: string }[]>([]);
  const [message, setMessage] = useState("");
  const user = auth.currentUser;

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
    });
    return () => unsubscribe();
  }, []);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await addDoc(collection(db, "messages"), {
      text: message,
      user: user.email,
      timestamp: serverTimestamp(),
    });
    setMessage("");
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Chat Room</h2>
      <div className="border p-4 h-80 overflow-y-auto mb-4">
        {messages.map((msg) => (
          <p key={msg.id} className="p-2 border-b">
            <strong>{msg.user}: </strong> {msg.text}
          </p>
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex">
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border p-2 flex-grow"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 ml-2">
          Send
        </button>
      </form>
    </div>
  );
}
