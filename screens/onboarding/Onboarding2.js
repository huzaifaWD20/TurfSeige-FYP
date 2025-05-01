import React from 'react';
import OnboardingScreen from '../../components/OnboardingScreen';

const Onboarding2 = ({ navigation }) => {
  return (
    <OnboardingScreen
      imageSource={require('../../assets/screen2.jpg')}
      title="Exciting Gameplay"
      subtitle="Experience thrilling battles and strategic conquests"
      isLast={false}
      navigation={navigation}
      nextScreen="Onboarding3"
      currentScreen="Onboarding2"
    />
  );
};

export default Onboarding2;