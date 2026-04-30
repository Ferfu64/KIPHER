import React, { useState } from 'react';
import { UserProfile } from '../types';
import TheGrid from './TheGrid';
import DirectMessenger from './DirectMessenger';
import { MessageSquare, Users, Shield } from 'lucide-react';

export default function DirectMessageContainer({ currentUser }: { currentUser: UserProfile }) {
  const [selectedAsset, setSelectedAsset] = useState<UserProfile | null>(null);

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-950/20">
      {/* Sidebar: Asset List */}
      <div className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-slate-900 bg-black/40 shrink-0 ${selectedAsset ? 'hidden md:flex' : 'flex'}`}>
        <div className="h-16 border-b border-slate-900 flex items-center px-6 shrink-0">
          <MessageSquare size={16} className="text-tactical-cyan mr-3" />
          <h2 className="text-sm font-black text-white tracking-widest uppercase">Direct_Comms</h2>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
           <TheGrid currentUser={currentUser} compact onSelect={setSelectedAsset} />
        </div>
      </div>

      {/* Main: Chat Area */}
      <div className={`flex-1 flex flex-col min-w-0 ${!selectedAsset ? 'hidden md:flex' : 'flex'}`}>
        {selectedAsset ? (
          <DirectMessenger 
            currentUser={currentUser} 
            targetUser={selectedAsset} 
            onBack={() => setSelectedAsset(null)} 
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-slate-800 p-12 text-center">
             <div className="w-24 h-24 border border-slate-900 flex items-center justify-center opacity-20">
                <Shield size={64} />
             </div>
             <div>
               <h3 className="text-sm font-black uppercase tracking-[0.5em] mb-2">Initialize_Secure_Link</h3>
               <p className="text-[10px] font-bold uppercase tracking-widest max-w-xs">Select an asset from the directory to establish a point-to-point encrypted tunnel.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
