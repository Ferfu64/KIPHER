import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Image as ImageIcon, CornerDownLeft } from 'lucide-react';
import { ChatMessage } from '../types';
import ChatMessageComponent from './ChatMessageComponent';
import { audioService } from '../services/audioService';

interface UnifiedChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, type?: ChatMessage['type'], replyToId?: string) => void;
  onDeleteMessage?: (id: string) => void;
  currentUser: any;
  placeholder?: string;
  canDeleteAll?: boolean;
}

export default function UnifiedChat({ 
  messages, 
  onSendMessage, 
  onDeleteMessage, 
  currentUser,
  placeholder = 'RELAY_MESSAGE...',
  canDeleteAll = false
}: UnifiedChatProps) {
  const [text, setText] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [confirmImageUrl, setConfirmImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    // Detect if text is a potential image URL
    const imageRegex = /\.(jpeg|jpg|gif|png|webp)/i;
    const urlRegex = /https?:\/\/[^\s]+/i;
    
    if (urlRegex.test(text) && imageRegex.test(text)) {
      setConfirmImageUrl(text);
      return;
    }

    onSendMessage(text, 'TEXT', replyingTo?.id);
    setText('');
    setReplyingTo(null);
    audioService.playBlip();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    let imageDetected = false;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        imageDetected = true;
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 800;
              const MAX_HEIGHT = 800;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, width, height);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // Compress to 70% quality
              onSendMessage(dataUrl, 'MEDIA');
            };
            img.src = event.target?.result as string;
          };
          reader.readAsDataURL(file);
        }
      }
    }
    if (imageDetected) {
      e.preventDefault();
      audioService.playBlip();
    }
  };

  const handleConfirmImage = (asImage: boolean) => {
    if (asImage && confirmImageUrl) {
      onSendMessage(confirmImageUrl, 'MEDIA', replyingTo?.id);
    } else if (confirmImageUrl) {
      onSendMessage(confirmImageUrl, 'TEXT', replyingTo?.id);
    }
    setConfirmImageUrl(null);
    setText('');
    setReplyingTo(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('REQUISITION_DENIED: ONLY_IMAGE_DATA_ACCEPTED');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        onSendMessage(dataUrl, 'MEDIA', replyingTo?.id);
        setReplyingTo(null);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    audioService.playBlip();
    e.target.value = '';
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 relative font-mono overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg, i) => {
          const isMe = msg.senderId === currentUser.uid;
          const repliedTo = msg.replyToId ? messages.find(m => m.id === msg.replyToId) : undefined;
          
          return (
            <ChatMessageComponent 
              key={msg.id || i}
              msg={msg}
              isMe={isMe}
              repliedTo={repliedTo}
              canDelete={isMe || canDeleteAll}
              onDelete={onDeleteMessage || (() => {})}
              onReply={(m) => {
                 setReplyingTo(m);
                 inputRef.current?.focus();
                 audioService.playBlip();
              }}
            />
          );
        })}
      </div>

      {/* Confirmation Modal for URL to Image */}
      <AnimatePresence>
        {confirmImageUrl && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
             <div className="max-w-xs w-full bg-slate-900 border border-tactical-cyan/40 p-6 shadow-2xl">
                <div className="flex items-center gap-3 text-tactical-cyan mb-4">
                   <ImageIcon size={20} />
                   <div className="text-[10px] font-black uppercase tracking-widest">Image_URL_Detected</div>
                </div>
                <p className="text-[10px] text-slate-400 mb-6 uppercase italic">Would you like to convert this link into a direct synchronization image?</p>
                <div className="flex flex-col gap-2">
                   <button onClick={() => handleConfirmImage(true)} className="w-full py-2 bg-tactical-cyan text-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors">CONVERT_TO_IMAGE</button>
                   <button onClick={() => handleConfirmImage(false)} className="w-full py-2 border border-white/10 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-white">SEND_AS_LINK</button>
                   <button onClick={() => setConfirmImageUrl(null)} className="w-full py-1 text-[8px] text-slate-700 uppercase hover:text-red-500">ABORT_TRANSMISSION</button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Overlay */}
      <div className="p-4 bg-black/40 border-t border-slate-900/50">
        <AnimatePresence>
          {replyingTo && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mb-2 bg-slate-900/80 p-2 border border-tactical-cyan/20 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <CornerDownLeft size={14} className="text-tactical-cyan" />
                  <div className="text-[10px] text-slate-400">Replying to <span className="text-tactical-cyan">{replyingTo.senderName}</span>: {replyingTo.text.slice(0, 40)}...</div>
               </div>
               <button onClick={() => setReplyingTo(null)} className="text-slate-500 hover:text-white"><X size={14}/></button>
            </motion.div>
          )}
        </AnimatePresence>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input 
             type="file" 
             ref={fileInputRef} 
             onChange={handleFileChange} 
             accept="image/*" 
             className="hidden" 
          />
          <button 
             type="button" 
             onClick={() => fileInputRef.current?.click()}
             className="w-12 h-12 bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center hover:text-tactical-cyan transition-colors shrink-0"
             title="ATTACH_INTEL_PACKET"
          >
             <ImageIcon size={18} />
          </button>
          <input 
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onPaste={handlePaste}
            placeholder={placeholder}
            className="flex-1 kipher-input bg-slate-950/80 border-slate-800 text-sm h-12"
          />
          <button type="submit" className="w-12 h-12 bg-tactical-cyan text-black flex items-center justify-center hover:bg-white transition-colors">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
