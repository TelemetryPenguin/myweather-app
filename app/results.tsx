import * as Icons from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');

const getBackgroundColor = (icon: string) => {
  if (!icon) return '#0f172a'; 
  const isNight = icon.endsWith('n');
  if (icon.startsWith('01')) return isNight ? '#1e293b' : '#38bdf8'; 
  if (icon.startsWith('02') || icon.startsWith('03') || icon.startsWith('04')) {
    return isNight ? '#334155' : '#94a3b8';
  }
  if (icon.startsWith('09') || icon.startsWith('10')) return '#475569';
  if (icon.startsWith('11')) return '#1e1b4b'; 
  if (icon.startsWith('13')) return '#cbd5e1'; 
  if (icon.startsWith('50')) return '#64748b';
  return '#0f172a';
};

const getLargeWeatherIcon = (icon: string, sunrise: number, sunset: number) => {
  const now = Math.floor(Date.now() / 1000);
  if (now > sunset || now < sunrise) {
    if (icon.startsWith('02') || icon.startsWith('03') || icon.startsWith('04')) {
      return 'weather-night-partly-cloudy';
    }
    return 'weather-night';
  }
  if (icon === '01d') return 'weather-sunny';
  if (icon === '02d') return 'weather-partly-cloudy';
  if (icon === '03d' || icon === '04d') return 'cloud-outline';
  if (icon === '09d') return 'weather-rainy';
  if (icon === '10d') return 'weather-rainy';
  if (icon === '11d') return 'weather-lightning-rainy';
  if (icon === '13d') return 'weather-snowy';
  if (icon === '50d') return 'weather-fog';
  return 'weather-partly-cloudy';
};

