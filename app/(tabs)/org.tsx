import { Image } from 'expo-image'
import { TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { useEffect, useState } from 'react'
import { router } from 'expo-router'
import { Picker } from '@react-native-picker/picker'

import ParallaxScrollView from '@/components/parallax-scroll-view'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { Fonts } from '@/constants/theme'
import { supabase } from '@/lib/supabase'

export default function OrgScreen() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // ------------------- Load organiser's events -------------------
  const loadEvents = async () => {
    setLoading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) throw new Error('User not logged in')

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true })

      if (error) throw error
      setEvents(data ?? [])
    } catch (err: any) {
      console.error(err)
      alert('Error loading events: ' + err.message)
    } finally { setLoading(false) }
  }

  useEffect(() => { loadEvents() }, [])

  // ------------------- Update event status -------------------
  const updateStatus = async (eventId: string, newStatus: number) => {
    try {
      const { error } = await supabase.from('events').update({ status: newStatus }).eq('id', eventId)
      if (error) throw error
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: newStatus } : e))
    } catch (err: any) {
      alert('Error updating status: ' + err.message)
    }
  }

  // ------------------- Close Event -------------------
  const closeEvent = (eventId: string) => updateStatus(eventId, 3) // 3 = Closed

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light:'#AE2222', dark:'#003d7c' }}
      headerImage={<Image />}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>Organiser Dashboard</ThemedText>
        <TouchableOpacity style={styles.createButton} onPress={() => router.push('/create-event')}>
          <ThemedText style={styles.createButtonText}>+ Create New Event</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.sectionContainer}>
        <ThemedView style={styles.sectionHeader}>
          <ThemedText type="subtitle">Your Events</ThemedText>
        </ThemedView>

        <ThemedView style={styles.tableHeader}>
          <ThemedText style={styles.tableHeaderText}>Caterer</ThemedText>
          <ThemedText style={styles.tableHeaderText}>SFA</ThemedText>
          <ThemedText style={styles.tableHeaderText}>Date</ThemedText>
          <ThemedText style={styles.tableHeaderText}>Location</ThemedText>
          <ThemedText style={styles.tableHeaderText}>Status</ThemedText>
          <ThemedText style={styles.tableHeaderText}>Actions</ThemedText>
        </ThemedView>

        {loading ? (
          <ThemedText>Loading events...</ThemedText>
        ) : events.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <ThemedText style={{ marginVertical: 100 }}>No events yet!</ThemedText>
          </ThemedView>
        ) : (
          events.map((event) => (
            <ThemedView key={event.id} style={{ flexDirection:'row', justifyContent:'space-between', paddingVertical:8, paddingHorizontal:8, alignItems:'center' }}>
              <ThemedText>{event.caterer}</ThemedText>
              <ThemedText>{event.sfa ?? '-'}</ThemedText>
              <ThemedText>{new Date(event.date).toLocaleDateString()}</ThemedText>
              <ThemedText>{event.location}</ThemedText>

              {/* Status Picker */}
              <Picker
                selectedValue={event.status}
                style={{ height:30, width:120 }}
                onValueChange={(value) => updateStatus(event.id, value)}
              >
                <Picker.Item label="Not Started" value={0} />
                <Picker.Item label="Ongoing" value={1} />
                <Picker.Item label="Running Out" value={2} />
                <Picker.Item label="Closed" value={3} />
              </Picker>

              {/* Close Event Button */}
              {event.status !== 3 && (
                <TouchableOpacity style={styles.closeButton} onPress={() => closeEvent(event.id)}>
                  <ThemedText style={styles.closeButtonText}>Close</ThemedText>
                </TouchableOpacity>
              )}
            </ThemedView>
          ))
        )}
      </ThemedView>
    </ParallaxScrollView>
  )
}

// ------------------- Styles -------------------
const styles = StyleSheet.create({
  titleContainer: { flexDirection:'row', justifyContent:'space-between', gap:8, alignItems:'center' },
  createButton: { backgroundColor:'#2FA36B', paddingHorizontal:16, paddingVertical:10, borderRadius:8 },
  createButtonText: { color:'white', fontWeight:'600' },
  sectionContainer: { marginTop:20, padding:14, borderRadius:12, backgroundColor:'rgba(0,0,0,0.03)' },
  sectionHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:8, marginBottom:10 },
  tableHeader: { flexDirection:'row', justifyContent:'space-between', paddingVertical:8, paddingHorizontal:8 },
  tableHeaderText: { fontWeight:'600', opacity:0.7 },
  emptyState: { marginTop:20, alignItems:'center', gap:6 },
  closeButton: { backgroundColor:'#D9534F', paddingHorizontal:10, paddingVertical:4, borderRadius:6 },
  closeButtonText: { color:'white', fontWeight:'600' },
})
