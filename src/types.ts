export interface UserProfile {
  uid: string;
  displayName: string;
  password?: string;
  email?: string;
  role: 'AGENT' | 'SUPERUSER' | 'OWNER' | 'ASSET';
  isOwner: boolean;
  clearanceLevel: number;
  isBanned: boolean;
  status?: string;
  lastSeen: any;
  currentAuthUid?: string;
}

export interface Safehouse {
  id: string;
  name: string;
  hostId: string;
  hostAuthId?: string;
  passcode: string;
  createdAt: any;
  minClearance?: number;
}

export interface VaultItem {
  id: string;
  title: string;
  description: string;
  passcode: string;
  clearanceRequired: number;
  ownerId: string;
  files: VaultFile[];
  createdAt: any;
}

export interface VaultFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  timestamp: any;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderAuthId?: string;
  senderName: string;
  text: string;
  timestamp: string;
  type: 'TEXT' | 'SYSTEM' | 'ALERT';
}

export interface Connection {
  id: string;
  users: string[]; // [uid1, uid2]
  status: 'ESTABLISHED' | 'PENDING' | 'REDACTED';
}

export interface SystemCommand {
  type: 'ALERT' | 'MEDIA' | 'BLACKOUT' | 'REDIRECT' | 'SAFETY' | 'RESTORE';
  payload: string;
  targetUserId?: string;
  timestamp: any;
  active: boolean;
}
