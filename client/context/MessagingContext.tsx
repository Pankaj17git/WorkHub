'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useSyncExternalStore,
  ReactNode,
  Suspense,
  useTransition,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getToken, getSessionSnapshot, subscribeToSession } from '@/lib/auth-client';
import api from '@/lib/api';
import { socket } from '@/lib/socketServer';

export interface ConversationMember {
  id: string;
  userId: string;
  user?: {
    name?: string;
    profileImage?: string;
    email?: string;
  };
}

export interface Conversation {
  id: string;
  type: string;
  jobId?: string | null;
  customerId?: string | null;
  workerId?: string | null;
  updatedAt: string;
  members: ConversationMember[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  message: string;
  createdAt: string;
  sender?: {
    name?: string;
    profileImage?: string;
  };
}

export interface TypingIndicatorUser {
  userName?: string;
}

export interface MessagingContextType {
  // State
  conversations: Conversation[];
  activeConvId: string | null;
  activeConv: Conversation | undefined;
  messages: Message[];
  newMessage: string;
  loadingConvs: boolean;
  loadingMessages: boolean;
  sending: boolean;
  typingMap: { [convId: string]: { [userId: string]: TypingIndicatorUser } };
  isOtherUserTyping: boolean;
  activePartner: string;
  activeTypingText: string | null;
  session: ReturnType<typeof getSessionSnapshot>;

