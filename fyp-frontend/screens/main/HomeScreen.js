"use client"

import { useEffect, useRef, useState } from "react"
import { StyleSheet, View, Text, TouchableOpacity, Image, SafeAreaView, Dimensions, Animated } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useNavigation } from "@react-navigation/native"
import { Bell } from "lucide-react-native"
import { useTeam } from "../../context/TeamContext"

const { width, height } = Dimensions.get("window")

const HomeScreen = () => {
  const animatedValue = useRef(new Animated.Value(0)).current
  const navigation = useNavigation()
  const { getUserTeamInvitations, getUserMatchInvitations, currentUser } = useTeam()
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: false,
      }),
    )
    animation.start()
    return () => animation.stop()
  }, [])

  useEffect(() => {
    // Count notifications
    const teamInvites = getUserTeamInvitations()
    const matchInvites = getUserMatchInvitations()
    setNotificationCount(teamInvites.length + matchInvites.length)
  }, [])

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["#DCEFFF", "#c8e1f7", "#DCEFFF"],
  })

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.animatedBackground, { backgroundColor }]} />

      <View style={styles.topCard}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={require("../../assets/logo.png")} style={styles.logo} />
            <Text style={styles.logoText}>TurfSeige</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate("NotificationsScreen")}
          >
            <Bell color="#007BFF" size={24} />
            {notificationCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationCount}>{notificationCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.welcomeText}>Welcome, {currentUser.name}</Text>
        <Text style={styles.title}>Ready to Play?</Text>
        <Text style={styles.subtitle}>Find Your Match & Hit the Field</Text>

        {/* Find Match Button */}
        <TouchableOpacity style={styles.buttonWrapper} onPress={() => navigation.navigate("TeamOrSolo")}>
          <LinearGradient colors={["#4F6EFF", "#4066E0"]} style={styles.buttonGradient}>
            <Text style={styles.buttonText}>Find Match</Text>
            <MaterialCommunityIcons name="soccer" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Browse Open Matches Button */}
        <TouchableOpacity
          style={styles.secondaryButtonWrapper}
          onPress={() => navigation.navigate("BrowseOpenMatchesScreen", { teamId: "1" })}
        >
          <View style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Browse Open Matches</Text>
            <MaterialCommunityIcons name="magnify" size={20} color="#007BFF" />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FE",
  },
  animatedBackground: {
    position: "absolute",
    width: width,
    height: height * 2,
  },
  topCard: {
    backgroundColor: "white",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    padding: 16,
    paddingTop: 60,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  logoText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#007BFF",
  },
  notificationButton: {
    padding: 8,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#FF4A4A",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationCount: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  buttonWrapper: {
    width: "80%",
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    marginVertical: 10,
    shadowColor: "#007BFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  secondaryButtonWrapper: {
    width: "80%",
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    marginVertical: 10,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 25,
  },
  secondaryButtonText: {
    color: "#007BFF",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default HomeScreen
