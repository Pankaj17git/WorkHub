'use client';

import React, { useState, useEffect, useRef, useSyncExternalStore, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MessageSquare,
  Send,
  User,
  Search,
  ArrowLeft,
  Briefcase,
  ShieldCheck,
  CheckCheck,
  Clock,
  Sparkles
} from 'lucide-react';
import { getToken, getSessionSnapshot, subscribeToSession } from '@/lib/auth-client';

interface ConversationMember {
  id: string;
  userId: string;
  user?: {
    name?: string;
    profileImage?: string;
    email?: string;
  };
}

interface Conversation {
  id: string;
  type: string;
  jobId?: string | null;
  customerId?: string | null;
  workerId?: string | null;
  updatedAt: string;
  members: ConversationMember[];
}

interface Message {
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

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialConvId = searchParams.get('conversationId');
  const targetUserId = searchParams.get('userId');

  const session = useSyncExternalStore(subscribeToSession, getSessionSnapshot, () => null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(initialConvId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load user conversations
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login?redirect=/messages');
      return;
    }

    async function loadConversations() {
      setLoadingConvs(true);
      try {
        // If targetUserId query is provided, create or get conversation first
        if (targetUserId) {
          const initRes = await fetch('/api/conversations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ targetUserId }),
          });
          if (initRes.ok) {
            const initData = await initRes.json();
            const cId = initData.conversationId || initData.data?.conversationId;
            if (cId) setActiveConvId(cId);
          }
        }

        const res = await fetch('/api/conversations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const convList: Conversation[] = data.conversations || data.data?.conversations || [];
          setConversations(convList);
          if (!activeConvId && convList.length > 0) {
            setActiveConvId(convList[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
      } finally {
        setLoadingConvs(false);
      }
    }

    loadConversations();
  }, [targetUserId, router]);

  // Load messages whenever active conversation changes
  useEffect(() => {
    if (!activeConvId) return;
    const token = getToken();
    if (!token) return;

    let isMounted = true;

    async function loadMessages() {
      setLoadingMessages(true);
      try {
        const res = await fetch(`/api/conversations/${activeConvId}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok && isMounted) {
          const data = await res.json();
          setMessages(data.messages || data.data?.messages || []);
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      } finally {
        if (isMounted) setLoadingMessages(false);
      }
    }

    loadMessages();

    // Poll for new messages every 5 seconds
    const interval = setInterval(loadMessages, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeConvId]);

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConvId) return;

    const token = getToken();
    if (!token) return;

    const outgoingText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const res = await fetch(`/api/conversations/${activeConvId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: outgoingText }),
      });

      if (res.ok) {
        const data = await res.json();
        const sentMsg = data.message || data.data?.message;
        if (sentMsg) {
          setMessages((prev) => [...prev, sentMsg]);
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);

  // Helper to extract display partner in 1-on-1 chats
  const getPartner = (conv: Conversation) => {
    const otherMember = conv.members?.find((m) => m.userId !== session?.id);
    return otherMember?.user?.name || otherMember?.user?.email || 'Conversation Partner';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-6rem)]">
      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl shadow-sm h-full overflow-hidden flex flex-col md:flex-row">
        {/* Left Column: Conversations List */}
        <div className="w-full md:w-80 border-r border-[#e2e8f0] flex flex-col shrink-0 bg-[#ffffff]">
          {/* Header */}
          <div className="p-4 border-b border-[#e2e8f0] space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#091426] flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#0051d5]" />
                <span>Messages</span>
              </h2>
              <span className="text-[10px] font-bold font-geist px-2 py-0.5 rounded-full bg-[#eff6ff] text-[#0051d5] border border-[#bfdbfe]">
                Live Chat
              </span>
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#f1f5f9]">
            {loadingConvs ? (
              <div className="p-6 text-center text-xs text-[#64748b]">Loading chats...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <MessageSquare className="w-8 h-8 text-[#94a3b8] mx-auto" />
                <h4 className="text-xs font-bold text-[#091426]">No active chats</h4>
                <p className="text-[11px] text-[#64748b]">
                  Initiate chat from a specialist profile or job details page.
                </p>
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = conv.id === activeConvId;
                const partnerName = getPartner(conv);

                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`w-full text-left p-4 transition-colors flex items-start gap-3 ${
                      isActive ? 'bg-[#eff6ff]/60 border-l-4 border-l-[#0051d5]' : 'hover:bg-[#f8f9ff]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#091426] text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-xs">
                      {partnerName[0] || 'U'}
                    </div>

                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-[#091426] truncate">
                          {partnerName}
                        </h4>
                        <span className="text-[10px] text-[#94a3b8] font-geist shrink-0">
                          {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#64748b] truncate mt-0.5">
                        {conv.type === 'JOB_GROUP' ? 'Job Team Discussion' : 'Direct Conversation'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Room Stream */}
        <div className="flex-1 flex flex-col h-full bg-[#f8f9ff]/40">
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white border-b border-[#e2e8f0] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0051d5] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    {getPartner(activeConv)[0] || 'U'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#091426]">
                      {getPartner(activeConv)}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-[#0d9488] font-medium">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified User • Direct Chat</span>
                    </div>
                  </div>
                </div>

                {activeConv.jobId && (
                  <Link
                    href={`/jobs/${activeConv.jobId}`}
                    className="px-3 py-1.5 rounded-lg bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#091426] text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-[#0051d5]" />
                    <span>View Related Job</span>
                  </Link>
                )}
              </div>

              {/* Messages Stream */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {loadingMessages && messages.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#64748b]">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="p-12 text-center text-xs text-[#64748b] space-y-1">
                    <p className="font-semibold text-[#091426]">No messages in this chat yet</p>
                    <p>Send a message below to begin coordinating service details.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === session?.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] sm:max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-xs ${
                            isMe
                              ? 'bg-[#0051d5] text-white rounded-br-none'
                              : 'bg-white border border-[#e2e8f0] text-[#091426] rounded-bl-none'
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                        </div>
                        <span className="text-[10px] text-[#94a3b8] font-geist mt-1 px-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <div className="p-4 bg-white border-t border-[#e2e8f0] shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type your message here..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] text-[#091426]"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="px-4 py-2.5 rounded-xl bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#eff6ff] text-[#0051d5] flex items-center justify-center shadow-xs">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#091426]">Select a conversation</h3>
              <p className="text-xs text-[#64748b] max-w-sm">
                Choose a dialogue from the left column to read messages and reply in real time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading Messenger...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