  // Actions
  setActiveConvId: (id: string | null) => void;
  setNewMessage: (val: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | string) => void;
  sendMessage: (e?: React.FormEvent) => Promise<void>;
  stopTyping: () => void;
  loadConversations: () => Promise<void>;
  loadMessages: (convId?: string) => Promise<void>;
  getPartner: (conv: Conversation) => string;
  getTypingText: (conv?: Conversation | null) => string | null;
}

const MessagingContext = createContext<MessagingContextType | null>(null);

function SearchParamsReader({
  onParams,
}: {
  onParams: (convId: string | null, targetId: string | null) => void;
}) {
  const searchParams = useSearchParams();
  const convId = searchParams.get('conversationId');
  const targetId = searchParams.get('userId');

  useEffect(() => {
    onParams(convId, targetId);
  }, [convId, targetId, onParams]);

  return null;
}

export interface MessagingProviderProps {
  children: ReactNode;
  initialConvId?: string | null;
  initialTargetUserId?: string | null;
}

export function MessagingProvider({
  children,
  initialConvId: initialConvIdProp,
  initialTargetUserId: initialTargetUserIdProp,
}: MessagingProviderProps) {
  const router = useRouter();
  const session = useSyncExternalStore(subscribeToSession, getSessionSnapshot, () => null);

  const [activeConvId, setActiveConvId] = useState<string | null>(initialConvIdProp ?? null);
  const [targetUserId, setTargetUserId] = useState<string | null>(initialTargetUserIdProp ?? null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [pending, startTransition] = useTransition();

  // Map of conversationId -> { [userId: string]: { userName?: string } }
  const [typingMap, setTypingMap] = useState<{
    [convId: string]: { [userId: string]: TypingIndicatorUser };
  }>({});

  const typingTimeoutsRef = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const handleParams = useCallback((convId: string | null, targetId: string | null) => {
    if (convId) setActiveConvId(convId);
    if (targetId) setTargetUserId(targetId);
  }, []);

  // Helper to extract display partner in 1-on-1 chats
  const getPartner = useCallback(
    (conv: Conversation) => {
      const otherMember = conv.members?.find((m) => String(m.userId) !== String(session?.id));
      return otherMember?.user?.name || otherMember?.user?.email || 'Conversation Partner';
    },
    [session?.id]
  );

  // Helper to extract typing text
  const getTypingText = useCallback(
    (conv?: Conversation | null) => {
      if (!conv?.id) return null;
      const convTyping = typingMap[conv.id] ? Object.entries(typingMap[conv.id]) : [];
      if (convTyping.length === 0) return null;

      const [firstUid, firstInfo] = convTyping[0];
      const member = conv.members?.find((m) => String(m.userId) === String(firstUid));
      const name = member?.user?.name || firstInfo?.userName || member?.user?.email || 'Someone';

      if (convTyping.length === 1) {
        return `${name} is typing...`;
      }
      return `${name} and ${convTyping.length - 1} other${convTyping.length > 2 ? 's' : ''} are typing...`;
    },
    [typingMap]
  );

  // Load conversations list
  const loadConversations = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.push('/login?redirect=/messages');
      return;
    }
    try {
      if (targetUserId) {
        try {
          const initRes = await api.post('/api/conversations', { targetUserId });
          const initData = initRes.data;
          const cId = initData.conversationId || initData.data?.conversationId;
          if (cId){
            startTransition(() => {
              setActiveConvId(cId);
            });
          }
        } catch (postErr) {
          console.error('Failed to initiate conversation with target user:', postErr);
        }
      }

      const res = await api.get('/api/conversations');
      const data = res.data;
      const convList: Conversation[] = data.conversations || data.data?.conversations || [];
      startTransition(() => {
        setConversations(convList);
        setActiveConvId((prev) => (prev ? prev : convList.length > 0 ? convList[0].id : null));
      })
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoadingConvs(false);
    }
  }, [targetUserId, router]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Initialize socket connection
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    if (!socket.connected) {
      socket.auth = { token };
      socket.connect();
    }
  }, []);

  // Join/leave active conversation room
  useEffect(() => {
    if (!activeConvId) return;
    socket.emit('conversation:join', activeConvId);

    return () => {
      socket.emit('conversation:leave', activeConvId);
    };
  }, [activeConvId]);

  // Real-time socket message & typing listeners
  useEffect(() => {
    const handleNewMessage = (msg: Message) => {
      if (msg.conversationId === activeConvId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });

        // Clear typing indicator for this sender in active conversation
        const timerKey = `${msg.conversationId}:${msg.senderId}`;
        if (typingTimeoutsRef.current[timerKey]) {
          clearTimeout(typingTimeoutsRef.current[timerKey]);
          delete typingTimeoutsRef.current[timerKey];
        }
        setTypingMap((prev) => {
          if (!prev[msg.conversationId]?.[String(msg.senderId)]) return prev;
          const convTyping = { ...(prev[msg.conversationId] || {}) };
          delete convTyping[String(msg.senderId)];
          return { ...prev, [msg.conversationId]: convTyping };
        });
      }

      // Update conversation list preview & timestamp without extra GET
      setConversations((prev) =>
        prev
          .map((c) =>
            c.id === msg.conversationId ? { ...c, updatedAt: msg.createdAt } : c
          )
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      );
    };

    const handleConvUpdated = (data: { conversationId: string; lastMessage: string; updatedAt: string }) => {
      setConversations((prev) =>
        prev
          .map((c) =>
            c.id === data.conversationId ? { ...c, updatedAt: data.updatedAt } : c
          )
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      );
    };

    const handleSocketError = (err: { error?: string; message?: string }) => {
      console.error('[Socket Error]', err?.error || err?.message);
      setSending(false);
    };

    const handleTypingUpdate = (data: {
      conversationId?: string;
      userId?: string;
      userName?: string;
      typing: boolean;
    }) => {
      const convId = data.conversationId ? String(data.conversationId) : activeConvId;
      const uid = data.userId ? String(data.userId) : null;
      if (!convId || !uid) return;
      if (session?.id && uid === String(session?.id)) return;

      const timerKey = `${convId}:${uid}`;
      if (typingTimeoutsRef.current[timerKey]) {
        clearTimeout(typingTimeoutsRef.current[timerKey]);
        delete typingTimeoutsRef.current[timerKey];
      }

      setTypingMap((prev) => {
        const convTyping = { ...(prev[convId] || {}) };
        if (data.typing) {
          convTyping[uid] = { userName: data.userName };
          // Safety timeout to auto-clear after 4s
          typingTimeoutsRef.current[timerKey] = setTimeout(() => {
            setTypingMap((p) => {
              const currentConv = { ...(p[convId] || {}) };
              delete currentConv[uid];
              return { ...p, [convId]: currentConv };
            });
          }, 4000);
        } else {
          delete convTyping[uid];
        }
        return { ...prev, [convId]: convTyping };
      });
    };

    socket.on('message:new', handleNewMessage);
    socket.on('conversation:updated', handleConvUpdated);
    socket.on('message:error', handleSocketError);
    socket.on('typing:update', handleTypingUpdate);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('conversation:updated', handleConvUpdated);
      socket.off('message:error', handleSocketError);
      socket.off('typing:update', handleTypingUpdate);
    };
  }, [activeConvId, session?.id]);

  // Load messages for a conversation
  const loadMessages = useCallback(
    async (convId?: string) => {
      const idToFetch = convId || activeConvId;
      if (!idToFetch) return;
      const token = getToken();
      if (!token) return;

      startTransition(() => setLoadingMessages(true));
      try {
        const res = await api.get(`/api/conversations/${idToFetch}/messages`);
        const data = res.data;
        startTransition(() => {
          setMessages(data.messages || data.data?.messages || []);
        });
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    },
    [activeConvId]
  );

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Helper to stop typing and clean timers
  const stopTyping = useCallback(() => {
    if (isTypingRef.current && activeConvId) {
      socket.emit('typing:stop', {
        conversationId: activeConvId,
        userId: session?.id,
      });
      isTypingRef.current = false;
    }
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
  }, [activeConvId, session?.id]);

  // Handle keystrokes with debounced typing detection
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | string) => {
    const val = typeof e === 'string' ? e : e.target.value;
    setNewMessage(val);

    if (!activeConvId) return;

    if (val.trim().length > 0) {
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        socket.emit('typing:start', {
          conversationId: activeConvId,
          userId: session?.id,
          userName: session?.name || session?.email,
        });
      }

      // Reset auto-stop inactivity timer (stops 2.5s after keystroke)
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      typingTimerRef.current = setTimeout(() => {
        stopTyping();
      }, 2500);
    } else {
      stopTyping();
    }
  };

  // Reset typing state and input when switching conversations
  useEffect(() => {
    stopTyping();
    startTransition(() => {
      setNewMessage('');
    });
  }, [activeConvId, stopTyping]);

  // Send message through socket
  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !activeConvId) return;

    const token = getToken();
    if (!token) return;

    const outgoingText = newMessage.trim();
    setSending(true);
    setNewMessage('');
    stopTyping();

    socket.emit('message:send', {
      conversationId: activeConvId,
      message: outgoingText,
      token,
    });

    setTimeout(() => {
      setSending(false);
    }, 300);
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const activeTypingEntries =
    activeConvId && typingMap[activeConvId] ? Object.entries(typingMap[activeConvId]) : [];
  const isOtherUserTyping = activeTypingEntries.length > 0;
  const activePartner = activeConv ? getPartner(activeConv) : '';
  const activeTypingText = activeConv ? getTypingText(activeConv) : null;

  const value: MessagingContextType = {
    conversations,
    activeConvId,
    activeConv,
    messages,
    newMessage,
    loadingConvs,
    loadingMessages,
    sending,
    typingMap,
    isOtherUserTyping,
    activePartner,
    activeTypingText,
    session,
    setActiveConvId,
    setNewMessage,
    handleInputChange,
    sendMessage,
    stopTyping,
    loadConversations,
    loadMessages,
    getPartner,
    getTypingText,
  };

  return (
    <MessagingContext.Provider value={value}>
      <Suspense fallback={null}>
        <SearchParamsReader onParams={handleParams} />
      </Suspense>
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessaging(): MessagingContextType {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
}

// Aliases for convenience
export const useMessage = useMessaging;
export const MessageProvider = MessagingProvider;
export default MessagingContext;
