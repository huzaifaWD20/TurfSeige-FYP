"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  FlatList,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from "react-native"
import { ChevronLeft, Plus, Users, Search, Calendar, MapPin } from "lucide-react-native"
import { useTeam } from "../../context/TeamContext"

const TeamScreen = ({ navigation }) => {
  const { getUserTeams, isUserInTeam, getUserTeamInvitations, respondToTeamInvitation, currentUser } = useTeam()

  const [teams, setTeams] = useState([])
  const [teamInvitations, setTeamInvitations] = useState([])
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [invitePlayerID, setInvitePlayerID] = useState("")
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [showInvitationModal, setShowInvitationModal] = useState(false)
  const [selectedInvitation, setSelectedInvitation] = useState(null)

  useEffect(() => {
    // Get user's teams
    const userTeams = getUserTeams()
    setTeams(userTeams)

    // Get team invitations
    const invitations = getUserTeamInvitations()
    setTeamInvitations(invitations)

    // Show invitation modal if there are pending invitations
    if (invitations.length > 0 && !showInvitationModal) {
      setSelectedInvitation(invitations[0])
      setShowInvitationModal(true)
    }
  }, [])

  const handleInvitePlayer = () => {
    if (!invitePlayerID.trim() || !selectedTeam) {
      Alert.alert("Error", "Please enter a valid Player ID")
      return
    }

    // In a real app, this would send an invitation to the player
    Alert.alert("Success", `Invitation sent to player ${invitePlayerID}`)
    setInvitePlayerID("")
    setShowInviteModal(false)
  }

  const handleRespondToInvitation = (response) => {
    if (!selectedInvitation) return

    respondToTeamInvitation(selectedInvitation.id, response)

    // Update local state
    setTeamInvitations(teamInvitations.filter((inv) => inv.id !== selectedInvitation.id))
    setSelectedInvitation(null)
    setShowInvitationModal(false)

    // Refresh teams if accepted
    if (response === "accepted") {
      setTeams(getUserTeams())
    }
  }

  const renderTeamItem = ({ item }) => (
    <TouchableOpacity
      style={styles.teamCard}
      onPress={() => navigation.navigate("TeamDetailsScreen", { teamId: item.id })}
    >
      <Image source={{ uri: item.logo }} style={styles.teamLogo} />
      <View style={styles.teamInfo}>
        <Text style={styles.teamName}>{item.name}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.stats.played}</Text>
            <Text style={styles.statLabel}>Played</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.stats.won}</Text>
            <Text style={styles.statLabel}>Won</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.stats.draw}</Text>
            <Text style={styles.statLabel}>Draw</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.stats.lost}</Text>
            <Text style={styles.statLabel}>Lost</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )

  const renderMatchItem = ({ item }) => {
    const resultColor = item.result === "win" ? "#28A745" : item.result === "loss" ? "#DC3545" : "#FFC107"

    return (
      <View style={styles.matchItem}>
        <View style={[styles.resultIndicator, { backgroundColor: resultColor }]} />
        <View style={styles.matchInfo}>
          <Text style={styles.matchOpponent}>vs {item.opponent}</Text>
          <Text style={styles.matchScore}>{item.score}</Text>
          <View style={styles.matchMeta}>
            <View style={styles.metaItem}>
              <Calendar color="#666666" size={14} />
              <Text style={styles.metaText}>
                {new Date(item.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <MapPin color="#666666" size={14} />
              <Text style={styles.metaText}>{item.location}</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#007BFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Teams</Text>
        <View style={styles.placeholderView} />
      </View>

      {teams.length > 0 ? (
        <ScrollView style={styles.content}>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("BrowseTeamsScreen")}>
              <Search color="#007BFF" size={20} />
              <Text style={styles.actionButtonText}>Browse Teams</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("MatchRequestsScreen")}>
              <Calendar color="#007BFF" size={20} />
              <Text style={styles.actionButtonText}>Match Requests</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={teams}
            renderItem={renderTeamItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.teamList}
            scrollEnabled={false}
          />

          {teams.length > 0 && teams[0].matchHistory.length > 0 && (
            <View style={styles.matchHistorySection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Matches</Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("TeamDetailsScreen", { teamId: teams[0].id, initialTab: "matches" })
                  }
                >
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={teams[0].matchHistory.slice(0, 3)}
                renderItem={renderMatchItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
          )}

          {teams.map((team) => (
            <View key={team.id} style={styles.teamActions}>
              <TouchableOpacity
                style={styles.inviteButton}
                onPress={() => {
                  setSelectedTeam(team)
                  setShowInviteModal(true)
                }}
              >
                <Users color="#FFFFFF" size={20} />
                <Text style={styles.inviteButtonText}>Invite Players</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.postMatchButton}
                onPress={() => navigation.navigate("PostMatchScreen", { teamId: team.id })}
              >
                <Calendar color="#FFFFFF" size={20} />
                <Text style={styles.postMatchButtonText}>Post Match</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Image source={{ uri: "https://via.placeholder.com/200" }} style={styles.emptyStateImage} />
          <Text style={styles.emptyStateTitle}>No Teams Yet</Text>
          <Text style={styles.emptyStateText}>Create a team to start playing with friends</Text>

          <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate("CreateTeamScreen")}>
            <Plus color="#FFFFFF" size={20} />
            <Text style={styles.createButtonText}>Create Team</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Invite Player Modal */}
      <Modal
        visible={showInviteModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowInviteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Invite Player</Text>
            <Text style={styles.modalSubtitle}>
              Enter the Player ID of the person you want to invite to {selectedTeam?.name}
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Player ID (e.g., PLAYER123)"
              value={invitePlayerID}
              onChangeText={setInvitePlayerID}
              autoCapitalize="characters"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setInvitePlayerID("")
                  setShowInviteModal(false)
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalConfirmButton} onPress={handleInvitePlayer}>
                <Text style={styles.modalConfirmButtonText}>Send Invite</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Team Invitation Modal */}
      <Modal
        visible={showInvitationModal && selectedInvitation !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowInvitationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Team Invitation</Text>

            {selectedInvitation && (
              <>
                <View style={styles.invitationDetails}>
                  <Image source={{ uri: "https://via.placeholder.com/100" }} style={styles.invitationTeamLogo} />
                  <Text style={styles.invitationTeamName}>{selectedInvitation.teamName}</Text>
                  <Text style={styles.invitationText}>has invited you to join their team!</Text>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => handleRespondToInvitation("declined")}
                  >
                    <Text style={styles.modalCancelButtonText}>Decline</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalConfirmButton}
                    onPress={() => handleRespondToInvitation("accepted")}
                  >
                    <Text style={styles.modalConfirmButtonText}>Accept</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  actionButtons: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: "#007BFF",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  content: {
    flex: 1,
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
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007BFF",
  },
  statLabel: {
    fontSize: 12,
    color: "#666666",
  },
  matchHistorySection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  seeAllText: {
    fontSize: 14,
    color: "#007BFF",
  },
  matchItem: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    marginBottom: 8,
    overflow: "hidden",
  },
  resultIndicator: {
    width: 4,
    backgroundColor: "#28A745", // Default to green (win)
  },
  matchInfo: {
    flex: 1,
    padding: 12,
  },
  matchOpponent: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  matchScore: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  matchMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  metaText: {
    fontSize: 12,
    color: "#666666",
    marginLeft: 4,
  },
  teamActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  inviteButton: {
    backgroundColor: "#007BFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  inviteButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  postMatchButton: {
    backgroundColor: "#28A745",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  postMatchButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyStateImage: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: "#007BFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    shadowColor: "#007BFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginRight: 8,
  },
  modalCancelButtonText: {
    color: "#666666",
    fontSize: 14,
    fontWeight: "500",
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: "#007BFF",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginLeft: 8,
  },
  modalConfirmButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  invitationDetails: {
    alignItems: "center",
    marginBottom: 24,
  },
  invitationTeamLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  invitationTeamName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  invitationText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
})

export default TeamScreen
