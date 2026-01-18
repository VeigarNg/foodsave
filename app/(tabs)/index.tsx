import { Image } from 'expo-image'
import { ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useEffect, useState } from 'react'
import ParallaxScrollView from '@/components/parallax-scroll-view'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { supabase } from '@/lib/supabase'

export default function HomeScreen() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userPreferences, setUserPreferences] = useState<{dietary: string[], allergy: string[]}>({dietary: [], allergy: []})

  // Load user preferences
  useEffect(() => {
    const fetchUserPrefs = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) return
      const { data, error } = await supabase.from('user').select('dietary,allergy').eq('id', user.id).single()
      if (!error && data) {
        setUserPreferences({
          dietary: data.dietary?.split(',') ?? [],
          allergy: data.allergy?.split(',') ?? []
        })
      }
    }
    fetchUserPrefs()
  }, [])

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 0)
        .order('date', { ascending: true })

      if (error) {
        console.error(error)
        setLoading(false)
        return
      }

      setEvents(data ?? [])
      setLoading(false)
    }
    fetchEvents()
  }, [])

  return (
    <ParallaxScrollView headerBackgroundColor={{ light: '#AE2222', dark: '#003d7c' }} headerImage={<Image />}>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Nearby Events</ThemedText>
        <ScrollView showsVerticalScrollIndicator={false}>
          {loading ? (
            <ThemedText>Loading nearby events...</ThemedText>
          ) : events.length === 0 ? (
            <ThemedText>No nearby events right now</ThemedText>
          ) : (
            events.map((event) => (
              <TouchableOpacity key={event.id} activeOpacity={0.8}>
                <ThemedView style={styles.eventCard}>
                  <ThemedText type="defaultSemiBold">{event.caterer}</ThemedText>
                  <ThemedText>{event.location}</ThemedText>
                  <ThemedText>Status: {event.status}</ThemedText>
                  <ThemedText>{new Date(event.date).toLocaleString()}</ThemedText>
                </ThemedView>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </ThemedView>
    </ParallaxScrollView>
  )
}

const styles = StyleSheet.create({
  stepContainer: { gap: 8, marginBottom: 8 },
  eventCard: { padding: 12, borderRadius: 12, marginBottom: 10, backgroundColor: '#ef7c00' },
})
