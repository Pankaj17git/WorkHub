'use client';

import React, { useContext, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Send,
  Briefcase,
  ShieldCheck,
} from 'lucide-react';
import MessagingContext, {
  MessagingProvider,
  useMessaging,
  type Conversation,
  type Message,
  type ConversationMember,
  type MessagingContextType,
} from '@/context/MessagingContext';

export type { Conversation, Message, ConversationMember, MessagingContextType };
export { MessagingProvider, useMessaging };

function MessagesView() {
  const {
    conversations,
    activeConvId,
    activeConv,
    messages,
    newMessage,
    loadingConvs,
    loadingMessages,
    sending,
    isOtherUserTyping,
    activeTypingText,
    session,
    setActiveConvId,
    handleInputChange,
    sendMessage,
    getPartner,
    getTypingText,
  } = useMessaging();

  const messagesEndRef = useRef<HTMLDivElement>(null);


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
                const typingInfo = getTypingText(conv);

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

                      {typingInfo ? (
                        <p className="text-[11px] text-[#0051d5] font-semibold truncate mt-0.5 flex items-center gap-1.5 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0051d5]" />
                          <span>{typingInfo}</span>
                        </p>
                      ) : (
                        <p className="text-[11px] text-[#64748b] truncate mt-0.5">
                          {conv.type === 'JOB_GROUP' ? 'Job Team Discussion' : 'Direct Conversation'}
                        </p>
                      )}
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
                    {isOtherUserTyping ? (
                      <div className="flex items-center gap-1.5 text-[11px] text-[#0051d5] font-semibold animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0051d5] animate-ping" />
                        <span>typing a message...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] text-[#0d9488] font-medium">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Verified User • Direct Chat</span>
                      </div>
                    )}
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
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 relative">
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

                {/* Real-Time Typing Indicator Bubble */}
                {isOtherUserTyping && (
                  <div className="flex items-end gap-2 text-left transition-opacity duration-200 absolute bottom-0">
                    <div className="w-7 h-7 rounded-lg bg-[#0051d5] text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
                      {getPartner(activeConv)[0] || 'U'}
                    </div>
                    <div className="bg-white border border-[#e2e8f0] px-3.5 py-2.5 rounded-2xl rounded-bl-none shadow-xs flex items-center gap-2">
                      <div className="flex items-center gap-1 py-1">
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-[#0051d5] animate-bounce"
                          style={{ animationDelay: '0ms' }}
                        />
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-[#0051d5] animate-bounce"
                          style={{ animationDelay: '150ms' }}
                        />
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-[#0051d5] animate-bounce"
                          style={{ animationDelay: '300ms' }}
                        />
                      </div>
                      <span className="text-[11px] text-[#64748b] font-medium">
                        {activeTypingText || 'Typing...'}
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <div className="p-4 bg-white border-t border-[#e2e8f0] shrink-0">
                <form onSubmit={sendMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type your message here..."
                    value={newMessage}
                    onChange={handleInputChange}
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

export default function MessagesContent() {
  const context = useContext(MessagingContext);

  if (context) {
    return <MessagesView />;
  }

  return (
    <MessagingProvider>
      <MessagesView />
    </MessagingProvider>
  );
}
