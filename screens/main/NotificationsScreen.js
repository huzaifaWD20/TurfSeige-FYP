"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, SafeAreaView } from "react-native"
import { ChevronLeft, Bell } from "lucide-react-native"
import { useTeam } from "../../context/TeamContext"

const NotificationsScreen = ({ navigation }) => {
  const { getUserTeamInvitations, getUserMatchInvitations, respondToTeamInvitation, respondToMatchInvitation } =
    useTeam()

  const [teamInvitations, setTeamInvitations] = useState([])
  const [matchInvitations, setMatchInvitations] = useState([])

  useEffect(() => {
    // Get team invitations
    const teamInvites = getUserTeamInvitations()
    setTeamInvitations(teamInvites)

    // Get match invitations
    const matchInvites = getUserMatchInvitations()
    setMatchInvitations(matchInvites)
  }, [])

  const handleTeamInviteResponse = (invitationId, response) => {
    respondToTeamInvitation(invitationId, response)

    // Update local state
    setTeamInvitations(teamInvitations.filter((inv) => inv.id !== invitationId))
  }

  const handleMatchInviteResponse = (invitationId, response) => {
    respondToMatchInvitation(invitationId, response)

    // Update local state
    setMatchInvitations(matchInvitations.filter((inv) => inv.id !== invitationId))
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const renderTeamInviteItem = ({ item }) => (
    <View style={styles.inviteCard}>
      <Image source={{ uri: item.teamLogo }} style={styles.teamLogo} />
      <View style={styles.inviteInfo}>
        <Text style={styles.inviteTitle}>{item.teamName}</Text>
        <Text style={styles.inviteMessage}>has invited you to join their team</Text>
        <View style={styles.inviteActions}>
          <TouchableOpacity style={styles.declineButton} onPress={() => handleTeamInviteResponse(item.id, "declined")}>
            <Text style={styles.declineButtonText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptButton} onPress={() => handleTeamInviteResponse(item.id, "accepted")}>
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )

  const renderMatchInviteItem = ({ item }) => (
    <View style={styles.inviteCard}>
      <Image source={{ uri: "https://via.placeholder.com/100" }} style={styles.teamLogo} />
      <View style={styles.inviteInfo}>
        <Text style={styles.inviteTitle}>Match Invitation</Text>
        <Text style={styles.inviteMessage}>
          {item.teamName} vs {item.opponent}
        </Text>
        <Text style={styles.inviteDetails}>
          {formatDate(item.date)} at {formatTime(item.date)}
        </Text>
        <Text style={styles.inviteDetails}>{item.location}</Text>
        <View style={styles.inviteActions}>
          <TouchableOpacity style={styles.declineButton} onPress={() => handleMatchInviteResponse(item.id, "declined")}>
            <Text style={styles.declineButtonText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptButton} onPress={() => handleMatchInviteResponse(item.id, "accepted")}>
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#007BFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.placeholderView} />
      </View>

      {teamInvitations.length === 0 && matchInvitations.length === 0 ? (
        <View style={styles.emptyState}>
          <Bell color="#CCCCCC" size={48} />
          <Text style={styles.emptyStateTitle}>No Notifications</Text>
          <Text style={styles.emptyStateText}>You don't have any notifications at the moment.</Text>
        </View>
      ) : (
        <FlatList
          data={[...teamInvitations, ...matchInvitations]}
          renderItem={({ item }) =>
            item.teamName && item.opponent ? renderMatchInviteItem({ item }) : renderTeamInviteItem({ item })
          }
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.invitesList}
        />
      )}
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
  invitesList: {
    padding: 16,
  },
  inviteCard: {
    flexDirection: "row",
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
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  inviteInfo: {
    flex: 1,
  },
  inviteTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  inviteMessage: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
  },
  inviteDetails: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 2,
  },
  inviteActions: {
    flexDirection: "row",
    marginTop: 8,
  },
  declineButton: {
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  declineButtonText: {
    color: "#666666",
    fontSize: 14,
    fontWeight: "500",
  },
  acceptButton: {
    backgroundColor: "#007BFF",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  acceptButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
  },
})

export default NotificationsScreen
