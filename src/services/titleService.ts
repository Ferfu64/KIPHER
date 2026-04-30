import { db } from '../lib/firebase';
import { doc, updateDoc, arrayUnion, getDoc, arrayRemove } from 'firebase/firestore';
import { UserProfile } from '../types';
import { handleFirestoreError, OperationType } from '../lib/utils';

export const titleService = {
  async awardTitle(userId: string, title: string) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        titles: arrayUnion(title)
      });
      console.log(`Title awarded: ${title} to ${userId}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  },

  async removeTitle(userId: string, title: string) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        titles: arrayRemove(title)
      });
      // If the removed title was the active one, clear it
      const snap = await getDoc(userRef);
      if (snap.exists() && snap.data().activeTitle === title) {
        await updateDoc(userRef, { activeTitle: null });
      }
      console.log(`Title revoked: ${title} from ${userId}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  },

  async setActiveTitle(userId: string, title: string | null) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        activeTitle: title
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
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
