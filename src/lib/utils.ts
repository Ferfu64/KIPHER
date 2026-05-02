import { auth } from './firebase';
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, silent: boolean = false) {
  // Use a safer error conversion that avoids circular references
  const getErrorMessage = (err: any): string => {
    try {
      if (err instanceof Error) return err.message;
      if (typeof err === 'string') return err;
      return String(err);
    } catch (e) {
      return 'UNIDENTIFIED_ERROR_STRUCTURE';
    }
  };

  const errInfo: FirestoreErrorInfo = {
    error: getErrorMessage(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  
  let errorMessage: string;
  try {
    errorMessage = JSON.stringify(errInfo);
  } catch (jsonErr) {
    console.error('CRITICAL_SERIALIZATION_FAILURE', jsonErr);
    errorMessage = `{"error": "SERIALIZATION_FAILED", "originalError": "${getErrorMessage(error)}"}`;
  }

  console.error('Firestore Error Details:', errorMessage);
  
  if (silent) return;

  const finalError = new Error(errorMessage);
  throw finalError;
}

/**
 * Safely converts Firestore Timestamp or string to a Date object
 */
export function ensureDate(dateValue: any): Date {
  if (!dateValue) return new Date();
  if (dateValue instanceof Date) return dateValue;
  
  // Handle Firestore Timestamp or objects with toDate()
  if (dateValue && typeof dateValue.toDate === 'function') {
    return dateValue.toDate();
  }
  
  // Handle plain objects that look like Timestamps (seconds/nanoseconds)
  if (dateValue && typeof dateValue.seconds === 'number') {
    return new Date(dateValue.seconds * 1000 + (dateValue.nanoseconds || 0) / 1000000);
  }
  
  // Try parsing as string or number
  const d = new Date(dateValue);
  return isNaN(d.getTime()) ? new Date() : d;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
