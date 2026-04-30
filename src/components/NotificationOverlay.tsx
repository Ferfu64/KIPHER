import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy, limit, where } from 'firebase/firestore';
import { ChatMessage, UserProfile } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Bell, X, Shield, Users } from 'lucide-react';
import { audioService } from '../services/audioService';
import { handleFirestoreError, OperationType, ensureDate } from '../lib/utils';

interface Notification {
  id: string;
  source: 'MEETING' | 'SAFEHOUSE' | 'COMM';
  text: string;
  senderName: string;
  targetId?: string; // e.g. safehouseId or connectionId
}

export default function NotificationOverlay({ currentUser, onNavigate }: { currentUser: UserProfile, onNavigate: (page: string, targetId?: string) => void }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const lastSeenTimes = React.useRef<Record<string, number>>({});

  useEffect(() => {
    if (!auth.currentUser) return;

    // 1. Listen to Meeting Hub
    const hubQ = query(collection(db, 'meeting_room_chat'), orderBy('timestamp', 'desc'), limit(1));
    const hubUnsub = onSnapshot(hubQ, (snap) => {
      snap.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data() as ChatMessage;
          if (data.senderId !== currentUser.uid && data.timestamp) {
            // Only notify if newer than our mount time
            const ts = ensureDate(data.timestamp).getTime();
            if (!lastSeenTimes.current['HUB'] || ts > lastSeenTimes.current['HUB']) {
              if (lastSeenTimes.current['HUB']) {
                 triggerNotification({
                  id: change.doc.id,
                  source: 'MEETING',
                  text: data.text.length > 50 ? data.text.slice(0, 50) + '...' : data.text,
                  senderName: data.senderName
                });
              }
              lastSeenTimes.current['HUB'] = ts;
            }
          }
        }
      });
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'meeting_room_chat'));

    // 2. Listen to Connections (Direct Messages)
    const dmQ = query(collection(db, 'connections'), where('authIds', 'array-contains', auth.currentUser?.uid));
    const dmUnsub = onSnapshot(dmQ, (snap) => {
      snap.docChanges().forEach((change) => {
        if (change.type === 'modified' || change.type === 'added') {
          const data = change.doc.data();
          if (data.lastSenderAuthId && data.lastSenderAuthId !== auth.currentUser?.uid) {
            const ts = ensureDate(data.updatedAt).getTime();
            if (ts && (!lastSeenTimes.current[change.doc.id] || ts > lastSeenTimes.current[change.doc.id])) {
              if (lastSeenTimes.current[change.doc.id]) {
                triggerNotification({
                  id: change.doc.id + ts,
                  source: 'COMM',
                  text: data.lastMessage,
                  senderName: data.lastSenderName,
                  targetId: change.doc.id
                });
              }
              lastSeenTimes.current[change.doc.id] = ts;
            }
          }
        }
      });
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'connections'));

    // 3. Listen to Safehouses
    const safehouseQ = query(collection(db, 'safehouses'), orderBy('lastMessageAt', 'desc'), limit(5));
    const safehouseUnsub = onSnapshot(safehouseQ, (snap) => {
      snap.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          const data = change.doc.data();
          if (data.lastSenderAuthId && data.lastSenderAuthId !== auth.currentUser?.uid) {
            const ts = ensureDate(data.lastMessageAt).getTime();
            if (ts && (!lastSeenTimes.current[change.doc.id] || ts > lastSeenTimes.current[change.doc.id])) {
               if (lastSeenTimes.current[change.doc.id]) {
                 triggerNotification({
                  id: change.doc.id + ts,
                  source: 'SAFEHOUSE',
                  text: `NODE_${change.doc.id.slice(0,4)}: ${data.lastMessage}`,
                  senderName: data.lastSenderName,
                  targetId: change.doc.id
                });
               }
               lastSeenTimes.current[change.doc.id] = ts;
            }
          }
        }
      });
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'safehouses'));

    return () => {
      hubUnsub();
      dmUnsub();
      safehouseUnsub();
    };
  }, [currentUser.uid]);

  const triggerNotification = (notif: Notification) => {
    setNotifications(prev => [...prev, notif]);
    audioService.playNotification();
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notif.id));
    }, 5000);
  };

  const handleClick = (notif: Notification) => {
    if (notif.source === 'MEETING') onNavigate('MEETING');
    if (notif.source === 'SAFEHOUSE') onNavigate('GATEWAY', notif.targetId);
    if (notif.source === 'COMM') onNavigate('COMM');
    setNotifications(prev => prev.filter(n => n.id !== notif.id));
  };

  return (
    <div className="fixed top-20 right-6 z-[300] space-y-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className="w-72 bg-slate-950/90 border border-tactical-cyan/40 p-4 shadow-[0_0_30px_rgba(34,211,238,0.2)] pointer-events-auto cursor-pointer group hover:border-tactical-cyan transition-all"
            onClick={() => handleClick(notif)}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 w-8 h-8 rounded bg-tactical-cyan/10 flex items-center justify-center text-tactical-cyan shrink-0">
                {notif.source === 'MEETING' ? <Users size={16} /> : <MessageSquare size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[9px] font-black text-tactical-cyan uppercase tracking-widest mb-1 flex justify-between items-center">
                  <span>{notif.source}_SIGNAL_INCOMING</span>
                  <Bell size={10} className="animate-pulse" />
                </div>
                <div className="text-[10px] font-bold text-white mb-1 uppercase">{notif.senderName}</div>
                <div className="text-[10px] text-slate-400 line-clamp-2 italic">
                   {notif.text.startsWith('data:image') ? '[ENCRYPTED_MEDIA_TRANSMISSION]' : notif.text}
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setNotifications(prev => prev.filter(n => n.id !== notif.id)); }}
                className="text-slate-700 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>
            <div className="mt-3 h-0.5 bg-slate-900 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: '100%' }} 
                 animate={{ width: '0%' }} 
                 transition={{ duration: 5, ease: 'linear' }}
                 className="h-full bg-tactical-cyan"
               />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
