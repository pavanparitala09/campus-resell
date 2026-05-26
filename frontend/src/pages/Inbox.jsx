import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, Tag, ChevronLeft } from 'lucide-react';
import api from '../api';

const Inbox = () => {
  const { user, activeChatId, setActiveChatId, globalMessages, setGlobalMessages, fetchUnreadCount, stompClient } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const chatIdParam = searchParams.get('chatId');

  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  
  const messagesEndRef = useRef(null);

  // Sync activeChatId in Context when chatId changes
  useEffect(() => {
    if (chatIdParam) {
      setActiveChatId(parseInt(chatIdParam, 10));
      loadChatMessages(chatIdParam);
    } else {
      setActiveChatId(null);
      setMessages([]);
    }

    return () => {
      setActiveChatId(null);
    };
  }, [chatIdParam]);

  // Handle incoming global messages over WS
  useEffect(() => {
    if (globalMessages.length > 0) {
      const latestMsg = globalMessages[globalMessages.length - 1];
      
      // If the incoming message belongs to our currently active chat, append it to messages state
      if (activeChatId === latestMsg.chatId) {
        setMessages(prev => {
          // Prevent duplicates
          if (prev.some(m => m.id === latestMsg.id)) return prev;
          return [...prev, latestMsg];
        });
        
        // Mark notification as read for current chat (automatically done by reading or call API)
        api.post('/api/notifications/read-all').then(() => fetchUnreadCount());
      }
      
      // Update chats list lastMessage content in the sidebar list
      setChats(prev => prev.map(c => c.id === latestMsg.chatId ? { ...c, lastMessage: latestMsg } : c));
    }
  }, [globalMessages, activeChatId]);

  // Load Chats List (Inbox)
  useEffect(() => {
    const loadInbox = async () => {
      setChatsLoading(true);
      try {
        const res = await api.get('/api/chats');
        setChats(res.data);
      } catch (err) {
        console.error("Failed to load inbox chats list", err);
      } finally {
        setChatsLoading(false);
      }
    };
    loadInbox();
  }, [chatIdParam]);

  // Scroll to bottom helper
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatMessages = async (id) => {
    setChatLoading(true);
    try {
      const res = await api.get(`/api/chats/${id}/messages`);
      setMessages(res.data);
      scrollToBottom();
    } catch (err) {
      console.error("Failed to load chat history", err);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !chatIdParam) return;

    const content = messageText.trim();
    setMessageText('');

    try {
      // POST message to API. The backend persists it and automatically broadcasts it to /topic/chat/{chatId}
      const res = await api.post(`/api/chats/${chatIdParam}/messages`, { content });
      
      // Append locally to prevent latency lags
      setMessages(prev => {
        if (prev.some(m => m.id === res.data.id)) return prev;
        return [...prev, res.data];
      });

      // Update sidebar chat lastMessage
      setChats(prev => prev.map(c => c.id === parseInt(chatIdParam, 10) ? { ...c, lastMessage: res.data } : c));
    } catch (err) {
      console.error("Failed to transmit message", err);
    }
  };

  const selectChat = (id) => {
    const params = new URLSearchParams(searchParams);
    params.set('chatId', String(id));
    setSearchParams(params);
  };

  const closeActiveChat = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('chatId');
    setSearchParams(params);
  };

  const activeChat = chats.find(c => c.id === parseInt(chatIdParam, 10));

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)] flex gap-4 overflow-hidden">
      {/* 1. Left Pane: Channels List */}
      <aside className={`w-full md:w-80 shrink-0 bg-white border border-gray-100 rounded-3xl flex flex-col overflow-hidden shadow-xs text-left ${chatIdParam ? 'hidden md:flex' : 'flex'}`}>
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-black text-sm text-gray-800 flex items-center gap-2">
            <MessageSquare size={16} className="text-primary" />
            <span>Messages</span>
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-gray-50">
          {chatsLoading ? (
            [1, 2].map(n => (
              <div key={n} className="p-4 flex gap-3 animate-pulse">
                <div className="w-10 h-10 bg-gray-50 rounded-full"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-gray-50 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-50 rounded w-1/2"></div>
                </div>
              </div>
            ))
          ) : chats.length > 0 ? (
            chats.map((chat) => {
              const partner = chat.buyer.id === user.id ? chat.seller : chat.buyer;
              const isSelected = parseInt(chatIdParam, 10) === chat.id;
              
              return (
                <div
                  key={chat.id}
                  onClick={() => selectChat(chat.id)}
                  className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50/50 transition-smooth ${isSelected ? 'bg-blue-50/50' : 'bg-white'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                    {partner.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs font-black text-gray-800 truncate">{partner.name}</span>
                      <span className="text-[9px] text-gray-400 font-semibold">{chat.lastMessage ? new Date(chat.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold block truncate mb-0.5">
                      Re: {chat.product ? chat.product.title : chat.lostFoundItem ? `[${chat.lostFoundItem.type}] ${chat.lostFoundItem.title}` : 'Inquiry'}
                    </span>
                    <p className="text-xs text-gray-500 truncate">
                      {chat.lastMessage ? chat.lastMessage.content : 'No messages yet'}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-gray-400 text-xs font-semibold">
              Inbox is empty
            </div>
          )}
        </div>
      </aside>

      {/* 2. Right Pane: Chat Window */}
      <main className={`flex-1 bg-white border border-gray-100 rounded-3xl flex flex-col overflow-hidden shadow-xs relative ${!chatIdParam ? 'hidden md:flex' : 'flex'}`}>
        {activeChat ? (
          <>
            {/* Header */}
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3 justify-between bg-gray-50/50">
              <div className="flex items-center gap-3 text-left">
                {/* Back button (Mobile only) */}
                <button onClick={closeActiveChat} className="md:hidden p-1 text-gray-500 hover:bg-gray-100 rounded-lg">
                  <ChevronLeft size={20} />
                </button>
                <div className="w-9 h-9 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                  {activeChat.buyer.id === user.id ? activeChat.seller.name.charAt(0).toUpperCase() : activeChat.buyer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="text-xs font-black text-gray-800">
                    {activeChat.buyer.id === user.id ? activeChat.seller.name : activeChat.buyer.name}
                  </span>
                  {activeChat.product ? (
                    <Link to={`/products/${activeChat.product.id}`} className="text-[10px] font-bold text-primary hover:underline block truncate max-w-[200px]">
                      Re: {activeChat.product.title} (₹{activeChat.product.price})
                    </Link>
                  ) : activeChat.lostFoundItem ? (
                    <span className="text-[10px] font-bold text-gray-500 block truncate max-w-[200px]">
                      Re: [{activeChat.lostFoundItem.type}] {activeChat.lostFoundItem.title} ({activeChat.lostFoundItem.location})
                    </span>
                  ) : null}
                </div>
              </div>
              
              {activeChat.product ? (
                <Link to={`/products/${activeChat.product.id}`} className="text-[10px] font-bold bg-primary text-white px-2.5 py-1 rounded-md shrink-0">
                  View Item
                </Link>
              ) : activeChat.lostFoundItem ? (
                <Link to="/lost-found" className="text-[10px] font-bold bg-primary text-white px-2.5 py-1 rounded-md shrink-0">
                  View Lost & Found
                </Link>
              ) : null}
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-5 overflow-y-auto no-scrollbar space-y-4 bg-gray-50/20">
              {chatLoading && messages.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-xs">Loading logs...</div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.senderId === user.id;
                  return (
                    <div 
                      key={msg.id}
                      className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-xs shadow-2xs text-left ${isOwn ? 'bg-primary text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}`}>
                        <p className="leading-relaxed break-words">{msg.content}</p>
                        <span className={`text-[8px] mt-1 block text-right font-medium ${isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 flex gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs outline-hidden focus:bg-white focus:border-primary transition-smooth"
                required
              />
              <button
                type="submit"
                className="p-2.5 bg-primary hover:bg-primary-hover text-white rounded-2xl shadow-xs transition-smooth cursor-pointer shrink-0"
              >
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-400 font-medium">
            <MessageSquare size={36} className="text-gray-300 stroke-1 mb-2" />
            <p className="text-xs">Select a conversation thread from the sidebar to open chat.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Inbox;
