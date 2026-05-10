import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Reply, Trash2, ExternalLink, Image as ImageIcon, CornerDownRight, X, Maximize2 } from 'lucide-react';
import { ChatMessage } from '../types';
import ChatUserDisplay from './ChatUserDisplay';
import { audioService } from '../services/audioService';

interface Props {
  msg: ChatMessage;
  isMe: boolean;
  canDelete: boolean;
  onDelete: (id: string) => void;
  onReply: (msg: ChatMessage) => void;
  repliedTo?: ChatMessage;
}

export default function ChatMessageComponent({ msg, isMe, canDelete, onDelete, onReply, repliedTo }: Props) {
  const [showActions, setShowActions] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  const copyText = () => {
    navigator.clipboard.writeText(msg.text);
    audioService.playSuccess();
  };

  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-tactical-cyan underline hover:text-white transition-colors flex inline-flex items-center gap-1"
          >
            {part} <ExternalLink size={10} />
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div 
      className={`flex flex-col group relative ${isMe ? 'items-end' : 'items-start'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Replied context */}
      {repliedTo && (
        <div className={`flex items-center gap-2 mb-1 px-2 opacity-50 ${isMe ? 'flex-row-reverse' : ''}`}>
           <CornerDownRight size={12} className="text-slate-600" />
           <div className="text-[10px] text-slate-500 italic bg-slate-900 px-2 py-0.5 rounded truncate max-w-[200px]">
             Replying to {repliedTo.senderName}: {repliedTo.text.slice(0, 30)}...
           </div>
        </div>
      )}

      <div className={`flex items-center gap-2 mb-1 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
        <ChatUserDisplay uid={msg.senderId} defaultName={msg.senderName} isMe={isMe} />
        <span className="text-[8px] text-slate-700">
           {msg.timestamp ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString() : '...'}
        </span>
      </div>

      <div className="relative group/content max-w-[85%]">
        <div className={`px-3 py-2 text-xs border ${
          isMe 
            ? 'border-tactical-cyan bg-tactical-cyan/5 text-tactical-cyan shadow-[0_0_15px_rgba(34,211,238,0.05)]' 
            : 'border-slate-800 bg-slate-900/60 text-slate-300'
        } ${msg.type === 'MEDIA' ? 'p-1' : ''}`}>
          {msg.type === 'MEDIA' ? (
             <div className="relative group/media overflow-hidden">
                <img 
                  src={msg.text} 
                  alt="ENCRYPTED_MEDIA" 
                  className="max-w-full block hover:scale-[1.02] transition-transform cursor-pointer" 
                  referrerPolicy="no-referrer" 
                  onClick={() => setShowLightbox(true)}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                   <Maximize2 size={24} className="text-white drop-shadow-2xl" />
                </div>
             </div>
          ) : (
             <div className="whitespace-pre-wrap break-words">{renderTextWithLinks(msg.text)}</div>
          )}
        </div>

        <AnimatePresence>
          {showLightbox && msg.type === 'MEDIA' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
              onClick={() => setShowLightbox(false)}
            >
              <button 
                className="absolute top-6 right-6 text-slate-500 hover:text-white p-2 bg-white/5 rounded-full transition-colors z-[10000]"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLightbox(false);
                }}
              >
                <X size={32} />
              </button>
              
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="max-w-7xl max-h-[90vh] relative"
                onClick={(e) => e.stopPropagation()}
              >
                <img 
                  src={msg.text} 
                  alt="ENCRYPTED_INTEL_PACKET" 
                  className="max-w-full max-h-[90vh] object-contain border border-tactical-cyan/40 shadow-[0_0_50px_rgba(34,211,238,0.2)]" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-[-40px] left-0 right-0 flex justify-between items-center text-[10px] font-black tracking-widest text-tactical-cyan uppercase">
                   <span>Intel_Source: {msg.senderName}</span>
                   <span className="text-slate-500">Node_Synched_{msg.id.slice(0,8)}</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Actions */}
        <div className={`absolute top-0 flex gap-1 transform -translate-y-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 ${isMe ? 'right-0' : 'left-0'}`}>
          <button onClick={copyText} className="p-1.5 bg-slate-900 border border-white/10 text-slate-500 hover:text-white hover:bg-slate-800" title="COPY_TEXT">
            <Copy size={12} />
          </button>
          <button onClick={() => onReply(msg)} className="p-1.5 bg-slate-900 border border-white/10 text-slate-500 hover:text-white hover:bg-slate-800" title="REPLY">
            <Reply size={12} />
          </button>
          {canDelete && msg.id && (
             <button onClick={() => onDelete(msg.id!)} className="p-1.5 bg-slate-900 border border-white/10 text-slate-500 hover:text-red-500 hover:bg-red-500/10" title="PURGE">
               <Trash2 size={12} />
             </button>
          )}
        </div>
      </div>
    </div>
  );
}
