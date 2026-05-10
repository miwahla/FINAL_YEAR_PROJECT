import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://uimcuhojeuscsubozsxf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpbWN1aG9qZXVzY3N1Ym96c3hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2ODYzODIsImV4cCI6MjA5MjI2MjM4Mn0.9jVdZxOsvQaez93fvX215NQJv9ovKoM2NNDhKp9Eu7Q';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
