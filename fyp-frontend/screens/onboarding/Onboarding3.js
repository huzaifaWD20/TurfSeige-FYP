import React from 'react';
import OnboardingScreen from '../../components/OnboardingScreen';

const Onboarding3 = ({ navigation }) => {
  return (
    <OnboardingScreen
      imageSource={require('../../assets/screen3.jpg')}
      title="Multiplayer Battles"
      subtitle="Compete with friends and players worldwide"
      isLast={false}
      navigation={navigation}
      nextScreen="Onboarding4"
      currentScreen="Onboarding3"
    />
  );
};

export default Onboarding3;