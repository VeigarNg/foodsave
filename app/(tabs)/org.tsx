import { Image } from 'expo-image'
import { StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { useEffect, useState } from 'react'
import { router } from 'expo-router'

import ParallaxScrollView from '@/components/parallax-scroll-view'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { Fonts } from '@/constants/theme'
import { supabase } from '@/lib/supabase'

/**
 * Event status mapping
 * 0 = Not Started
 * 1 = Ongoing
 * 2 = Running Out
 * 3 = Closed
 */
const STATUS_LABELS: Record<number, string> = {
  0: 'Not Started',
  1: 'Ongoing',
  2: 'Running Out',
  3: 'Closed',
}

/**
 * Column flex ratios (single source of truth)
 */
const COLUMNS = {
  caterer: 2,
  sfa: 1,
  date: 1,
  location: 2,
  status: 1,
  actions: 3,
}

export default function OrgScreen() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadEvents = async () => {
    setLoading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) throw new Error('Not logged in')

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true })

      if (error) throw error
      setEvents(data ?? [])
    } catch (err: any) {
      Alert.alert('Error', err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (eventId: string, status: number) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ status })
        .eq('id', eventId)

      if (error) throw error
      loadEvents()
    } catch (err: any) {
      Alert.alert('Update failed', err.message)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#AE2222', dark: '#003d7c' }}
      headerImage={<Image />}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
          Organiser Dashboard
        </ThemedText>

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/create-event')}
        >
          <ThemedText style={styles.createButtonText}>
            + Create Event
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.sectionContainer}>
        {loading ? (
          <ThemedText>Loading events…</ThemedText>
        ) : events.length === 0 ? (
          <ThemedText style={{ marginVertical: 80 }}>
            No events yet
          </ThemedText>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <ThemedView style={{ minWidth: 750 }}>
              {/* HEADER */}
              <ThemedView style={[styles.row, styles.headerRow]}>
                <Cell header flex={COLUMNS.caterer} text="Caterer" />
                <Cell header flex={COLUMNS.sfa} text="SFA" />
                <Cell header flex={COLUMNS.date} text="Date" />
                <Cell header flex={COLUMNS.location} text="Location" />
                <Cell header flex={COLUMNS.status} text="Status" />
                <Cell header flex={COLUMNS.actions} text="Actions" />
              </ThemedView>

              {/* ROWS */}
              {events.map(event => (
                <ThemedView key={event.id} style={styles.row}>
                  <Cell flex={COLUMNS.caterer} text={event.caterer} />
                  <Cell flex={COLUMNS.sfa} text={event.sfa ?? '-'} />
                  <Cell
                    flex={COLUMNS.date}
                    text={new Date(event.date).toLocaleDateString()}
                  />
                  <Cell flex={COLUMNS.location} text={event.location} />
                  <Cell
                    flex={COLUMNS.status}
                    text={STATUS_LABELS[event.status]}
                  />

                  <ThemedView
                    style={[
                      styles.cell,
                      {
                        flex: COLUMNS.actions,
                        flexDirection: 'row',
                        gap: 6,
                        flexWrap: 'wrap',
                      },
                    ]}
                  >
                    {[0, 1, 2].map(s => (
                      <TouchableOpacity
                        key={s}
                        style={[
                          styles.statusButton,
                          event.status === s && styles.statusButtonActive,
                        ]}
                        onPress={() => updateStatus(event.id, s)}
                      >
                        <ThemedText style={styles.statusText}>
                          {STATUS_LABELS[s]}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}

                    <TouchableOpacity
                      style={[styles.statusButton, styles.closeButton]}
                      onPress={() => updateStatus(event.id, 3)}
                    >
                      <ThemedText style={styles.statusText}>
                        Close
                      </ThemedText>
                    </TouchableOpacity>
                  </ThemedView>
                </ThemedView>
              ))}
            </ThemedView>
          </ScrollView>
        )}
      </ThemedView>
    </ParallaxScrollView>
  )
}

/* ---------- CELL COMPONENT ---------- */

function Cell({
  text,
  flex,
  header = false,
}: {
  text: string
  flex: number
  header?: boolean
}) {
  return (
    <ThemedView style={[styles.cell, { flex }]}>
      <ThemedText
        numberOfLines={1}
        ellipsizeMode="tail"
        style={header ? styles.headerText : undefined}
      >
        {text}
      </ThemedText>
    </ThemedView>
  )
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  createButton: {
    backgroundColor: '#2FA36B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },

  createButtonText: {
    color: 'white',
    fontWeight: '600',
  },

  sectionContainer: {
    marginTop: 20,
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    paddingVertical: 10,
  },

  headerRow: {
    backgroundColor: 'rgba(0,0,0,0.06)',
  },

  cell: {
    paddingHorizontal: 8,
    justifyContent: 'center',
  },

  headerText: {
    fontWeight: '700',
  },

  statusButton: {
    backgroundColor: 'rgba(0,0,0,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },

  statusButtonActive: {
    backgroundColor: '#2FA36B',
  },

  closeButton: {
    backgroundColor: '#AE2222',
  },

  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
})
