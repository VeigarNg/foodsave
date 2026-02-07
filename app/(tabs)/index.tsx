import { Image } from 'expo-image'
import { ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useEffect, useState } from 'react'
import ParallaxScrollView from '@/components/parallax-scroll-view'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { supabase } from '@/lib/supabase'
import { Fonts } from '@/constants/theme'

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
        .neq('status', 0)
        .neq('status', 3)
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
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>Nearby Events</ThemedText>
      </ThemedView>
      <ThemedView style={styles.sectionContainer}>
        <ThemedView style={styles.tableHeader}>
          <ThemedText style={styles.tableHeaderText}>Caterer</ThemedText>
          <ThemedText style={styles.tableHeaderText}>SFA</ThemedText>
          <ThemedText style={styles.tableHeaderText}>Date</ThemedText>
          <ThemedText style={styles.tableHeaderText}>Location</ThemedText>
          <ThemedText style={styles.tableHeaderText}>Status</ThemedText>
          <ThemedText style={styles.tableHeaderText}>Actions</ThemedText>
        </ThemedView>
      </ThemedView>
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
    </ParallaxScrollView>
  )
}

const styles = StyleSheet.create({
  titleContainer: { flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  sectionContainer: { marginTop:20, padding:14, borderRadius:12, backgroundColor:'rgba(0,0,0,0.03)' },
  sectionHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:8, marginBottom:10 },
  tableHeader: { flexDirection:'row', justifyContent:'space-between', paddingVertical:8, paddingHorizontal:8 },
  tableHeaderText: { fontWeight:'600', opacity:0.7 },
  eventCard: { padding: 12, borderRadius: 12, marginBottom: 10, backgroundColor: '#ef7c00' },
})
