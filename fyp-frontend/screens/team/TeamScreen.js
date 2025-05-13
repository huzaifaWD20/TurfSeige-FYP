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
import AsyncStorage from '@react-native-async-storage/async-storage'

const TeamScreen = ({ navigation }) => {
    const [teams, setTeams] = useState([])
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [invitePlayerID, setInvitePlayerID] = useState("")
    const [selectedTeam, setSelectedTeam] = useState(null)



    useEffect(() => {
        const fetchTeamStatus = async () => {
            try {
                const token = await AsyncStorage.getItem('accessToken')
                if (!token) {
                    console.warn('No JWT token found')
                    return
                }

                const response = await fetch('http://192.168.20.188:8000/api/teams/check-status/', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                })

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }

                const data = await response.json()
                console.log('Team status response:', data.team.id)

                if (data.status === 'captain' || data.status === 'member') {
                    setTeams([data.team])
                } else if (data.status === 'no_team') {
                    setTeams([])
                }
            } catch (error) {
                console.error('Error fetching team status:', error)
            }
        }

        fetchTeamStatus()
    }, [])

    const handleInvitePlayer = async () => {
        if (!invitePlayerID.trim() || !selectedTeam) {
            alert("Error", "Please enter a valid Player ID")
            return
        }

        console.log("Inviting player:", invitePlayerID, "to team:", selectedTeam.id) // ✅ CONSOLE LOG HERE

        try {
            const token = await AsyncStorage.getItem('accessToken')
            const response = await fetch(`http://192.168.20.188:8000/api/teams/${selectedTeam.id}/invite/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: invitePlayerID }),
            })

            const result = await response.json()

            if (!response.ok) {
                alert("Error", result.message || "Failed to send invitation")
                return
            }

            alert("Success", `Invitation sent to player ${invitePlayerID}`)
        } catch (error) {
            console.error("Invite error:", error)
            alert("Error", "Something went wrong. Try again.")
        } finally {
            setInvitePlayerID("")
            setShowInviteModal(false)
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
                        <Text style={styles.statValue}>{item.matches_played}</Text>
                        <Text style={styles.statLabel}>Played</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{item.wins}</Text>
                        <Text style={styles.statLabel}>Won</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{item.draws}</Text>
                        <Text style={styles.statLabel}>Draw</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{item.losses}</Text>
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
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() =>
                                navigation.navigate("BrowseTeamsScreen", {
                                    teamId: teams[0]?.id,
                                    teamName: teams[0]?.name,
                                })
                            }
                        >
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

                    {teams.length > 0 && Array.isArray(teams[0].matchHistory) && teams[0].matchHistory.length > 0 && (
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

            {/* Invite Modal */}
            <Modal visible={showInviteModal && selectedTeam !== null} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Invite Player</Text>
                        <TextInput
                            placeholder="Enter Player ID"
                            value={invitePlayerID}
                            onChangeText={setInvitePlayerID}
                            style={styles.input}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.modalButton} onPress={handleInvitePlayer}>
                                <Text style={styles.modalButtonText}>Send Invite</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setShowInviteModal(false)}>
                                <Text style={[styles.modalButtonText, { color: "#DC3545" }]}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        elevation: 10, // make sure this is enough
        zIndex: 9999,
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        backgroundColor: '#007BFF',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    cancelButton: {
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#DC3545',
    },
    modalButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
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
