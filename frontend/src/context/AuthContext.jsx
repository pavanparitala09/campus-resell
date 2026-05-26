import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../api';
import { Client } from '@stomp/stompjs';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [activeChatId, setActiveChatId] = useState(null);
  const [globalMessages, setGlobalMessages] = useState([]); // Real-time message listener for active inbox
  
  const stompClientRef = useRef(null);

  // Fetch current user details on load
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/api/auth/me');
          setUser(res.data);
          // Fetch unread notifications count
          fetchUnreadCount();
        } catch (err) {
          console.error("Token validation failed, clearing token", err);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/api/notifications/unread-count');
      setUnreadNotifications(res.data.count);
    } catch (err) {
      console.error("Error fetching unread notifications count", err);
    }
  };

  // Configure WebSocket Client when User Logged In
  useEffect(() => {
    if (!user) {
      // Disconnect if user logs out
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
      return;
    }

    const socketUrl = import.meta.env.DEV
      ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`
      : 'wss://campus-resell.onrender.com/ws';
    
    const client = new Client({
      brokerURL: socketUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log("WebSocket connected successfully");

        // Subscribe to user-specific private queue messages
        client.subscribe('/user/queue/messages', (message) => {
          const newMsg = JSON.parse(message.body);
          console.log("Received incoming message over WS:", newMsg);

          // If the message is not for the currently active chat page, show alert & increment unread
          if (activeChatId !== newMsg.chatId) {
            setUnreadNotifications(prev => prev + 1);
            
            // Show dynamic browser notification if permitted
            if (Notification.permission === "granted") {
              new Notification(`New message from ${newMsg.senderName}`, {
                body: newMsg.content,
              });
            }
          }

          // Feed into global messages hook so pages can dynamically capture it
          setGlobalMessages(prev => [...prev, newMsg]);
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      }
    });

    client.activate();
    stompClientRef.current = client;

    // Request notification permissions
    if (typeof window !== 'undefined' && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
    };
  }, [user, activeChatId]);

  // Auth Operations
  const sendOtp = async (email) => {
    await api.post('/api/auth/send-otp', { email });
  };

  const verifyOtp = async (email, otp) => {
    const res = await api.post('/api/auth/verify-otp', { email, otp });
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/api/auth/register', { name, collegeEmail: email, password });
    return res.data;
  };

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { collegeEmail: email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    // Fetch notifications
    fetchUnreadCount();
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setUnreadNotifications(0);
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
    }
  };

  const updateProfile = async (name, profilePic) => {
    const res = await api.put('/api/auth/me', { name, profilePic });
    setUser(res.data);
    return res.data;
  };

  const value = {
    user,
    loading,
    unreadNotifications,
    activeChatId,
    setActiveChatId,
    globalMessages,
    setGlobalMessages,
    stompClient: stompClientRef.current,
    fetchUnreadCount,
    setUnreadNotifications,
    sendOtp,
    verifyOtp,
    register,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
