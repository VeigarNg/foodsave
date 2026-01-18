import React, { memo } from 'react'
import { TextInput, StyleSheet } from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'

interface InputProps {
  label: string
  value: string
  onChangeText: (text: string) => void
  error?: string
  multiline?: boolean
}

export const Input = memo(({ label, value, onChangeText, error, multiline = false }: InputProps) => {
  return (
    <ThemedView style={{ marginTop: 12 }}>
      <ThemedText>{label}</ThemedText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        style={[
          styles.input,
          multiline && { height: 100, textAlignVertical: 'top' },
          error && { borderColor: 'red' },
        ]}
      />
      {error && <ThemedText style={{ color: 'red', marginTop: 4 }}>{error}</ThemedText>}
    </ThemedView>
  )
})

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },
})
