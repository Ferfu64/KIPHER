import { db } from '../lib/firebase';
import { doc, setDoc, arrayUnion, getDoc, arrayRemove } from 'firebase/firestore';
import { UserProfile } from '../types';
import { handleFirestoreError, OperationType } from '../lib/utils';

export const titleService = {
  async awardTitle(userId: string, title: string) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        titles: arrayUnion(title)
      }, { merge: true });
      console.log(`Title awarded: ${title} to ${userId}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
    }
  },

  async removeTitle(userId: string, title: string) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        titles: arrayRemove(title)
      }, { merge: true });
      
      const snap = await getDoc(userRef);
      if (snap.exists() && snap.data().activeTitle === title) {
        await setDoc(userRef, { activeTitle: null }, { merge: true });
      }
      console.log(`Title revoked: ${title} from ${userId}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
    }
  },

  async setActiveTitle(userId: string, title: string | null) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        activeTitle: title
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
    }
  },

  async getAvailableTitles(userId: string): Promise<string[]> {
    try {
      const userRef = doc(db, 'users', userId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        return data.titles || [];
      }
      return [];
    } catch (error) {
       console.error("Error fetching titles:", error);
       return [];
    }
  }
};
