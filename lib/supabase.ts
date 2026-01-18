// lib/supabase.ts
import 'react-native-url-polyfill/auto' // required for Supabase in React Native
import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

// -------------------------
// Supabase credentials
// -------------------------
const SUPABASE_URL = 'https://xxqyyxfzcrjxvcjsaxzc.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_zOtBBHNR8z8iGf0o23P3Ug_0Q03755D'
// -------------------------
// Supabase client
// -------------------------
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    ...(Platform.OS !== 'web' ? { storage : AsyncStorage } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: { fetch: fetch }, // ensures fetch works on native
})
