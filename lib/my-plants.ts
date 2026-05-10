import { supabase } from './supabase';
import { getPlantsByType, PlantRow } from './db';

export async function getMyPlants(): Promise<PlantRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('my_plants')
    .select('plant_id')
    .eq('user_id', user.id);

  if (error || !data || data.length === 0) return [];

  const plantIds = data.map((row) => row.plant_id);

  // Fetch full plant rows from local SQLite using existing function
  const allCrops = await getPlantsByType('crop');
  const allHome = await getPlantsByType('home');
  const allPlants = [...allCrops, ...allHome];

  return allPlants.filter((p) => plantIds.includes(p.id));
}

export async function addToMyPlants(plantId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('my_plants')
    .upsert({ user_id: user.id, plant_id: plantId }, { onConflict: 'user_id,plant_id' });

  // 23505 = unique violation → plant already saved, treat as success
  if (error && error.code !== '23505') throw error;
}

export async function removeFromMyPlants(plantId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('my_plants')
    .delete()
    .eq('user_id', user.id)
    .eq('plant_id', plantId);

  if (error) throw error;
}

export async function isInMyPlants(plantId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('my_plants')
    .select('plant_id')
    .eq('user_id', user.id)
    .eq('plant_id', plantId)
    .maybeSingle();

  return !!data;
}
