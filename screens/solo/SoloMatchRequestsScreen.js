"use client"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, SafeAreaView, Alert } from "react-native"
import { ChevronLeft, Calendar, Clock, MapPin } from "lucide-react-native"
import { useSolo } from "../../context/SoloContext"

const SoloMatchRequestsScreen = ({ navigation }) => {
  const { outgoingRequests, cancelJoinRequest } = useSolo()

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

  const getStatusText = (status) => {
    switch (status) {
      case "accepted":
        return "Accepted"
      case "declined":
        return "Declined"
      default:
        return "Pending"
    }
  }

  const handleCancelRequest = (requestId) => {
    Alert.alert("Cancel Request", "Are you sure you want to cancel this request?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: () => cancelJoinRequest(requestId),
      },
    ])
  }

  const renderRequestItem = ({ item }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <Image source={{ uri: item.teamLogo }} style={styles.teamLogo} />
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{item.teamName}</Text>
          <Text style={styles.matchDetails}>vs {item.opponent}</Text>
          <View style={styles.statusContainer}>
            <Text style={styles.positionText}>{item.role}</Text>
            <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
              <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
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

      {item.status === "pending" && (
        <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancelRequest(item.id)}>
          <Text style={styles.cancelButtonText}>Cancel Request</Text>
        </TouchableOpacity>
      )}
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#007BFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Requests</Text>
        <View style={styles.placeholderView} />
      </View>

      <FlatList
        data={outgoingRequests}
        renderItem={renderRequestItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.requestList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No match requests</Text>
            <TouchableOpacity style={styles.browseButton} onPress={() => navigation.navigate("BrowseSoloScreen")}>
              <Text style={styles.browseButtonText}>Browse Matches</Text>
            </TouchableOpacity>
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
  matchDetails: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  positionText: {
    fontSize: 14,
    color: "#007BFF",
    marginRight: 8,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
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
    marginBottom: 16,
  },
  browseButton: {
    backgroundColor: "#007BFF",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    width: "100%",
  },
  browseButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
})

export default SoloMatchRequestsScreen
