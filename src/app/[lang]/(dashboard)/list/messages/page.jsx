"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { useUser } from "@/context/AuthContext";
import { useOnline } from "@/context/OnlineContext";
import UserAvatar from "@/components/UserAvatar";
import Conversation from "@/components/conversations/page";
import Message from "@/components/message/page";
import { Send, MessageSquare, Plus, X, Search } from "lucide-react";

export default function Messenger() {
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const { user } = useUser();
  const { isUserOnline, sendMessage } = useOnline();
  const scrollRef = useRef();
  const t = useTranslations();

  const fetchConversations = useCallback(async () => {
    if (!user?.userId) return;
    try {
      const res = await fetch('/api/conversations');
      if (!res.ok) throw new Error(String(res.status));
      const resData = await res.json();
      if (Array.isArray(resData)) {
        const seen = new Set();
        const unique = resData.filter(conv => {
          if (seen.has(conv.id)) return false;
          seen.add(conv.id);
          return true;
        });
        setConversations(unique.map(conv => ({
          ...conv,
          _id: conv.id?.toString(),
          members: Array.isArray(conv.members) ? conv.members : [user.userId, conv.userId]
        })));
      }
    } catch {
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    const getMessages = async () => {
      if (!currentChat?._id) return;
      try {
        const res = await fetch('/api/messages?conversationId=' + currentChat._id);
        if (!res.ok) throw new Error(String(res.status));
        setMessages(await res.json());
      } catch {
        setMessages([]);
      }
    };
    if (currentChat) getMessages();
  }, [currentChat]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch('/api/users/search?query=' + encodeURIComponent(searchQuery));
        if (res.ok) setSearchResults(await res.json());
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleStartConversation = async (receiver) => {
    if (!user?.userId) return;
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: receiver.id,
          userType: user.role,
          receiverType: receiver.role || 'USER'
        })
      });
      if (!res.ok) throw new Error('Failed');
      const conv = await res.json();
      const normalized = {
        ...conv,
        _id: conv.id?.toString(),
        members: Array.isArray(conv.members) ? conv.members : []
      };
      setConversations(prev => {
        const exists = prev.find(c => c._id === normalized._id);
        return exists ? prev : [normalized, ...prev];
      });
      setCurrentChat(normalized);
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      console.error('Start conversation error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChat?._id || !user?.userId) return;
    const text = newMessage.trim();
    setNewMessage('');
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, conversationId: currentChat._id })
      });
      if (!res.ok) {
        console.error('Send failed:', res.status, await res.text());
        return;
      }
      const newMsg = await res.json();
      setMessages(prev => [...(Array.isArray(prev) ? prev : []), newMsg]);
    } catch (err) {
      console.error('Send error:', err);
    }
  };

  const otherUser = currentChat?.userData;

  return (
    <div className="flex h-full">
      {/* Left panel */}
      <div className="w-72 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col">
        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-slate-800">{t.messages?.title || 'Wiadomosci'}</h2>
          <button
            onClick={() => { setShowSearch(s => !s); setSearchQuery(''); setSearchResults([]); }}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-colors"
            title="Nowa rozmowa"
          >
            {showSearch ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>

        {showSearch && (
          <div className="px-3 py-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Szukaj uzytkownika..."
                className="w-full pl-8 pr-3 py-2 text-[13px] border border-slate-200 rounded-lg outline-none focus:border-indigo-400 transition-colors"
              />
            </div>
            <div className="mt-1 max-h-48 overflow-y-auto">
              {searching && (
                <div className="flex justify-center py-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500" />
                </div>
              )}
              {!searching && searchResults.length === 0 && searchQuery.trim() && (
                <p className="text-center text-slate-400 text-xs py-3">Brak wynikow</p>
              )}
              {searchResults.map(u => (
                <button
                  key={u.id}
                  onClick={() => handleStartConversation(u)}
                  className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {(u.name || u.username || '?')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-slate-800 truncate">
                      {u.name ? u.name + (u.surname ? ' ' + u.surname : '') : u.username}
                    </p>
                    <p className="text-[11px] text-slate-400 capitalize">{(u.role || '').toLowerCase()}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-20">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500" />
            </div>
          ) : conversations.length > 0 ? (
            conversations.map((c) => (
              <Conversation
                key={c._id || c.id}
                conversation={c}
                currentUser={user}
                setCurrentChat={setCurrentChat}
                currentChat={currentChat}
                isUserOnline={isUserOnline}
              />
            ))
          ) : (
            <p className="text-center text-slate-400 text-sm py-8 px-4">
              {t.messages?.noConversations || 'Brak konwersacji'}
            </p>
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col bg-white">
        {currentChat ? (
          <>
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-3 flex-shrink-0">
              <UserAvatar
                userId={
                  typeof currentChat.members.find(m =>
                    typeof m === 'object' ? m.memberId !== user?.userId : m !== user?.userId
                  ) === 'object'
                    ? currentChat.members.find(m => m.memberId !== user?.userId)?.memberId
                    : currentChat.members.find(m => m !== user?.userId)
                }
                size={36}
              />
              <p className="text-[14px] font-semibold text-slate-800">
                {otherUser?.name
                  ? otherUser.name + (otherUser.surname ? ' ' + otherUser.surname : '')
                  : otherUser?.username || t.messages?.chat || 'Czat'}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-5 bg-slate-50">
              {Array.isArray(messages) && messages.length > 0 ? (
                messages.map((message, index) => (
                  <div
                    key={message._id || message.id || index}
                    ref={index === messages.length - 1 ? scrollRef : null}
                  >
                    <Message message={message} own={message.senderId === user?.userId} />
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-slate-400 italic">
                  {t.messages?.startConversation || 'Rozpocznij rozmowe...'}
                </div>
              )}
            </div>

            <div className="px-4 py-3 border-t border-slate-100 flex gap-3 items-end flex-shrink-0">
              <textarea
                className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-xl resize-none text-[13px] outline-none focus:border-indigo-400 transition-colors bg-white"
                placeholder={t.messages?.placeholder || 'Napisz wiadomosc...'}
                rows={2}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <button
                onClick={handleSubmit}
                disabled={!newMessage.trim()}
                className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
            <MessageSquare className="w-10 h-10 opacity-30" />
            <p className="text-sm">{t.messages?.searchToChat || 'Wybierz konwersacje, aby zaczac pisac'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
