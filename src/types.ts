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
  titles?: string[];
  activeTitle?: string;
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
  type: 'TEXT' | 'SYSTEM' | 'ALERT' | 'MEDIA' | 'VAULT' | 'NODE';
}

export interface Connection {
  id: string;
  users: string[]; // [uid1, uid2]
  authIds?: string[];
  usernames?: string[];
  status: 'ESTABLISHED' | 'PENDING' | 'REDACTED' | 'LINKED';
  createdAt?: any;
}

export interface SystemCommand {
  type: 'ALERT' | 'MEDIA' | 'BLACKOUT' | 'REDIRECT' | 'SAFETY' | 'RESTORE' | 'SPAWN_CUTSCENE';
  payload: string;
  targetUserId?: string;
  timestamp: any;
  active: boolean;
}
