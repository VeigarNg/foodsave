import { TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useSession } from '@/lib/useSession'

export default function SettingsScreen() {
  const { user, loading } = useSession(false) // false = don't redirect automatically

  if (loading) return <ThemedText>Loading session...</ThemedText>

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.replace('/login') // send user back to login page
    } catch (err: any) {
      console.error(err)
      alert('Error logging out: ' + err.message)
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={{ marginBottom: 24 }}>Settings</ThemedText>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <ThemedText style={styles.buttonText}>Logout</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  button: {
    backgroundColor: '#E63946',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 12,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
})
