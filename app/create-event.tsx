import { StyleSheet, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'

import ParallaxScrollView from '@/components/parallax-scroll-view'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { supabase } from '@/lib/supabase'
import { CheckboxGroup } from '@/components/ui/checkbox-group'

// ------------------- Options -------------------
const DIETARY_OPTIONS = ['None', 'Halal', 'Kosher', 'Pescatarian', 'Vegetarian', 'Vegan']
const ALLERGEN_OPTIONS = ['None', 'Dairy', 'Egg', 'Peanut', 'Tree nut', 'Soy', 'Wheat', 'Gluten', 'Shellfish', 'Fish', 'Sesame']

export default function CreateEventScreen() {
  const [caterer, setCaterer] = useState('')
  const [sfa, setSfa] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [dietary, setDietary] = useState<string[]>([])
  const [allergen, setAllergen] = useState<string[]>([])
  const [additional, setAdditional] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{[key:string]:string}>({})

  // ------------------- Validation -------------------
  const validateForm = () => {
    const newErrors: {[key:string]:string} = {}
    if (!caterer.trim()) newErrors.caterer = 'Caterer is required.'
    if (!sfa.trim()) newErrors.sfa = 'SFA Licence Number is required.'
    if (!location.trim()) newErrors.location = 'Location is required.'
    if (!date.trim()) newErrors.date = 'Event Date is required.'
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
      newErrors.date = 'Date must be YYYY-MM-DD.'
    else if (new Date(date) < new Date(new Date().setHours(0,0,0,0)))
      newErrors.date = 'Date cannot be in the past.'
    if (dietary.length === 0) newErrors.dietary = 'Select at least one dietary restriction.'
    if (allergen.length === 0) newErrors.allergen = 'Select at least one allergen.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ------------------- Submit -------------------
  const handleSubmit = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    const user = userData?.user
    if (userError || !user) {
      alert('You must be logged in.')
      return
    }

    if (!validateForm()) return

    setLoading(true)
    try {
      const { error } = await supabase.from('events').insert({
        caterer,
        sfa,
        date: new Date(date),
        location,
        dietary: dietary.join(', '),
        allergen: allergen.join(', '),
        additional,
        user_id: user.id,
        status: 0
      })
      if (error) throw error
      alert('Event submitted successfully!')
      router.back()
    } catch(err:any){
      alert('Error creating event: ' + err.message)
    } finally { setLoading(false) }
  }

  return (
    <ParallaxScrollView headerBackgroundColor={{ light:'#AE2222', dark:'#003d7c' }} headerImage={<></>}>
      <ThemedView style={styles.container}>
        <ThemedText type="title">Create Event</ThemedText>

        <InputField label="Caterer" value={caterer} onChange={setCaterer} error={errors.caterer} />
        <InputField label="SFA Licence Number" value={sfa} onChange={setSfa} error={errors.sfa} />
        <InputField label="Event Date" value={date} onChange={setDate} placeholder="YYYY-MM-DD" error={errors.date} />
        <InputField label="Location" value={location} onChange={setLocation} error={errors.location} />

        <CheckboxGroup label="Dietary Restrictions" options={DIETARY_OPTIONS} selected={dietary} onChange={setDietary} error={errors.dietary} />
        <CheckboxGroup label="Allergens" options={ALLERGEN_OPTIONS} selected={allergen} onChange={setAllergen} error={errors.allergen} />

        <InputField label="Additional Notes" value={additional} onChange={setAdditional} multiline />

        <TouchableOpacity style={[styles.submitButton, loading && {opacity:0.7}]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="white"/> : <ThemedText style={styles.submitText}>Submit for Approval</ThemedText>}
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  )
}

// ------------------- InputField -------------------
function InputField({ label, value, onChange, error, multiline=false, placeholder }: { label:string; value:string; onChange:(text:string)=>void; error?:string; multiline?:boolean; placeholder?:string }) {
  return (
    <ThemedView style={{ marginTop:12 }}>
      <ThemedText>{label}</ThemedText>
      <TextInput
        value={value}
        onChangeText={onChange}
        multiline={multiline}
        placeholder={placeholder}
        style={[styles.input, multiline && {height:100,textAlignVertical:'top'}, error && {borderColor:'red'}]}
      />
      {error && <ThemedText style={{color:'red',marginTop:4}}>{error}</ThemedText>}
    </ThemedView>
  )
}

// ------------------- Styles -------------------
const styles = StyleSheet.create({
  container:{ padding:16 },
  input:{ borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:10, marginTop:6 },
  submitButton:{ marginTop:24, backgroundColor:'#2FA36B', paddingVertical:14, borderRadius:10, alignItems:'center', justifyContent:'center' },
  submitText:{ color:'white', fontWeight:'600' },
})
