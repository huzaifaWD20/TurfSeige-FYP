import React from 'react';
import OnboardingScreen from '../../components/OnboardingScreen';

const Onboarding4 = ({ navigation }) => {
  return (
    <OnboardingScreen
      imageSource={require('../../assets/screen1.jpg')}
      title="Ready to Play?"
      subtitle="Join now and start your adventure!"
      isLast={true}
      navigation={navigation}
      nextScreen="Login"
      currentScreen="Onboarding4"
    />
  );
};

export default Onboarding4;