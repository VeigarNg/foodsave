import { useState, useEffect } from 'react'
import { StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native'
import { router } from 'expo-router'

import { supabase } from '@/lib/supabase'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useSession } from '@/lib/useSession'

export default function SignupScreen() {
  const { user, loading } = useSession(false) // false = don't redirect automatically
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Redirect logged-in users
  useEffect(() => {
    if (!loading && user) router.replace('/')
  }, [loading, user])

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password')
      return
    }

    setSubmitting(true)
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error

      if (data.user) {
        // Optional: insert into your custom "user" table
        await supabase.from('user').insert({ id: data.user.id })

        Alert.alert('Success', 'Account created! Redirecting...')
        router.replace('/') // go to home after signup
      } else {
        Alert.alert('Signup failed', 'No user returned')
      }
    } catch (err: any) {
      Alert.alert('Signup failed', err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={{ marginBottom: 24 }}>Sign Up</ThemedText>

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

      <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={submitting}>
        <ThemedText style={styles.buttonText}>{submitting ? 'Signing up...' : 'Sign Up'}</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/login')} style={{ marginTop: 12 }}>
        <ThemedText style={{ color: '#2F80ED', fontWeight: '500' }}>Already have an account? Login</ThemedText>
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
