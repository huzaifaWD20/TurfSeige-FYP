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
import { ChevronLeft, Search, X, Calendar, Clock, MapPin } from "lucide-react-native"
import { useSolo } from "../../context/SoloContext"

const BrowseSoloScreen = ({ navigation }) => {
  const { soloProfile, matchOpenings, sendJoinRequest } = useSolo()
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredOpenings, setFilteredOpenings] = useState([])
  const [selectedOpening, setSelectedOpening] = useState(null)
  const [selectedPosition, setSelectedPosition] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [filterPosition, setFilterPosition] = useState("All")

  useEffect(() => {
    filterOpenings()
  }, [searchQuery, matchOpenings, filterPosition])

  const filterOpenings = () => {
    let filtered = [...matchOpenings]

    // Filter by search query
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (opening) =>
          opening.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          opening.opponent.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by position
    if (filterPosition !== "All") {
      filtered = filtered
        .map((opening) => {
          return {
            ...opening,
            openPositions: opening.openPositions.filter((pos) => pos.role === filterPosition),
          }
        })
        .filter((opening) => opening.openPositions.length > 0)
    }

    setFilteredOpenings(filtered)
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

  const handleJoinRequest = () => {
    if (!selectedOpening || !selectedPosition) return

    setIsLoading(true)

    // Send join request
    sendJoinRequest(selectedOpening.id, selectedPosition.id, selectedPosition.role)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setIsModalVisible(false)
      setSelectedOpening(null)
      setSelectedPosition(null)
      Alert.alert("Request Sent", "Your request to join the match has been sent to the team captain.")
    }, 1000)
  }

  const renderOpeningItem = ({ item }) => (
    <View style={styles.openingCard}>
      <View style={styles.openingHeader}>
        <Image source={{ uri: item.teamLogo }} style={styles.teamLogo} />
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{item.teamName}</Text>
          <Text style={styles.matchDetails}>vs {item.opponent}</Text>
          <View style={styles.matchMeta}>
            <View style={styles.metaItem}>
              <Calendar color="#666666" size={14} />
              <Text style={styles.metaText}>{formatDate(item.date)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Clock color="#666666" size={14} />
              <Text style={styles.metaText}>{formatTime(item.date)}</Text>
            </View>
          </View>
          <View style={styles.metaItem}>
            <MapPin color="#666666" size={14} />
            <Text style={styles.metaText}>{item.location}</Text>
          </View>
        </View>
      </View>

      <View style={styles.formatBadge}>
        <Text style={styles.formatText}>{item.format}</Text>
      </View>

      <Text style={styles.positionsLabel}>Open Positions:</Text>
      <View style={styles.positionsList}>
        {item.openPositions.map((position) => (
          <TouchableOpacity
            key={position.id}
            style={[styles.positionItem, position.role === soloProfile.position && styles.matchingPositionItem]}
            onPress={() => {
              setSelectedOpening(item)
              setSelectedPosition(position)
              setIsModalVisible(true)
            }}
          >
            <Text style={[styles.positionText, position.role === soloProfile.position && styles.matchingPositionText]}>
              {position.role}
              {position.required ? " *" : ""}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.captainInfo}>
        <Text style={styles.captainLabel}>Captain:</Text>
        <Text style={styles.captainName}>{item.captain.name}</Text>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#007BFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Browse Matches</Text>
        <View style={styles.placeholderView} />
      </View>

      <View style={styles.searchContainer}>
        <Search color="#999999" size={20} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search teams or opponents..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <X color="#999999" size={20} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by position:</Text>
        <View style={styles.filterOptions}>
          <TouchableOpacity
            style={[styles.filterOption, filterPosition === "All" && styles.activeFilterOption]}
            onPress={() => setFilterPosition("All")}
          >
            <Text style={[styles.filterOptionText, filterPosition === "All" && styles.activeFilterOptionText]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterOption, filterPosition === "Defender" && styles.activeFilterOption]}
            onPress={() => setFilterPosition("Defender")}
          >
            <Text style={[styles.filterOptionText, filterPosition === "Defender" && styles.activeFilterOptionText]}>
              Defender
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterOption, filterPosition === "Attacker" && styles.activeFilterOption]}
            onPress={() => setFilterPosition("Attacker")}
          >
            <Text style={[styles.filterOptionText, filterPosition === "Attacker" && styles.activeFilterOptionText]}>
              Attacker
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterOption, filterPosition === "Goalkeeper" && styles.activeFilterOption]}
            onPress={() => setFilterPosition("Goalkeeper")}
          >
            <Text style={[styles.filterOptionText, filterPosition === "Goalkeeper" && styles.activeFilterOptionText]}>
              Goalkeeper
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredOpenings}
        renderItem={renderOpeningItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.openingsList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No match openings found</Text>
          </View>
        }
      />

      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Join Match</Text>

            {selectedOpening && (
              <View style={styles.modalMatchInfo}>
                <Text style={styles.modalTeamName}>{selectedOpening.teamName}</Text>
                <Text style={styles.modalMatchDetails}>vs {selectedOpening.opponent}</Text>
                <View style={styles.modalMatchMeta}>
                  <View style={styles.modalMetaItem}>
                    <Calendar color="#666666" size={16} />
                    <Text style={styles.modalMetaText}>{formatDate(selectedOpening.date)}</Text>
                  </View>
                  <View style={styles.modalMetaItem}>
                    <Clock color="#666666" size={16} />
                    <Text style={styles.modalMetaText}>{formatTime(selectedOpening.date)}</Text>
                  </View>
                </View>
                <View style={styles.modalMetaItem}>
                  <MapPin color="#666666" size={16} />
                  <Text style={styles.modalMetaText}>{selectedOpening.location}</Text>
                </View>
              </View>
            )}

            {selectedPosition && (
              <View style={styles.modalPositionInfo}>
                <Text style={styles.modalSectionTitle}>Position:</Text>
                <View style={styles.modalPositionBadge}>
                  <Text style={styles.modalPositionText}>{selectedPosition.role}</Text>
                </View>
                {selectedPosition.required && (
                  <Text style={styles.requiredText}>This position is required by the team</Text>
                )}
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsModalVisible(false)
                  setSelectedOpening(null)
                  setSelectedPosition(null)
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.joinButton, isLoading && styles.disabledButton]}
                onPress={handleJoinRequest}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.joinButtonText}>Send Request</Text>
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
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  filterOption: {
    backgroundColor: "#F0F0F0",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilterOption: {
    backgroundColor: "#007BFF",
  },
  filterOptionText: {
    fontSize: 14,
    color: "#666666",
  },
  activeFilterOptionText: {
    color: "#FFFFFF",
  },
  openingsList: {
    padding: 16,
  },
  openingCard: {
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
  openingHeader: {
    flexDirection: "row",
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
  matchDetails: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
  },
  matchMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#666666",
    marginLeft: 4,
  },
  formatBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(0, 123, 255, 0.1)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  formatText: {
    fontSize: 12,
    color: "#007BFF",
    fontWeight: "500",
  },
  positionsLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  positionsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  positionItem: {
    backgroundColor: "#F0F0F0",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  positionText: {
    fontSize: 14,
    color: "#666666",
  },
  matchingPositionItem: {
    backgroundColor: "rgba(0, 123, 255, 0.1)",
  },
  matchingPositionText: {
    color: "#007BFF",
  },
  captainInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  captainLabel: {
    fontSize: 12,
    color: "#666666",
    marginRight: 4,
  },
  captainName: {
    fontSize: 12,
    fontWeight: "500",
  },
  emptyState: {
    padding: 24,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666666",
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
    marginBottom: 16,
  },
  modalTeamName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  modalMatchDetails: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 8,
  },
  modalMatchMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
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
  modalPositionInfo: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  modalPositionBadge: {
    backgroundColor: "rgba(0, 123, 255, 0.1)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  modalPositionText: {
    fontSize: 16,
    color: "#007BFF",
    fontWeight: "500",
  },
  requiredText: {
    fontSize: 14,
    color: "#FF4A4A",
    fontStyle: "italic",
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
  joinButton: {
    flex: 1,
    backgroundColor: "#007BFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginLeft: 8,
  },
  joinButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
  },
})

export default BrowseSoloScreen
