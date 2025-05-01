"use client"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, SafeAreaView, Alert } from "react-native"
import { ChevronLeft, Calendar, Clock, MapPin, CheckCircle, XCircle } from "lucide-react-native"
import { useSolo } from "../../context/SoloContext"

const TeamMatchInvitesScreen = ({ navigation }) => {
  const { teamInvites, respondToTeamInvite } = useSolo()

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

  const handleAcceptInvite = (inviteId) => {
    respondToTeamInvite(inviteId, "accepted")
    Alert.alert("Invite Accepted", "You have been added to the match.")
  }

  const handleDeclineInvite = (inviteId) => {
    Alert.alert(
      "Decline Invite",
      "Are you sure you want to decline this match invite? The team will need to find a replacement.",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => {
            respondToTeamInvite(inviteId, "declined")
            Alert.alert("Invite Declined", "The team captain has been notified.")
          },
        },
      ],
    )
  }

  const renderInviteItem = ({ item }) => (
    <View style={styles.inviteCard}>
      <View style={styles.inviteHeader}>
        <Image source={{ uri: item.teamLogo }} style={styles.teamLogo} />
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{item.teamName}</Text>
          <Text style={styles.matchDetails}>vs {item.opponent}</Text>
          <View style={styles.formatBadge}>
            <Text style={styles.formatText}>{item.format}</Text>
          </View>
        </View>
      </View>

      <View style={styles.inviteDetails}>
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

      <View style={styles.captainInfo}>
        <Text style={styles.captainLabel}>Captain:</Text>
        <Text style={styles.captainName}>{item.captain.name}</Text>
      </View>

      {item.status === "pending" && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.declineButton} onPress={() => handleDeclineInvite(item.id)}>
            <XCircle color="#FF4A4A" size={20} />
            <Text style={styles.declineButtonText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptButton} onPress={() => handleAcceptInvite(item.id)}>
            <CheckCircle color="#FFFFFF" size={20} />
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.status === "accepted" && (
        <View style={styles.statusBanner}>
          <CheckCircle color="#28A745" size={20} />
          <Text style={styles.acceptedStatusText}>You've accepted this invite</Text>
        </View>
      )}

      {item.status === "declined" && (
        <View style={styles.statusBanner}>
          <XCircle color="#DC3545" size={20} />
          <Text style={styles.declinedStatusText}>You've declined this invite</Text>
        </View>
      )}
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#007BFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Team Invites</Text>
        <View style={styles.placeholderView} />
      </View>

      <FlatList
        data={teamInvites}
        renderItem={renderInviteItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.inviteList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No team invites</Text>
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
  inviteList: {
    padding: 16,
  },
  inviteCard: {
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
  inviteHeader: {
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
  inviteDetails: {
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
  captainInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  captainLabel: {
    fontSize: 14,
    color: "#666666",
    marginRight: 4,
  },
  captainName: {
    fontSize: 14,
    fontWeight: "500",
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
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 16,
    padding: 12,
  },
  acceptedStatusText: {
    color: "#28A745",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  declinedStatusText: {
    color: "#DC3545",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
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

export default TeamMatchInvitesScreen
