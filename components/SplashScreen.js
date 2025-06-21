import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.bowlContainer}>
        <Image 
          source={require('../assets/bowl.png')} 
          style={styles.bowlImage} 
        />
        <Text style={styles.bowlText}>送缽素想</Text>
      </View>
      <Text style={styles.appName}>送缽</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bowlContainer: {
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#4A69BD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  bowlImage: {
    width: 120,
    height: 80,
    marginBottom: 10,
  },
  bowlText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default SplashScreen; 