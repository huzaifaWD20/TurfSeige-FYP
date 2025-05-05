"use client"

import { useState } from "react"
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
  ScrollView,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTeam } from "../../context/TeamContext"

const { width } = Dimensions.get("window")

const Login = ({ navigation }) => {
  const { setUser } = useTeam()
  const [activeTab, setActiveTab] = useState("email")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const tabAnimation = new Animated.Value(activeTab === "email" ? 0 : 1)

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    Animated.spring(tabAnimation, {
      toValue: tab === "email" ? 0 : 1,
      useNativeDriver: false,
    }).start()
  }

  const translateX = tabAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.5],
  })
    const handleLogin = async () => {
        setIsLoading(true)

        if (activeTab === "email") {
            if (!email || !password) {
                Alert.alert("Error", "Please enter both email and password")
                setIsLoading(false)
                return
            }

            try {
                const response = await fetch("http://192.168.2.109:8000/api/login/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                })

                const data = await response.json()

                if (response.ok) {
                    setUser({
                        id: data._id,
                        name: data.name,
                        avatar: data.avatar || "https://via.placeholder.com/100",
                        playerID: data.playerID || "PLAYERXXX",
                    })
                    setIsLoading(false)
                    navigation.replace("Main")
                } else {
                    Alert.alert("Login Failed", data.message || "Invalid credentials")
                    setIsLoading(false)
                }
            } catch (error) {
                Alert.alert("Error", "Something went wrong. Please try again.")
                console.error("Login error:", error)
                setIsLoading(false)
            }
        } else {
            if (!phone || phone.length < 9) {
                Alert.alert("Error", "Please enter a valid phone number")
                setIsLoading(false)
                return
            }
            Alert.alert("Info", "Phone login not implemented yet")
            setIsLoading(false)
        }
    }

  //const handleLogin = () => {
  //  setIsLoading(true)

  //  if (activeTab === "email") {
  //    if (!email || !password) {
  //      Alert.alert("Error", "Please enter both email and password")
  //      setIsLoading(false)
  //      return
  //    }

  //    // Hardcoded credentials check
  //    if (email === "admin@example.com" && password === "admin") {
  //      // Admin user (team captain)
  //      setUser({
  //        id: "1",
  //        name: "John Doe",
  //        avatar: "https://via.placeholder.com/100",
  //        playerID: "PLAYER001",
  //      })
  //      setIsLoading(false)
  //      navigation.replace("Main")
  //    } else if (email === "user@example.com" && password === "user") {
  //      // Regular user
  //      setUser({
  //        id: "2",
  //        name: "Jane Smith",
  //        avatar: "https://via.placeholder.com/100",
  //        playerID: "PLAYER002",
  //      })
  //      setIsLoading(false)
  //      navigation.replace("Main")
  //    } else {
  //      setIsLoading(false)
  //      Alert.alert("Login Failed", "Invalid credentials")
  //    }
  //  } else {
  //    if (!phone || phone.length < 9) {
  //      Alert.alert("Error", "Please enter a valid phone number")
  //      setIsLoading(false)
  //      return
  //    }
  //    setIsLoading(false)
  //    Alert.alert("Info", "Phone login not implemented yet")
  //  }
  //}

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#007BFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Log In</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity style={styles.tab} onPress={() => handleTabChange("email")}>
            <Text style={[styles.tabText, activeTab === "email" && styles.activeTabText]}>Email</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab} onPress={() => handleTabChange("phone")}>
            <Text style={[styles.tabText, activeTab === "phone" && styles.activeTabText]}>Phone Number</Text>
          </TouchableOpacity>
          <Animated.View style={[styles.tabIndicator, { transform: [{ translateX }] }]} />
        </View>

        {activeTab === "email" ? (
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail" size={20} color="#007BFF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color="#007BFF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.passwordToggle}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#007BFF" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => Alert.alert("Info", "Reset password functionality coming soon")}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <View style={styles.phoneInputContainer}>
              <TouchableOpacity style={styles.countryCode}>
                <Ionicons name="flag" size={20} color="#007BFF" />
                <Text style={styles.countryCodeText}>+855</Text>
                <Ionicons name="chevron-down" size={16} color="#666" />
              </TouchableOpacity>
              <TextInput
                style={styles.phoneInput}
                placeholder="086 000 000"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                editable={!isLoading}
              />
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.loginButtonText}>{isLoading ? "Logging in..." : "Log in"}</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignUp")} disabled={isLoading}>
            <Text style={styles.signUpLink}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Platform.OS === "ios" ? 40 : 20,
    marginBottom: 30,
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007BFF",
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 20,
    position: "relative",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  tabText: {
    fontSize: 16,
    color: "#6B7280",
  },
  activeTabText: {
    color: "#007BFF",
    fontWeight: "600",
  },
  tabIndicator: {
    position: "absolute",
    bottom: -1,
    width: "50%",
    height: 2,
    backgroundColor: "#007BFF",
  },
  formContainer: {
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  passwordToggle: {
    padding: 10,
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  countryCode: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    gap: 5,
  },
  countryCodeText: {
    fontSize: 16,
    color: "#1F2937",
  },
  phoneInput: {
    flex: 1,
    height: 50,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#1F2937",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 5,
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#007BFF",
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#007BFF",
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loginButtonDisabled: {
    backgroundColor: "#B0C4DE",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
  },
  footerText: {
    fontSize: 16,
    color: "#6B7280",
  },
  signUpLink: {
    fontSize: 16,
    color: "#007BFF",
    fontWeight: "600",
  },
})

export default Login
