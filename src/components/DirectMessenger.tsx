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
import UnifiedChat from './UnifiedChat';

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
          if (data.users?.includes(targetUser.uid)) {
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

  const sendMessage = async (text: string, type: ChatMessage['type'] = 'TEXT', replyToId?: string) => {
    if (!text.trim() || !connection) return;

    try {
      await addDoc(collection(db, 'connections', connection.id, 'messages'), {
        senderId: currentUser.uid,
        senderAuthId: auth.currentUser?.uid,
        senderName: currentUser.displayName,
        text: text,
        timestamp: serverTimestamp(),
        type: type,
        replyToId: replyToId || null
      });

      await setDoc(doc(db, 'connections', connection.id), {
        lastMessage: text.startsWith('data:image') || text.startsWith('http') ? '[MEDIA]' : text,
        lastSenderName: currentUser.displayName,
        lastSenderAuthId: auth.currentUser?.uid,
        updatedAt: serverTimestamp()
      }, { merge: true });

      audioService.playSuccess();
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `connections/${connection.id}/messages`);
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

      <UnifiedChat 
        messages={messages}
        currentUser={currentUser}
        onSendMessage={sendMessage}
        placeholder="SECURE_TRANSMISSION..."
      />
    </div>
  );
}
