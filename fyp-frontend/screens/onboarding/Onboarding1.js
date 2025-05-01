import React from 'react';
import OnboardingScreen from '../../components/OnboardingScreen';

const Onboarding1 = ({ navigation }) => {
  return (
    <OnboardingScreen
      imageSource={require('../../assets/screen1.jpg')}
      title="Turf Siege"
      subtitle="Welcome to the ultimate gaming experience"
      isLast={false}
      navigation={navigation}
      nextScreen="Onboarding2"
      currentScreen="Onboarding1"
    />
  );
};

export default Onboarding1;