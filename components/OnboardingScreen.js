import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ imageSource, title, subtitle, isLast, navigation, nextScreen, currentScreen }) => {
  const handleSkip = () => {
    navigation.navigate('Login'); // Assuming you have a Login screen
  };

  const handleNext = () => {
    if (isLast) {
      navigation.navigate('Login'); // Navigate to Login on the last screen
    } else {
      navigation.navigate(nextScreen);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={imageSource} style={styles.image} resizeMode="cover" />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>
        <View style={styles.dots}>
          <View style={[styles.dot, currentScreen === 'Onboarding1' && styles.activeDot]} />
          <View style={[styles.dot, currentScreen === 'Onboarding2' && styles.activeDot]} />
          <View style={[styles.dot, currentScreen === 'Onboarding3' && styles.activeDot]} />
          <View style={[styles.dot, currentScreen === 'Onboarding4' && styles.activeDot]} />
        </View>
        <TouchableOpacity onPress={handleNext}>
          <Text style={styles.next}>{isLast ? 'Get Started' : 'Next'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: width,
    height: height * 0.6,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  skip: {
    color: '#007BFF',
    fontSize: 16,
  },
  dots: {
    flexDirection: 'row',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#007BFF',
  },
  next: {
    color: '#007BFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;