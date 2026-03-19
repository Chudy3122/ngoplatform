// src/components/message/page.jsx
"use client";
import { format } from "timeago.js";
import UserAvatar from "@/components/UserAvatar";

export default function Message({ message, own }) {
  if (!message) return null;
  const content = message.content || message.text || '';
  const createdAt = message.createdAt ? format(message.createdAt) : 'just now';

  return (
    <div className={'flex items-end gap-2 mt-3 ' + (own ? 'flex-row-reverse' : '')}>
      {!own && (
        <div className="flex-shrink-0">
          <UserAvatar userId={message.senderId} size={28} />
        </div>
      )}
      <div className={'max-w-[60%] flex flex-col ' + (own ? 'items-end' : 'items-start')}>
        <div className={'px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ' + (own ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm')}>
          {content}
          {own && message.status && (
            <span className="ml-1.5 text-[11px] opacity-70">
              {message.status === 'READ' ? '✓✓' : message.status === 'DELIVERED' ? '✓✓' : '✓'}
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-400 mt-1 px-1">{createdAt}</span>
      </div>
      {own && (
        <div className="flex-shrink-0">
          <UserAvatar userId={message.senderId} size={28} />
        </div>
      )}
    </div>
  );
}
