// src/components/conversations/page.jsx
"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import UserAvatar from "@/components/UserAvatar";

export default function Conversation({
  conversation,
  currentUser,
  setCurrentChat,
  currentChat,
  isUserOnline
}) {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const t = useTranslations();

  useEffect(() => {
    const getUserData = async () => {
      try {
        const otherMember = conversation.members.find(m =>
          typeof m === 'object'
            ? m.memberId !== currentUser?.userId
            : m !== currentUser?.userId
        );
        if (!otherMember) return;
        const memberId = typeof otherMember === 'object' ? otherMember.memberId : otherMember;
        const userType = typeof otherMember === 'object' ? otherMember.memberType : 'STUDENT';
        setUserId(memberId);
        const res = await fetch('/api/users/status?userId=' + encodeURIComponent(memberId) + '&userType=' + encodeURIComponent(userType));
        if (!res.ok) throw new Error(String(res.status));
        const resData = await res.json();
        if (resData) setUser(resData);
      } catch (err) {
        setUser({ username: t.messages?.unknownUser || 'Unknown' });
      }
    };
    if (conversation?.members && currentUser?.userId) getUserData();
  }, [conversation, currentUser]);

  const getDisplayName = () => {
    if (!user) return t.messages?.loading || 'Ladowanie...';
    if (user.username === 'admin') return t.messages?.administrator || 'Administrator';
    return user.name || user.username || t.messages?.unknownUser || 'Nieznany';
  };

  const online = isUserOnline && userId ? isUserOnline(userId) : (user?.isOnline || false);
  const isActive = currentChat?.id === conversation.id;

  return (
    <div
      className={'flex items-center gap-3 px-4 py-3 cursor-pointer rounded-lg mx-2 transition-colors ' + (isActive ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-50')}
      onClick={() => setCurrentChat({...conversation, userData: user})}
    >
      <div className="relative flex-shrink-0">
        {userId ? (
          <UserAvatar userId={userId} size={38} />
        ) : (
          <img className="w-[38px] h-[38px] rounded-full object-cover" src="/noAvatar.png" alt="avatar" />
        )}
        <div className={'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ' + (online ? 'bg-emerald-400' : 'bg-slate-300')} />
      </div>
      <div className="flex-1 min-w-0">
        <span className={'text-[13px] font-medium block truncate ' + (isActive ? 'text-indigo-700' : 'text-slate-700')}>
          {getDisplayName()}
        </span>
        <span className={'text-[11px] ' + (online ? 'text-emerald-500' : 'text-slate-400')}>
          {online ? (t.messages?.online || 'Online') : (t.messages?.offline || 'Offline')}
        </span>
      </div>
    </div>
  );
}
