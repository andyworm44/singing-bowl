import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Image,
  Animated,
  Modal,
  ScrollView,
  Switch,
  Platform,
  TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { incrementStat, getTodayStats } from '../utils/meditationStats';

const MESSAGES = [
  { text: '慈悲心 +1', color: 'white' }
];

const COOLDOWN_TIME = 100; // 減少到 100ms 允許更快連擊

export default function App() {
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [todayStats, setTodayStats] = useState({});
  const [autoPlay, setAutoPlay] = useState(false);
  const [lastTapTime, setLastTapTime] = useState(0);
  const soundRef = useRef(null);
  const nextIdRef = useRef(0);
  const autoPlayIntervalRef = useRef(null);

  // 播放聲音 - 改進版本支持重疊播放
  const playSound = async () => {
    try {
      if (soundRef.current) {
        // 創建新的音頻實例以支持重疊播放
        const { sound } = await Audio.Sound.createAsync(
          require('../assets/bowl-sound.mp3'),
          { 
            shouldPlay: true,
            volume: 1.0
          }
        );
        
        // 播放完成後釋放資源
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            sound.unloadAsync();
          }
        });
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  // 處理增加統計數據
  const handleIncrementStat = async (x, y) => {
    try {
      console.log('handleIncrementStat called with:', x, y);
      const newCount = await incrementStat('慈悲心');
      console.log('New count:', newCount);
      
      // 重新加載今日統計數據
      const updatedStats = await getTodayStats();
      console.log('Updated stats:', updatedStats);
      setTodayStats(updatedStats);

      const id = nextIdRef.current++;
      
      // 計算送缽正上方位置
      const bowlCenterX = 200; // 螢幕中央 X 座標
      const bowlTopY = 350; // 送缽正上方 Y 座標
      
      setFloatingTexts(texts => [
        ...texts,
        {
          id,
          message: MESSAGES[0],
          startPosition: { x: bowlCenterX, y: bowlTopY }
        }
      ]);
    } catch (error) {
      console.error('Error incrementing stat:', error);
    }
  };

  // 自動敲擊處理函數
  const handleAutoPlay = async () => {
    console.log('Auto play triggered');
    await playSound();
    await handleIncrementStat(200, 350); // 使用送缽正上方位置
  };

  // 初始化音頻和加載統計數據
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
        });

        const { sound } = await Audio.Sound.createAsync(
          require('../assets/bowl-sound.mp3'),
          { 
            shouldPlay: false,
            volume: 1.0
          }
        );
        soundRef.current = sound;
        console.log('Audio initialized successfully');
      } catch (error) {
        console.error('Audio initialization error:', error);
      }
    };

    initializeAudio();
    loadTodayStats();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
      }
    };
  }, []);

  // 自動敲擊功能
  useEffect(() => {
    console.log('Auto play effect triggered, autoPlay:', autoPlay);
    if (autoPlay) {
      console.log('Starting auto play - playing first sound immediately');
      // 立即播放第一聲
      handleAutoPlay();
      // 然後設定定時器
      autoPlayIntervalRef.current = setInterval(handleAutoPlay, 5000); // 5秒間隔
    } else {
      console.log('Stopping auto play interval');
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
        autoPlayIntervalRef.current = null;
      }
    }

    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
      }
    };
  }, [autoPlay]);

  // 加載今日統計數據
  const loadTodayStats = async () => {
    try {
      console.log('Loading today stats...');
      const stats = await getTodayStats();
      console.log('Loaded stats:', stats);
      setTodayStats(stats);
    } catch (error) {
      console.error('Error loading today stats:', error);
      setTodayStats({ '慈悲心': 0 });
    }
  };

  // 處理敲擊
  const handlePress = async (event) => {
    const currentTime = Date.now();
    if (currentTime - lastTapTime < COOLDOWN_TIME) {
      return;
    }
    setLastTapTime(currentTime);

    const { locationX: x, locationY: y } = event.nativeEvent;
    await playSound();
    await handleIncrementStat(x, y);
  };

  // 處理浮動文字完成動畫 - 移到組件外部避免 useCallback 問題
  const removeFloatingText = (id) => {
    setFloatingTexts(texts => texts.filter(text => text.id !== id));
  };

  // 浮動文字組件 - 簡化避免 useCallback 問題
  const FloatingText = ({ message, startPosition, textId }) => {
    const translateY = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;
  
    useEffect(() => {
      const animation = Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]);

      animation.start(() => {
        // 使用 setTimeout 避免在動畫回調中直接更新狀態
        setTimeout(() => {
          removeFloatingText(textId);
        }, 0);
      });

      return () => {
        animation.stop();
      };
    }, []);
  
    return (
      <Animated.Text
        style={[
          styles.floatingText,
          {
            transform: [{ translateY }],
            opacity,
            color: message.color,
            left: startPosition.x - 50, // 調整文字居中
            top: startPosition.y - 30,
          },
        ]}
      >
        {message.text}
      </Animated.Text>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* 標題 */}
      <Text style={styles.title}>每日靜心</Text>
      
      {/* 設定按鈕 */}
      <TouchableWithoutFeedback onPress={() => setShowSettings(true)}>
        <View style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#D4AF37" />
        </View>
      </TouchableWithoutFeedback>
      
      {/* 統計按鈕 */}
      <TouchableWithoutFeedback onPress={() => setShowStats(true)}>
        <View style={styles.statsButton}>
          <Ionicons name="stats-chart" size={24} color="#D4AF37" />
        </View>
      </TouchableWithoutFeedback>
      
      {/* 缽圖像 */}
      <TouchableWithoutFeedback onPress={handlePress}>
        <View style={styles.bowlContainer}>
          <Image 
            source={require('../assets/bowl.png')} 
            style={styles.bowlImage} 
          />
        </View>
      </TouchableWithoutFeedback>

      {/* 浮動文字 */}
      {floatingTexts.map(({ id, message, startPosition }) => (
        <FloatingText
          key={id}
          message={message}
          startPosition={startPosition}
          textId={id}
        />
      ))}

      {/* 統計模態框 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showStats}
        onRequestClose={() => setShowStats(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>今日修行</Text>
              <TouchableWithoutFeedback onPress={() => setShowStats(false)}>
                <View>
                  <Ionicons name="close" size={24} color="#666" />
                </View>
              </TouchableWithoutFeedback>
            </View>
            <ScrollView>
              {Object.entries(todayStats).map(([key, value]) => (
                <View key={key} style={styles.statRow}>
                  <Text style={styles.statLabel}>{key}</Text>
                  <Text style={styles.statValue}>{value}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 設定模態框 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showSettings}
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>設定</Text>
              <TouchableWithoutFeedback onPress={() => setShowSettings(false)}>
                <View>
                  <Ionicons name="close" size={24} color="#666" />
                </View>
              </TouchableWithoutFeedback>
            </View>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>自動敲擊: {autoPlay ? '開啟' : '關閉'}</Text>
              <Switch
                value={autoPlay}
                onValueChange={setAutoPlay}
                trackColor={{ false: "#767577", true: "#D4AF37" }}
                thumbColor={autoPlay ? "#f5dd4b" : "#f4f3f4"}
              />
            </View>
            
            <TouchableWithoutFeedback onPress={() => setShowSettings(false)}>
              <View style={styles.confirmButton}>
                <Text style={styles.confirmButtonText}>關閉</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    position: 'absolute',
    top: 120,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  bowlContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  bowlImage: {
    width: 280,
    height: 280,
    resizeMode: 'contain',
  },
  floatingText: {
    position: 'absolute',
    fontSize: 18,
    fontWeight: 'bold',
  },
  settingsButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    padding: 10,
  },
  statsButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    padding: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    backgroundColor: '#2a2a2a',
    padding: 20,
    borderRadius: 15,
    width: '85%',
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  statLabel: {
    fontSize: 16,
    color: 'white',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  settingLabel: {
    fontSize: 16,
    color: 'white',
  },
  confirmButton: {
    marginTop: 20,
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignSelf: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
}); 