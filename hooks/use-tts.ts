import { Audio } from 'expo-av';
import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

const BACKEND_URL = process.env.EXPO_PUBLIC_ML_BACKEND_URL ?? 'http://localhost:8000';

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return {};
  return { Authorization: `Bearer ${session.access_token}` };
}

export function useTts() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const stop = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
      } catch {
        // "Seeking interrupted" is thrown when stop is called during load/seek — safe to ignore
      }
      try {
        await soundRef.current.unloadAsync();
      } catch {
        // ignore unload errors on already-stopped sounds
      }
      soundRef.current = null;
    }
    setIsPlaying(false);
  };

  const speak = async (text: string, language: 'en' | 'ur' = 'en') => {
    if (!text || text.trim().length === 0) return;

    setError(null);
    setIsLoading(true);

    await stop();

    try {
      const authHeader = await getAuthHeader();
      const response = await fetch(`${BACKEND_URL}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ text, language }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || `Server error ${response.status}`);
      }

      const { audioId } = await response.json();
      const audioUrl = `${BACKEND_URL}/api/audio/${audioId}`;

      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );

      soundRef.current = sound;
      setIsLoading(false);
      setIsPlaying(true);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        if (status.didJustFinish) {
          sound.unloadAsync();
          soundRef.current = null;
          setIsPlaying(false);
        }
      });
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  return { speak, stop, isLoading, isPlaying, error };
}
