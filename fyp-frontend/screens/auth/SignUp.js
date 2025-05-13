import React, { useState } from 'react';
import {
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Animated,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const SignUp = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  // const [position, setPosition] = useState("Defender"); // Initialize position state
  // const [skillLevel, setskillLevel] = useState("Beginner"); // Initialize position state
  // Animation value for tab indicator
  const tabAnimation = new Animated.Value(activeTab === 'email' ? 0 : 1);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    Animated.spring(tabAnimation, {
      toValue: tab === 'email' ? 0 : 1,
      useNativeDriver: false,
    }).start();
  };

  // Function to generate unique user ID
  const generateUniqueUserID = async () => {
    const usersCollection = collection(db, "users");
    const q = query(usersCollection, orderBy("userID", "desc"), limit(1));

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const lastUser = querySnapshot.docs[0].data();
        return lastUser.userID + 1;
    }
    return 1001; // Start user IDs from 1001
  };

  // Function to get default stats based on skill level
  const getDefaultStats = (skillLevel, position) => {
    // Base stats by skill level
    const statsBySkill = {
        Beginner: { PAC: 50, SHO: 45, PAS: 50, DRI: 48, DEF: 55, PHY: 50 },
        Intermediate: { PAC: 60, SHO: 55, PAS: 60, DRI: 58, DEF: 65, PHY: 60 },
        Advanced: { PAC: 70, SHO: 65, PAS: 70, DRI: 68, DEF: 75, PHY: 70 },
        Professional: { PAC: 80, SHO: 75, PAS: 80, DRI: 78, DEF: 85, PHY: 80 },
    };

    let stats = { ...statsBySkill[skillLevel] || statsBySkill["Beginner"] };

    // Position-based stat boosts
    const positionBoost = {
        Defender: { DEF: 5, PHY: 3 },
        Attacker: { SHO: 5, PAC: 4 },
        Goalkeeper: { DEF: 6, PAS: 3 }
    };

    if (positionBoost[position]) {
        Object.keys(positionBoost[position]).forEach(stat => {
            stats[stat] += positionBoost[position][stat];
        });
    }

    return stats;
  };

  // REMOVE: all Firebase imports and API functions like createUserWithEmailAndPassword, setDoc, etc.

    const handleSignUp = async () => {
        // Basic validation
        if (!name || !email || !password) {
            alert("Error", "Please fill in all fields.");
            return;
        }

        if (!validateEmail(email)) {
            setEmailError("Invalid email format");
            return;
        } else {
            setEmailError("");
        }

        try {
            const response = await fetch('http://192.168.20.188:8000/api/signup/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Success", "Account created successfully!");
                navigation.navigate('Login'); // or your login screen
            } else {
                alert("Error", data.error || "Failed to sign up");
            }
        } catch (error) {
            console.error("Signup error:", error);
            alert("Error", "Network error. Please try again.");
        }
    };



  const translateX = tabAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.5],
  });

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#007BFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Sign Up</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={styles.tab} 
            onPress={() => handleTabChange('email')}
          >
            <Text style={[styles.tabText, activeTab === 'email' && styles.activeTabText]}>
              Email
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.tab}
            onPress={() => handleTabChange('phone')}
          >
            <Text style={[styles.tabText, activeTab === 'phone' && styles.activeTabText]}>
              Phone Number
            </Text>
          </TouchableOpacity>
          <Animated.View 
            style={[styles.tabIndicator, { transform: [{ translateX }] }]} 
          />
        </View>

        {activeTab === 'email' ? (
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="person" size={20} color="#007BFF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="mail" size={20} color="#007BFF" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, emailError && styles.inputError]}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color="#007BFF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
              />
            </View>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <Text>Phone sign-up not yet implemented</Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.signUpButton}
          onPress={handleSignUp}
        >
          <Text style={styles.signUpButtonText}>
            Sign Up
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 40 : 20,
    marginBottom: 30,
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    color: '#6B7280',
  },
  activeTabText: {
    color: '#007BFF',
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    width: '50%',
    height: 2,
    backgroundColor: '#007BFF',
  },
  formContainer: {
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#1F2937',
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 5,
  },
  passwordToggle: {
    padding: 10,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginRight: 10,
    height: 50,
  },
  phoneInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#1F2937',
  },
  terms: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  link: {
    color: '#007BFF',
  },
  signUpButton: {
    backgroundColor: '#007BFF',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#6B7280',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 15,
  },
  socialButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#1F2937',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 16,
    color: '#6B7280',
  },
  loginLink: {
    fontSize: 16,
    color: '#007BFF',
    fontWeight: '600',
  },
});

export default SignUp;
