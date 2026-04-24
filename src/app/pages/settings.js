import { getSupabase } from './supabase'

// GUARDAR EN BASE DE DATOS
export async function guardarClaveStripe(valor) {
  const supabase = getSupabase()

  if (!supabase) {
    console.error('Supabase no inicializado')
    return
  }

  const { error } = await supabase
    .from('settings')
    .upsert({
      key: 'stripe_pk',
      value: valor
    })

  if (error) console.error(error)
}

// CARGAR DESDE BASE DE DATOS
export async function cargarClaveStripe() {
  const supabase = getSupabase()

  if (!supabase) {
    console.error('Supabase no inicializado')
    return null
  }

  const { data, error } = await supabase
    .from('settings')
    .select('*')

  if (error) {
    console.error(error)
    return null
  }

  return data.find(x => x.key === 'stripe_pk')?.value
}