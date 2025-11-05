import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseClient';
import type { Profile } from '../types';
import type { User } from 'firebase/auth';
import { useNotification } from '../contexts/ErrorContext';

export const useProfile = (user: User | null) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const { showNotification } = useNotification();

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    try {
      const profileRef = doc(db, 'profiles', user.uid);
      const profileSnap = await getDoc(profileRef);

      if (profileSnap.exists()) {
        setProfile(profileSnap.data() as Profile);
      } else {
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 14);
        const newProfile: Profile = {
          id: user.uid,
          updated_at: new Date().toISOString(),
          full_name: user.displayName || '',
          avatar_url: user.photoURL || '',
          is_subscribed: false,
          trial_ends_at: trialEndDate.toISOString(),
        };
        await setDoc(profileRef, newProfile);
        setProfile(newProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      showNotification('Error al cargar el perfil', 'error');
    }
  }, [user, showNotification]);

  const updateSubscription = useCallback(async () => {
    if (!user) return;

    try {
      await updateDoc(doc(db, 'profiles', user.uid), {
        is_subscribed: true,
        updated_at: new Date().toISOString()
      });
      await fetchProfile();
      showNotification('¡Suscripción activada exitosamente!', 'success');
    } catch (error) {
      console.error('Error updating subscription:', error);
      showNotification('Error al actualizar la suscripción', 'error');
      throw error;
    }
  }, [user, fetchProfile, showNotification]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const isProActive = profile
    ? profile.is_subscribed || (profile.trial_ends_at && new Date(profile.trial_ends_at) > new Date())
    : false;

  return { profile, isProActive, updateSubscription, refetchProfile: fetchProfile };
};