export default function ResultsScreen() {
  const { zip, lat, lon } = useLocalSearchParams();
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [units, setUnits] = useState<'imperial' | 'metric'>('imperial');
  const router = useRouter();

  const initialLoad = async () => {
    try {
      const storedUnits = await AsyncStorage.getItem('unit_preference');
      if (storedUnits) setUnits(storedUnits as 'imperial' | 'metric');
    } catch (e) { console.log("Error loading units", e); }
  };

  const fetchWeather = async (activeUnits = units) => {
    const apiKey = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
    setLoading(true);
    setError(null);
    try {
      let url = `https://api.openweathermap.org/data/2.5/weather?units=${activeUnits}&appid=${apiKey}`;
      if (zip) url += `&zip=${zip},us`;
      else if (lat && lon) url += `&lat=${lat}&lon=${lon}`;

      const response = await fetch(url);
      const data = await response.json();
      
      if (data.cod === 200) {
        setWeather(data);
        const stored = await AsyncStorage.getItem('favorites');
        if (stored) {
          const list = JSON.parse(stored);
          setIsSaved(list.some((f: any) => f.name === data.name));
        }
      } else {
        setError(data.message || 'Location not found');
      }
    } catch (e) { setError('Network request failed. Check your connection.'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    initialLoad().then(() => fetchWeather());
  }, [zip, lat, lon, units]);

  // RESTORED: Unit toggle logic
  const toggleUnits = async () => {
    const newUnit = units === 'imperial' ? 'metric' : 'imperial';
    setUnits(newUnit);
    await AsyncStorage.setItem('unit_preference', newUnit);
  };

  const toggleFavorite = async () => {
    try {
      const stored = await AsyncStorage.getItem('favorites');
      let list = stored ? JSON.parse(stored) : [];
      if (isSaved) {
        list = list.filter((f: any) => f.name !== weather.name);
        setIsSaved(false);
      } else { 
        list.push({ 
          zip: zip || null, name: weather.name, 
          temp: Math.round(weather.main.temp), 
          lat: lat || null, lon: lon || null 
        });
        setIsSaved(true);
      }
      await AsyncStorage.setItem('favorites', JSON.stringify(list));
    } catch (e) { Alert.alert("Error", "Could not update favorites"); }
  };

  const getAttire = () => {
    if (!weather) return { icon: 'tshirt-crew', value: 'Loading...' };
    const temp = weather.main.temp;
    const isImperial = units === 'imperial';
    const condition = weather.weather[0].main.toLowerCase();
    const windSpeed = weather.wind.speed;

    if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('storm')) {
      return { icon: 'umbrella', value: 'Umbrella' };
    }
    if ((isImperial && windSpeed > 15) || (!isImperial && windSpeed > 6.7)) {
      return { icon: 'weather-windy-variant', value: 'Jacket' };
    }
    if ((isImperial && temp > 80) || (!isImperial && temp > 26)) {
      return { icon: 'sunglasses', value: 'Sun Protection' };
    }
    if ((isImperial && temp < 45) || (!isImperial && temp < 7)) {
      return { icon: 'snowflake', value: 'Heavy Layers' };
    }
    return { icon: 'tshirt-crew', value: 'Light Layers' };
  };

  if (loading || !weather) {
    if (error) {
      return (
        <View style={[styles.centered, { backgroundColor: '#0f172a' }]}>
          <Icons.MaterialCommunityIcons name="alert-circle-outline" size={60} color="rgba(255,255,255,0.4)" />
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 16, textAlign: 'center', paddingHorizontal: 30 }}>
            {error}
          </Text>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 28, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 30, paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const dynamicBg = getBackgroundColor(weather.weather[0].icon);
  const attire = getAttire();
  const largeIcon = getLargeWeatherIcon(weather.weather[0].icon, weather.sys.sunrise, weather.sys.sunset);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: dynamicBg }]}>
        <View style={styles.nav}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Icons.MaterialCommunityIcons name="chevron-left" size={30} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.navRight}>
            <TouchableOpacity onPress={() => router.push('/settings')} style={[styles.iconBtn, { marginRight: 10 }]}>
              <Icons.MaterialCommunityIcons name="cog" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/favorites')} style={[styles.iconBtn, { marginRight: 10 }]}>
              <Icons.MaterialCommunityIcons name="heart-multiple" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleFavorite} style={styles.iconBtn}>
              <Icons.MaterialCommunityIcons 
                name={isSaved ? "heart" : "heart-outline"} 
                size={26} 
                color={isSaved ? "#ff4757" : "#fff"} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={loading && !!weather} onRefresh={() => fetchWeather()} tintColor="#fff" />}
        >
          <View style={styles.heroSection}>
            <Text style={styles.city}>{weather.name}</Text>
            <Icons.MaterialCommunityIcons name={largeIcon as any} size={80} color="#fff" style={styles.largeIcon} />
            <Text style={styles.temp}>{Math.round(weather.main.temp)}°</Text>
            <Text style={styles.feelsLikeText}>FEELS LIKE {Math.round(weather.main.feels_like)}°</Text>
            <View style={styles.conditionContainer}>
              <Text style={styles.desc}>{weather.weather[0].description}</Text>
            </View>
          </View>

          <View style={styles.grid}>
            <DetailTile icon="water-outline" label="Humidity" value={`${weather.main.humidity}%`} />
            <DetailTile icon="weather-windy" label="Wind Speed" value={`${Math.round(weather.wind.speed)} ${units === 'imperial' ? 'mph' : 'm/s'}`} />
            <DetailTile icon={attire.icon} label="Attire" value={attire.value} />
            <DetailTile icon="altimeter" label="Pressure" value={`${weather.main.pressure} hPa`} />
            <DetailTile icon="weather-sunset-up" label="Sunrise" value={new Date(weather.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
            <DetailTile icon="weather-sunset-down" label="Sunset" value={new Date(weather.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
          </View>

          {/* RESTORED: Switch Button at bottom */}
          <TouchableOpacity style={styles.glassActionBtn} onPress={toggleUnits}>
            <Text style={styles.glassActionText}>Switch to {units === 'imperial' ? 'Celsius' : 'Fahrenheit'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const DetailTile = ({ icon, label, value }: any) => (
  <View style={styles.tile}>
    <Icons.MaterialCommunityIcons name={icon} size={22} color="rgba(255,255,255,0.7)" />
    <View style={styles.tileTextContainer}>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={styles.tileVal} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  nav: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
  navRight: { flexDirection: 'row' },
  iconBtn: { backgroundColor: 'rgba(255,255,255,0.15)', padding: 8, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  heroSection: { alignItems: 'center', marginTop: 20, marginBottom: 30 },
  city: { color: '#fff', fontSize: 32, fontWeight: '300', letterSpacing: 1, marginBottom: 15 },
  largeIcon: { marginBottom: 10 },
  temp: { color: '#fff', fontSize: 100, fontWeight: 'bold' },
  feelsLikeText: { color: 'rgba(255,255,255,0.6)', fontSize: 16, fontWeight: '600', marginBottom: 10, letterSpacing: 1, textTransform: 'uppercase' },
  conditionContainer: { flexDirection: 'row', alignItems: 'center' },
  desc: { color: 'rgba(255,255,255,0.8)', fontSize: 20, textTransform: 'capitalize' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tile: { backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 15, paddingVertical: 18, borderRadius: 24, width: '48%', marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', flexDirection: 'row', alignItems: 'center', height: 80 },
  tileTextContainer: { marginLeft: 10, flex: 1 },
  tileLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  tileVal: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginTop: 2 },
  glassActionBtn: { 
    backgroundColor: 'rgba(255,255,255,0.15)', 
    marginTop: 10, 
    padding: 20, 
    borderRadius: 20, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.3)' 
  },
  glassActionText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});