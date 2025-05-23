﻿"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Switch, SafeAreaView } from "react-native"
import { ChevronLeft } from "lucide-react-native"
import AsyncStorage from '@react-native-async-storage/async-storage';


const TeamSettingsScreen = ({ navigation, route }) => {
    const { teamId } = route.params // get team ID from route
    const [isPublic, setIsPublic] = useState(true)
    const [requireApproval, setRequireApproval] = useState(true)

  const handleDisbandTeam = () => {
      navigation.navigate("DisbandTeamScreen", { teamId })
    }

    const handleTogglePublic = async (value) => {
        setIsPublic(value);
        console.log("Setting is_public to:", value); // 👈 Logs current toggle value

        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) {
                console.error("Access token not found");
                return;
            }

            const response = await fetch(`http://192.168.20.188:8000/api/teams/${teamId}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    is_public: value,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Error updating team:", data.error || "Unknown error");
            } else {
                console.log("Team updated successfully:", data);
            }

        } catch (error) {
            console.error("Failed to update team:", error);
        }
    };



  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#007BFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Team Settings</Text>
        <View style={styles.placeholderView} />
      </View>

      <View style={styles.content}>
        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingTitle}>Public Team</Text>
            <Text style={styles.settingDescription}>Allow other users to find and request to join your team</Text>
          </View>
                  <Switch
                      value={isPublic}
                      onValueChange={handleTogglePublic}
                      trackColor={{ false: "#E5E5E5", true: "#007BFF" }}
                      thumbColor="#FFFFFF"
                  />
        </View>

        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingTitle}>Require Captain Approval</Text>
            <Text style={styles.settingDescription}>New members must be approved by the team captain</Text>
          </View>
          <Switch
            value={requireApproval}
            onValueChange={setRequireApproval}
            trackColor={{ false: "#E5E5E5", true: "#007BFF" }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.dangerZone}>
          <Text style={styles.dangerZoneTitle}>Danger Zone</Text>
          <TouchableOpacity style={styles.disbandButton} onPress={handleDisbandTeam}>
            <Text style={styles.disbandButtonText}>Disband Team</Text>
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
    color: "#007BFF",
    flex: 1,
    textAlign: "center",
  },
  placeholderView: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
    color: "#333333",
  },
  settingDescription: {
    fontSize: 14,
    color: "#666666",
    maxWidth: "80%",
  },
  dangerZone: {
    marginTop: 48,
  },
  dangerZoneTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FF4A4A",
    marginBottom: 16,
  },
  disbandButton: {
    backgroundColor: "rgba(255, 74, 74, 0.1)",
    borderWidth: 1,
    borderColor: "#FF4A4A",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  disbandButtonText: {
    color: "#FF4A4A",
    fontSize: 16,
    fontWeight: "500",
  },
})

export default TeamSettingsScreen
