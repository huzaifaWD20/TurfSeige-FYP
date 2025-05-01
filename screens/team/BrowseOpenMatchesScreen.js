"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native"
import { ChevronLeft, Search, X, Calendar, Clock, MapPin, Users } from "lucide-react-native"
import { useTeam } from "../../context/TeamContext"

const BrowseOpenMatchesScreen = ({ navigation, route }) => {
  const { teamId } = route.params || {}
  const { openMatches, getTeamById, createMatchRequest } = useTeam()

  const [team, setTeam] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredMatches, setFilteredMatches] = useState([])
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const teamData = getTeamById(teamId)
    setTeam(teamData)
    filterMatches()
  }, [teamId, searchQuery, openMatches])

  const filterMatches = () => {
    let filtered = [...openMatches]

    // Filter out own team's matches
    filtered = filtered.filter((match) => match.teamId !== teamId)

    // Filter by search query
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (match) =>
          match.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          match.location.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredMatches(filtered)
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

  const handleSendRequest = () => {
    if (!selectedMatch) return

    setIsLoading(true)

    // Create match request data
    const requestData = {
      requestingTeamId: teamId,
      requestingTeamName: team.name,
      requestingTeamLogo: team.logo,
      targetTeamId: selectedMatch.teamId,
      targetTeamName: selectedMatch.teamName,
      targetTeamLogo: selectedMatch.teamLogo,
      date: selectedMatch.date,
      location: selectedMatch.location,
      format: selectedMatch.format,
      paymentCondition: selectedMatch.paymentCondition,
      message: message,
    }

    // Create match request
    createMatchRequest(requestData)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setIsModalVisible(false)
      setSelectedMatch(null)
      setMessage("")
      Alert.alert("Request Sent", "Your match request has been sent to the team captain.", [
        {
          text: "OK",
          onPress: () => navigation.navigate("MatchRequestsScreen", { tab: "outgoing" }),
        },
      ])
    }, 1000)
  }

  const renderMatchItem = ({ item }) => (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={() => {
        setSelectedMatch(item)
        setIsModalVisible(true)
      }}
    >
      <View style={styles.matchHeader}>
        <Image source={{ uri: item.teamLogo }} style={styles.teamLogo} />
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{item.teamName}</Text>
          <View style={styles.formatBadge}>
            <Text style={styles.formatText}>{item.format}</Text>
          </View>
        </View>
      </View>

      <View style={styles.matchDetails}>
        <View style={styles.detailItem}>
          <Calendar color="#666666" size={16} />
          <Text style={styles.detailText}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Clock color="#666666" size={16} />
          <Text style={styles.detailText}>{formatTime(item.date)}</Text>
        </View>
        <View style={styles.detailItem}>
          <MapPin color="#666666" size={16} />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
      </View>

      <View style={styles.teamStrength}>
        <Users color="#666666" size={16} />
        <Text style={styles.strengthText}>
          {item.confirmedPlayers} / {item.requiredPlayers} players confirmed
        </Text>
      </View>

      <View style={styles.paymentCondition}>
        <Text style={styles.paymentLabel}>Payment:</Text>
        <Text style={styles.paymentText}>
          {item.paymentCondition === "lose_to_pay"
            ? "Losing team pays"
            : item.paymentCondition === "50_50"
              ? "50/50 split"
              : "70/30 split"}
        </Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#007BFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Open Matches</Text>
        <View style={styles.placeholderView} />
      </View>

      <View style={styles.searchContainer}>
        <Search color="#999999" size={20} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search teams or locations..."
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
        data={filteredMatches}
        renderItem={renderMatchItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.matchesList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No open matches found</Text>
            <TouchableOpacity
              style={styles.postMatchButton}
              onPress={() => navigation.navigate("PostMatchScreen", { teamId })}
            >
              <Text style={styles.postMatchButtonText}>Post a Match</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Request Match</Text>

            {selectedMatch && (
              <View style={styles.modalMatchInfo}>
                <Image source={{ uri: selectedMatch.teamLogo }} style={styles.modalTeamLogo} />
                <Text style={styles.modalTeamName}>{selectedMatch.teamName}</Text>
                <View style={styles.modalMatchMeta}>
                  <View style={styles.modalMetaItem}>
                    <Calendar color="#666666" size={16} />
                    <Text style={styles.modalMetaText}>{formatDate(selectedMatch.date)}</Text>
                  </View>
                  <View style={styles.modalMetaItem}>
                    <Clock color="#666666" size={16} />
                    <Text style={styles.modalMetaText}>{formatTime(selectedMatch.date)}</Text>
                  </View>
                </View>
                <View style={styles.modalMetaItem}>
                  <MapPin color="#666666" size={16} />
                  <Text style={styles.modalMetaText}>{selectedMatch.location}</Text>
                </View>
                <View style={styles.modalFormatBadge}>
                  <Text style={styles.modalFormatText}>{selectedMatch.format}</Text>
                </View>
              </View>
            )}

            <View style={styles.messageContainer}>
              <Text style={styles.messageLabel}>Message (Optional)</Text>
              <TextInput
                style={styles.messageInput}
                placeholder="Add a message to the team captain"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsModalVisible(false)
                  setSelectedMatch(null)
                  setMessage("")
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.requestButton, isLoading && styles.disabledButton]}
                onPress={handleSendRequest}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.requestButtonText}>Send Request</Text>
                )}
              </TouchableOpacity>
            </View>
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
  matchesList: {
    padding: 16,
  },
  matchCard: {
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
  matchHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  teamLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  formatBadge: {
    backgroundColor: "rgba(0, 123, 255, 0.1)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  formatText: {
    fontSize: 12,
    color: "#007BFF",
    fontWeight: "500",
  },
  matchDetails: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
  },
  teamStrength: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  strengthText: {
    fontSize: 14,
    marginLeft: 8,
  },
  paymentCondition: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 4,
  },
  paymentText: {
    fontSize: 14,
    color: "#666666",
  },
  emptyState: {
    padding: 24,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 16,
  },
  postMatchButton: {
    backgroundColor: "#28A745",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    width: "100%",
  },
  postMatchButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  modalMatchInfo: {
    alignItems: "center",
    marginBottom: 16,
  },
  modalTeamLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 12,
  },
  modalTeamName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  modalMatchMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 4,
  },
  modalMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 8,
  },
  modalMetaText: {
    fontSize: 14,
    color: "#666666",
    marginLeft: 8,
  },
  modalFormatBadge: {
    backgroundColor: "rgba(0, 123, 255, 0.1)",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginTop: 8,
  },
  modalFormatText: {
    fontSize: 14,
    color: "#007BFF",
    fontWeight: "500",
  },
  messageContainer: {
    marginBottom: 24,
  },
  messageLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  messageInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    height: 100,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F0F0F0",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "500",
  },
  requestButton: {
    flex: 1,
    backgroundColor: "#007BFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginLeft: 8,
  },
  requestButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
  },
})

export default BrowseOpenMatchesScreen
