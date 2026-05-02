import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, addDoc, onSnapshot, serverTimestamp, orderBy, limit, doc, where, getDocs, setDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { UserProfile, ChatMessage, Connection } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, Shield, Trash2, X, AlertTriangle } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/utils';
import { audioService } from '../services/audioService';

import ChatUserDisplay from './ChatUserDisplay';

export default function DirectMessenger({ currentUser, targetUser, onBack }: { currentUser: UserProfile, targetUser: UserProfile | null, onBack?: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [connection, setConnection] = useState<Connection | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!targetUser) return;

    // Find or create connection
    const findConnection = async () => {
      if (!auth.currentUser) await signInAnonymously(auth);
      
      try {
        const q = query(
          collection(db, 'connections'),
          where('authIds', 'array-contains', auth.currentUser?.uid)
        );
        
        const snap = await getDocs(q);
        let found: Connection | null = null;
        snap.forEach(doc => {
          const data = doc.data();
          if (data.users.includes(targetUser.uid)) {
            found = { id: doc.id, ...data } as Connection;
          }
        });

        if (found) {
          setConnection(found);
        } else {
          // Create new connection
          const newConn = await addDoc(collection(db, 'connections'), {
            users: [currentUser.uid, targetUser.uid],
            authIds: [auth.currentUser?.uid, targetUser.currentAuthUid || 'REDACTED'],
            usernames: [currentUser.displayName, targetUser.displayName],
            status: 'LINKED',
            createdAt: serverTimestamp()
          });
          setConnection({ id: newConn.id, users: [currentUser.uid, targetUser.uid], status: 'LINKED' } as any);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, 'connections/find');
      }
    };

    findConnection();
  }, [targetUser, currentUser.uid]);

  useEffect(() => {
    if (!connection) return;

    const q = query(
      collection(db, 'connections', connection.id, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const list: ChatMessage[] = [];
      snap.forEach(doc => list.push({ id: doc.id, ...doc.data() } as ChatMessage));
      setMessages(list);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `connections/${connection.id}/messages`));

    return unsubscribe;
  }, [connection]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async (e?: React.FormEvent, textOverride?: string, typeOverride?: ChatMessage['type']) => {
    if (e) e.preventDefault();
    const textToSend = textOverride || newMessage;
    if (!textToSend.trim() || !connection) return;

    try {
      await addDoc(collection(db, 'connections', connection.id, 'messages'), {
        senderId: currentUser.uid,
        senderAuthId: auth.currentUser?.uid,
        senderName: currentUser.displayName,
        text: textToSend,
        timestamp: serverTimestamp(),
        type: typeOverride || 'TEXT'
      });

      // Update parent connection to trigger global listeners
      await setDoc(doc(db, 'connections', connection.id), {
        lastMessage: textToSend.startsWith('data:image') ? '[MEDIA]' : textToSend,
        lastSenderName: currentUser.displayName,
        lastSenderAuthId: auth.currentUser?.uid,
        updatedAt: serverTimestamp()
      }, { merge: true });

      if (!textOverride) setNewMessage('');
      audioService.playSuccess();
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `connections/${connection.id}/messages`);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target?.result as string;
            sendMessage(undefined, base64, 'MEDIA');
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  if (!targetUser) return (
    <div className="flex-1 flex items-center justify-center bg-slate-950/20">
      <div className="text-center space-y-4">
        <MessageSquare size={48} className="mx-auto text-slate-800" />
        <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Select_Asset_To_Link</div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-950/40">
      <div className="h-14 border-b border-slate-900 flex items-center justify-between px-6 bg-black/40">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="md:hidden p-2 text-slate-500 hover:text-white">
              <X size={16} />
            </button>
          )}
          <div className="w-8 h-8 bg-tactical-cyan/10 border border-tactical-cyan/20 flex items-center justify-center text-tactical-cyan">
             <Shield size={14} />
          </div>
          <div>
            <div className="text-[10px] font-black text-white uppercase tracking-widest">{targetUser.displayName}</div>
            <div className="text-[8px] text-slate-500 font-bold uppercase trekking-widest">Direct_Secure_Link // Status: LINKED</div>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {messages.map((msg, i) => {
          const isMe = msg.senderId === currentUser.uid;
          return (
            <div key={msg.id || i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className="mb-1 px-1">
                 <ChatUserDisplay uid={msg.senderId} defaultName={msg.senderName} isMe={isMe} />
              </div>
              <div className={`max-w-[80%] px-3 py-2 text-xs border ${
                isMe 
                  ? 'border-tactical-cyan bg-tactical-cyan/5 text-tactical-cyan' 
                  : 'border-slate-800 bg-slate-900/40 text-slate-300'
              }`}>
                {msg.type === 'MEDIA' ? (
                  <img src={msg.text} alt="ENCRYPTED_MEDIA" className="max-w-full rounded border border-white/10" referrerPolicy="no-referrer" />
                ) : (
                  msg.text
                )}
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t border-slate-900 bg-black/40 flex gap-2">
        <input 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onPaste={handlePaste}
          placeholder="SECURE_TRANSMISSION..."
          className="flex-1 kipher-input bg-slate-950 border-slate-800 py-3"
        />
        <button type="submit" className="px-6 bg-tactical-cyan text-black font-black uppercase tracking-widest hover:bg-white transition-all">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
