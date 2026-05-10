import { Audio } from 'expo-av';
import { useState, useRef } from 'react';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export function useTts() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const stop = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
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
      const response = await fetch(`${BACKEND_URL}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
