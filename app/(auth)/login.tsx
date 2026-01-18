import { useState, useEffect } from 'react'
import { StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native'
import { router } from 'expo-router'

import { supabase } from '@/lib/supabase'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useSession } from '@/lib/useSession'

export default function LoginScreen() {
  const { user, loading } = useSession(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Redirect logged-in users to home
  useEffect(() => {
    if (!loading && user) router.replace('/')
  }, [loading, user])

  const handleLogin = async () => {
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert('Error', 'Please enter both email and password')
      return
    }

    setSubmitting(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      })

      if (error) throw error

      if (data.session?.user) {
        // ✅ Success: redirect to home/dashboard
        router.replace('/')
      } else {
        Alert.alert('Login failed', 'No session returned. Check your credentials.')
      }
    } catch (err: any) {
      // Map Supabase error messages for clarity
      if (err.status === 400) {
        Alert.alert('Login Error', 'Invalid email or password')
      } else {
        Alert.alert('Login Error', err.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={{ marginBottom: 24 }}>Login</ThemedText>

      <TextInput
        placeholder="Email"
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Password"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={[styles.button, submitting && { opacity: 0.7 }]}
        onPress={handleLogin}
        disabled={submitting}
      >
        <ThemedText style={styles.buttonText}>
          {submitting ? 'Logging in...' : 'Login'}
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/signup')} style={{ marginTop: 12 }}>
        <ThemedText style={{ color: '#2F80ED', fontWeight: '500' }}>
          Don't have an account? Sign Up
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginTop: 12 },
  button: { marginTop: 24, backgroundColor: '#2FA36B', padding: 14, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '600' },
})
