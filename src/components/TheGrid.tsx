import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, where, orderBy, limit } from 'firebase/firestore';
import { UserProfile } from '../types';
import { motion } from 'framer-motion';
import { Users, ExternalLink } from 'lucide-react';
import { handleFirestoreError, OperationType, ensureDate } from '../lib/utils';

export default function TheGrid({ currentUser, compact, onSelect }: { currentUser: UserProfile, compact?: boolean, onSelect?: (asset: UserProfile) => void }) {
  const [assets, setAssets] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      where('isBanned', '==', false),
      orderBy('lastSeen', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: UserProfile[] = [];
      snapshot.forEach(doc => list.push(doc.data() as UserProfile));
      setAssets(list.filter(a => a.uid !== currentUser.uid));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'users', true));

    return unsubscribe;
  }, [currentUser.uid]);

  if (loading) return <div className="p-8 text-tactical-cyan animate-pulse">SCANNING_NETWORK...</div>;

  return (
    <div className={`space-y-px bg-slate-800 ${compact ? '' : 'p-4'}`}>
      {!compact && (
        <div className="flex items-center gap-3 mb-8 border-b border-slate-900 pb-4">
          <Users className="text-tactical-cyan" size={24} />
          <div>
            <h2 className="text-xl font-black tracking-tighter">ASSET_DIRECTORY</h2>
            <p className="text-[10px] text-slate-500 tracking-widest font-bold uppercase">Realtime Network Nodes</p>
          </div>
        </div>
      )}

      <div className={compact ? "flex flex-col bg-slate-800 space-y-px" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-800"}>
        {assets.map((asset) => (
          <AssetCard key={asset.uid} asset={asset} compact={compact} onClick={() => onSelect?.(asset)} />
        ))}
      </div>
    </div>
  );
}

interface AssetCardProps {
  asset: UserProfile;
  compact?: boolean;
  onClick?: () => void;
  key?: string;
}

function AssetCard({ asset, compact, onClick }: AssetCardProps) {
  const assetDate = ensureDate(asset.lastSeen);
  const isOnline = new Date().getTime() - assetDate.getTime() < 300000;

  return (
    <motion.div 
      whileHover={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}
      onClick={onClick}
      className={`bg-absolute-black group cursor-pointer border-l-2 transition-all ${isOnline ? 'border-tactical-cyan' : 'border-transparent'} ${compact ? 'p-3 flex items-center justify-between gap-4' : 'p-6'}`}
    >
      <div className={compact ? 'flex flex-col overflow-hidden' : 'flex items-start justify-between mb-4'}>
        <div className="overflow-hidden">
          <h3 className={`font-black tracking-tight truncate ${compact ? 'text-xs' : 'text-lg'} ${isOnline ? 'text-white' : 'text-slate-500'}`}>
            {asset.displayName}
          </h3>
          <p className="text-[8px] text-slate-500 tracking-widest font-bold uppercase truncate">
            {asset.role} // LVL_{asset.clearanceLevel}
          </p>
        </div>
        {!compact && (
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-tactical-cyan animate-pulse' : 'bg-slate-800'}`} />
        )}
      </div>

      {!compact && (
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-[10px] text-slate-600 font-bold uppercase">
            <span>Last Seen</span>
            <span>{assetDate.toLocaleTimeString()}</span>
          </div>
          <div className="h-1 bg-slate-900 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(asset.clearanceLevel / 5) * 100}%` }}
              className="h-full bg-tactical-cyan/40"
            />
          </div>
        </div>
      )}

      <button className={`uppercase font-black text-tactical-cyan transition-all group-hover:tracking-[0.2em] flex items-center gap-2 ${compact ? 'text-[8px] border border-slate-800 px-1 py-0.5 shrink-0' : 'text-[10px]'}`}>
        {compact ? 'LINK' : 'ESTABLISH_LINK'} <ExternalLink size={compact ? 8 : 12} />
      </button>
    </motion.div>
  );
}
