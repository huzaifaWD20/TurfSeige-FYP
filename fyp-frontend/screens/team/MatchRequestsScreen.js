"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, SafeAreaView, Alert } from "react-native"
import { ChevronLeft, Calendar, MapPin, Clock, CheckCircle, XCircle, User } from "lucide-react-native"

const MatchRequestsScreen = ({ navigation, route }) => {
  const { tab = "incoming" } = route.params || {}

  const [activeTab, setActiveTab] = useState(tab)
  const [activeSubTab, setActiveSubTab] = useState("team")

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

  const handleAcceptRequest = (requestId) => {
    respondToMatchRequest(requestId, "accepted")
    Alert.alert("Request Accepted", "The match has been added to your schedule.")
  }

  const handleDeclineRequest = (requestId) => {
    respondToMatchRequest(requestId, "declined")
  }

  const handleCancelRequest = (requestId) => {
    Alert.alert("Cancel Request", "Are you sure you want to cancel this match request?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: () => cancelMatchRequest(requestId),
      },
    ])
  }

  const handleAcceptSoloRequest = (requestId) => {
    respondToSoloRequest(requestId, "accepted")
    Alert.alert("Request Accepted", "The player has been added to the match.")
  }

  const handleDeclineSoloRequest = (requestId) => {
    respondToSoloRequest(requestId, "declined")
    Alert.alert("Request Declined", "The player has been notified.")
  }

  const renderIncomingTeamItem = ({ item }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <Image source={{ uri: item.requestingTeamLogo }} style={styles.teamLogo} />
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{item.requestingTeamName}</Text>
          <Text style={styles.requestType}>Match Request</Text>
        </View>
      </View>

      <View style={styles.requestDetails}>
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

      {item.message && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageLabel}>Message:</Text>
          <Text style={styles.messageText}>{item.message}</Text>
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.declineButton} onPress={() => handleDeclineRequest(item.id)}>
          <XCircle color="#FF4A4A" size={20} />
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.acceptButton} onPress={() => handleAcceptRequest(item.id)}>
          <CheckCircle color="#FFFFFF" size={20} />
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderIncomingSoloItem = ({ item }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <Image source={{ uri: item.playerAvatar }} style={styles.teamLogo} />
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{item.playerName}</Text>
          <View style={styles.playerInfoRow}>
            <Text style={styles.requestType}>Solo Player</Text>
            <View style={styles.positionBadge}>
              <Text style={styles.positionText}>{item.role}</Text>
            </View>
          </View>
        </View>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>{item.playerRating}</Text>
        </View>
      </View>

      <View style={styles.requestDetails}>
        <View style={styles.detailItem}>
          <Calendar color="#666666" size={16} />
          <Text style={styles.detailText}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.detailItem}>
          <User color="#666666" size={16} />
          <Text style={styles.detailText}>Position: {item.role}</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.declineButton} onPress={() => handleDeclineSoloRequest(item.id)}>
          <XCircle color="#FF4A4A" size={20} />
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.acceptButton} onPress={() => handleAcceptSoloRequest(item.id)}>
          <CheckCircle color="#FFFFFF" size={20} />
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderOutgoingItem = ({ item }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <Image source={{ uri: item.targetTeamLogo }} style={styles.teamLogo} />
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{item.targetTeamName}</Text>
          <View style={styles.statusContainer}>
            <Text style={styles.requestType}>Match Request</Text>
            <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.requestDetails}>
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

      {item.message && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageLabel}>Message:</Text>
          <Text style={styles.messageText}>{item.message}</Text>
        </View>
      )}

      {item.status === "pending" && (
        <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancelRequest(item.id)}>
          <Text style={styles.cancelButtonText}>Cancel Request</Text>
        </TouchableOpacity>
      )}
    </View>
  )

  const getStatusStyle = (status) => {
    switch (status) {
      case "accepted":
        return styles.acceptedStatus
      case "declined":
        return styles.declinedStatus
      default:
        return styles.pendingStatus
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#007BFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Match Requests</Text>
        <View style={styles.placeholderView} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "incoming" && styles.activeTab]}
          onPress={() => setActiveTab("incoming")}
        >
          <Text style={[styles.tabText, activeTab === "incoming" && styles.activeTabText]}>Incoming</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "outgoing" && styles.activeTab]}
          onPress={() => setActiveTab("outgoing")}
        >
          <Text style={[styles.tabText, activeTab === "outgoing" && styles.activeTabText]}>Outgoing</Text>
        </TouchableOpacity>
      </View>

      {activeTab === "incoming" && (
        <View style={styles.subTabContainer}>
          <TouchableOpacity
            style={[styles.subTab, activeSubTab === "team" && styles.activeSubTab]}
            onPress={() => setActiveSubTab("team")}
          >
            <Text style={[styles.subTabText, activeSubTab === "team" && styles.activeSubTabText]}>Team Requests</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.subTab, activeSubTab === "solo" && styles.activeSubTab]}
            onPress={() => setActiveSubTab("solo")}
          >
            <Text style={[styles.subTabText, activeSubTab === "solo" && styles.activeSubTabText]}>Solo Players</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === "incoming" && activeSubTab === "team" ? (
        <FlatList
          data={incomingRequests}
          renderItem={renderIncomingTeamItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.requestList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No incoming team match requests</Text>
            </View>
          }
        />
      ) : activeTab === "incoming" && activeSubTab === "solo" ? (
        <FlatList
          data={incomingSoloRequests}
          renderItem={renderIncomingSoloItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.requestList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No solo player requests</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={outgoingRequests}
          renderItem={renderOutgoingItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.requestList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No outgoing match requests</Text>
            </View>
          }
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
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#007BFF",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666666",
  },
  activeTabText: {
    color: "#007BFF",
  },
  subTabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    backgroundColor: "#F8F9FA",
  },
  subTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeSubTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#007BFF",
  },
  subTabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
  },
  activeSubTabText: {
    color: "#007BFF",
  },
  requestList: {
    padding: 16,
  },
  requestCard: {
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
  requestHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
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
  playerInfoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  requestType: {
    fontSize: 14,
    color: "#666666",
  },
  positionBadge: {
    backgroundColor: "rgba(0, 123, 255, 0.1)",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: 8,
  },
  positionText: {
    fontSize: 12,
    color: "#007BFF",
    fontWeight: "500",
  },
  ratingBadge: {
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.3)",
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFD700",
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: 8,
  },
  pendingStatus: {
    backgroundColor: "rgba(255, 193, 7, 0.2)",
  },
  acceptedStatus: {
    backgroundColor: "rgba(40, 167, 69, 0.2)",
  },
  declinedStatus: {
    backgroundColor: "rgba(220, 53, 69, 0.2)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  requestDetails: {
    marginBottom: 16,
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
  messageContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  messageLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: "#666666",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  acceptButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007BFF",
    borderRadius: 16,
    padding: 12,
    marginLeft: 8,
  },
  acceptButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  declineButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 16,
    padding: 12,
    marginRight: 8,
  },
  declineButtonText: {
    color: "#FF4A4A",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: "#F0F0F0",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#FF4A4A",
    fontSize: 14,
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
})

export default MatchRequestsScreen
