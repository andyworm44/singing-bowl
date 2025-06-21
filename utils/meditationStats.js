import AsyncStorage from '@react-native-async-storage/async-storage';

const STATS_STORAGE_KEY = 'meditation_stats';

export const attributes = {
  '慈悲心': { color: 'white' }
};

export const incrementStat = async (attributeName) => {
  try {
    console.log('Incrementing stat for:', attributeName);
    const today = new Date().toISOString().split('T')[0];
    
    // Get current stats
    const statsString = await AsyncStorage.getItem(STATS_STORAGE_KEY);
    console.log('Current stats string:', statsString);
    
    let stats = {};
    if (statsString) {
      try {
        stats = JSON.parse(statsString);
      } catch (e) {
        console.error('Error parsing stats:', e);
      }
    }

    // Initialize today's stats if not exists
    if (!stats[today]) {
      stats[today] = {};
    }

    // Increment the stat
    if (!stats[today][attributeName]) {
      stats[today][attributeName] = 0;
    }
    stats[today][attributeName] += 1;
    
    console.log('Updated stats:', stats);
    console.log('Today\'s stats:', stats[today]);

    // Save back to storage
    await AsyncStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    
    return stats[today][attributeName];
  } catch (error) {
    console.error('Error incrementing stat:', error);
    throw error;
  }
};

export const getStats = async () => {
  try {
    const stats = await AsyncStorage.getItem(STATS_STORAGE_KEY);
    console.log('Retrieved raw stats from storage:', stats);
    const parsedStats = stats ? JSON.parse(stats) : {};
    console.log('Parsed stats:', JSON.stringify(parsedStats, null, 2));
    return parsedStats;
  } catch (error) {
    console.error('Error getting stats:', error);
    return {};
  }
};

export const getTodayStats = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const statsString = await AsyncStorage.getItem(STATS_STORAGE_KEY);
    console.log('Getting today stats, raw data:', statsString);
    
    if (!statsString) {
      console.log('No stats found');
      return { '慈悲心': 0 };
    }

    const stats = JSON.parse(statsString);
    const todayStats = stats[today] || { '慈悲心': 0 };
    console.log('Today:', today);
    console.log('Today stats:', todayStats);
    
    return todayStats;
  } catch (error) {
    console.error('Error getting today stats:', error);
    return { '慈悲心': 0 };
  }
};

export const clearStats = async () => {
  try {
    await AsyncStorage.removeItem(STATS_STORAGE_KEY);
    console.log('Stats cleared');
  } catch (error) {
    console.error('Error clearing stats:', error);
  }
};

export const getLast7DaysStats = async () => {
  const stats = await getStats();
  const dates = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates.map(date => ({
    date,
    stats: stats[date] || {}
  }));
}; 