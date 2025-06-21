import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTodayStats } from '../utils/meditationStats';

export default function StatsModal({ visible, onClose }) {
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (visible) {
      console.log('StatsModal opened, loading stats...');
      loadStats();
    }
  }, [visible]);

  const loadStats = async () => {
    try {
      const todayStats = await getTodayStats();
      setStats(todayStats);
      console.log('Today stats loaded in modal:', todayStats);
    } catch (error) {
      console.error('Error loading today stats:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable 
        style={styles.modalContainer}
        onPress={onClose}
        android_disableSound={true}
        android_ripple={null}
      >
        <Pressable 
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
          android_disableSound={true}
          android_ripple={null}
        >
          <View style={styles.header}>
            <Text style={styles.title}>今日修行</Text>
            <Pressable 
              onPress={onClose} 
              style={styles.closeButton}
              android_disableSound={true}
              android_ripple={null}
            >
              <Ionicons name="close" size={24} color="#FFD700" />
            </Pressable>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats['慈悲心'] || 0}</Text>
              <Text style={styles.statLabel}>慈悲心</Text>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#2a2a2a',
    borderRadius: 15,
    width: '90%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  statsContainer: {
    paddingBottom: 5,
  },
  statItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    alignItems: 'center',
  },
  statValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  statLabel: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
  },
}); 