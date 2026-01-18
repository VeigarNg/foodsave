import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'

interface CheckboxGroupProps {
  options: string[]
  selected: string[]
  onChange: (newSelected: string[]) => void
  label: string
  error?: string
}

export const CheckboxGroup = ({ options, selected, onChange, label, error }: CheckboxGroupProps) => {
  const toggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((o) => o !== option))
    } else {
      onChange([...selected, option])
    }
  }

  return (
    <ThemedView style={{ marginTop: 12 }}>
      <ThemedText>{label}</ThemedText>
      <View style={styles.container}>
        {options.map((option) => (
          <TouchableOpacity key={option} style={styles.option} onPress={() => toggle(option)}>
            <ThemedView style={[styles.checkbox, selected.includes(option) && styles.checked]} />
            <ThemedText style={{ marginLeft: 8 }}>{option}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>
      {error && <ThemedText style={{ color: 'red', marginTop: 4 }}>{error}</ThemedText>}
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  checked: {
    backgroundColor: '#2FA36B',
    borderColor: '#2FA36B',
  },
})
