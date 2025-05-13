"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, SafeAreaView, TextInput } from "react-native"
import { ChevronLeft, Search, Users, X } from "lucide-react-native"
import AsyncStorage from '@react-native-async-storage/async-storage'

const BrowseTeamsScreen = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredTeams, setFilteredTeams] = useState([])
  const { teamId, teamName } = route.params;

    useEffect(() => {
        console.log("Received Team ID:", teamId);
        console.log("Received Team Name:", teamName);
    }, []);

    useEffect(() => {
        const fetchPublicTeams = async () => {
            try {
                const token = await AsyncStorage.getItem('accessToken')

                if (!token) {
                    console.warn("No access token found")
                    return
                }

                const queryParam = searchQuery.trim() ? `?search=${encodeURIComponent(searchQuery)}` : ""
                const response = await fetch(`http://192.168.20.188:8000/api/teams/public/${queryParam}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                })

                if (!response.ok) {
                    console.warn("Failed to fetch public teams")
                    return
                }

                const data = await response.json()
                setFilteredTeams(data)
            } catch (error) {
                console.error("Error fetching public teams:", error)
            }
        }

        fetchPublicTeams()
    }, [searchQuery])


  const renderTeamItem = ({ item }) => (
    <TouchableOpacity
      style={styles.teamCard}
          onPress={() => navigation.navigate("TeamMembersScreen", {
              opponentTeamId: item.id,
              opponentTeamName: item.name,
              requestingTeamId: teamId,
              requestingTeamName: teamName,
          })}
    >
      <Image source={{ uri: item.logo }} style={styles.teamLogo} />
      <View style={styles.teamInfo}>
        <Text style={styles.teamName}>{item.name}</Text>
        {item.description && <Text style={styles.teamDescription}>{item.description}</Text>}
        <View style={styles.memberInfo}>
          <Users color="#666666" size={16} />
          <Text style={styles.memberCount}>{item.members.length} members</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#007BFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Browse Teams</Text>
        <View style={styles.placeholderView} />
      </View>

      <View style={styles.searchContainer}>
        <Search color="#999999" size={20} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search teams..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <X color="#999999" size={20} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredTeams}
        renderItem={renderTeamItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.teamList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No teams found</Text>
          </View>
        }
      />
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    margin: 16,
    borderRadius: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  teamList: {
    padding: 16,
  },
  teamCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  teamLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  teamDescription: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberCount: {
    fontSize: 14,
    color: "#666666",
    marginLeft: 4,
  },
  emptyState: {
    padding: 24,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666666",
  },
})

export default BrowseTeamsScreen
