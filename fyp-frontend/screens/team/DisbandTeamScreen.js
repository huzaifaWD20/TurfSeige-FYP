"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from "react-native"
import { ChevronLeft, AlertTriangle } from "lucide-react-native"

const DisbandTeamScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleDisbandTeam = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      Alert.alert("Team Disbanded", "Your team has been successfully disbanded.", [
        {
          text: "OK",
          onPress: () => navigation.navigate("HomeScreen"),
        },
      ])
    }, 1500)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#007BFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Disband Team</Text>
        <View style={styles.placeholderView} />
      </View>

      <View style={styles.content}>
        <View style={styles.warningContainer}>
          <AlertTriangle color="#FF4A4A" size={48} />
          <Text style={styles.warningTitle}>Warning</Text>
          <Text style={styles.warningText}>
            Are you sure you want to disband this team? This action cannot be undone.
          </Text>
          <Text style={styles.warningDetails}>
            All team data, including member information, match history, and settings will be permanently deleted.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>No, Go Back</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.disbandButton} onPress={handleDisbandTeam} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.disbandButtonText}>Yes, Disband</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    marginTop: 35,
  },
  backButton: {
    padding: 8,
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FF4A4A",
    flex: 1,
    textAlign: "center",
  },
  placeholderView: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
  },
  warningContainer: {
    alignItems: "center",
    marginTop: 48,
  },
  warningTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FF4A4A",
    marginTop: 16,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 24,
  },
  warningDetails: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
  },
  buttonContainer: {
    marginBottom: 24,
  },
  cancelButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  cancelButtonText: {
    color: "#333333",
    fontSize: 16,
    fontWeight: "500",
  },
  disbandButton: {
    backgroundColor: "#FF4A4A",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  disbandButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
})

export default DisbandTeamScreen
