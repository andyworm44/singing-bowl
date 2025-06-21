import AsyncStorage from '@react-native-async-storage/async-storage';

const STATS_KEY = '@meditation_stats';

export const getTodayStats = async () => {
  try {
    const statsString = await AsyncStorage.getItem(STATS_KEY);
    console.log('Getting today stats, raw data:', statsString);
    const stats = statsString ? JSON.parse(statsString) : {};
    const today = new Date().toISOString().split('T')[0];
    console.log('Today:', today);
    const todayStats = stats[today] || {};
    console.log('Today stats:', todayStats);
    return todayStats;
  } catch (error) {
    console.error('Error getting today stats:', error);
    return {};
  }
};

export const incrementStat = async (statName) => {
  try {
    console.log('Incrementing stat for:', statName);
    const statsString = await AsyncStorage.getItem(STATS_KEY);
    const stats = statsString ? JSON.parse(statsString) : {};
    console.log('Current stats string:', statsString);
    
    const today = new Date().toISOString().split('T')[0];
    if (!stats[today]) {
      stats[today] = {};
    }
    
    stats[today][statName] = (stats[today][statName] || 0) + 1;
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
    
    console.log('Updated stats:', stats);
    console.log('Today\'s stats:', stats[today]);
    console.log(`${statName} incremented to:`, stats[today][statName]);
    
    return stats[today];
  } catch (error) {
    console.error('Error incrementing stat:', error);
    return {};
  }
}; 