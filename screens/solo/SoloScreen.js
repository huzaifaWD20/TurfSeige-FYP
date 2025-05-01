"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, ScrollView } from "react-native"
import { ChevronLeft, Search, Calendar, Clock, MapPin, Star } from "lucide-react-native"
import { useSolo } from "../../context/SoloContext"

const SoloScreen = ({ navigation }) => {
  const { soloProfile, matchOpenings, teamInvites, outgoingRequests, getFilteredOpenings } = useSolo()
  const [upcomingMatches, setUpcomingMatches] = useState([])

  useEffect(() => {
    // Get upcoming matches from accepted requests
    const acceptedRequests = outgoingRequests.filter((req) => req.status === "accepted")
    setUpcomingMatches(acceptedRequests)
  }, [outgoingRequests])

  // Get match openings relevant to player's position
  const relevantOpenings = getFilteredOpenings(soloProfile.position).slice(0, 2)

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#007BFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Solo Player</Text>
        <View style={styles.placeholderView} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <Image source={{ uri: soloProfile.avatar }} style={styles.profileImage} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{soloProfile.name}</Text>
              <View style={styles.profileStats}>
                <View style={styles.statBadge}>
                  <Text style={styles.statText}>{soloProfile.position}</Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Star color="#FFD700" size={14} />
                  <Text style={styles.ratingText}>{soloProfile.rating}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>PAC</Text>
              <Text style={styles.statValue}>{soloProfile.stats.PAC}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>SHO</Text>
              <Text style={styles.statValue}>{soloProfile.stats.SHO}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>PAS</Text>
              <Text style={styles.statValue}>{soloProfile.stats.PAS}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>DRI</Text>
              <Text style={styles.statValue}>{soloProfile.stats.DRI}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>DEF</Text>
              <Text style={styles.statValue}>{soloProfile.stats.DEF}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>PHY</Text>
              <Text style={styles.statValue}>{soloProfile.stats.PHY}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("BrowseSoloScreen")}>
            <Search color="#007BFF" size={20} />
            <Text style={styles.actionButtonText}>Find Matches</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("SoloMatchRequestsScreen")}>
            <Calendar color="#007BFF" size={20} />
            <Text style={styles.actionButtonText}>My Requests</Text>
          </TouchableOpacity>
        </View>

        {teamInvites.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Team Invites</Text>
              <TouchableOpacity onPress={() => navigation.navigate("TeamMatchInvitesScreen")}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {teamInvites.map((invite) => (
              <TouchableOpacity
                key={invite.id}
                style={styles.inviteCard}
                onPress={() => navigation.navigate("TeamMatchInvitesScreen")}
              >
                <Image source={{ uri: invite.teamLogo }} style={styles.teamLogo} />
                <View style={styles.inviteInfo}>
                  <Text style={styles.teamName}>{invite.teamName}</Text>
                  <Text style={styles.matchDetails}>vs {invite.opponent}</Text>
                  <View style={styles.matchMeta}>
                    <View style={styles.metaItem}>
                      <Calendar color="#666666" size={14} />
                      <Text style={styles.metaText}>{formatDate(invite.date)}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Clock color="#666666" size={14} />
                      <Text style={styles.metaText}>{formatTime(invite.date)}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.inviteStatus}>
                  <Text style={styles.pendingText}>Pending</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {relevantOpenings.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recommended Matches</Text>
              <TouchableOpacity onPress={() => navigation.navigate("BrowseSoloScreen")}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {relevantOpenings.map((opening) => (
              <TouchableOpacity
                key={opening.id}
                style={styles.matchCard}
                onPress={() => navigation.navigate("BrowseSoloScreen")}
              >
                <Image source={{ uri: opening.teamLogo }} style={styles.teamLogo} />
                <View style={styles.matchInfo}>
                  <Text style={styles.teamName}>{opening.teamName}</Text>
                  <Text style={styles.matchDetails}>vs {opening.opponent}</Text>
                  <View style={styles.matchMeta}>
                    <View style={styles.metaItem}>
                      <Calendar color="#666666" size={14} />
                      <Text style={styles.metaText}>{formatDate(opening.date)}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Clock color="#666666" size={14} />
                      <Text style={styles.metaText}>{formatTime(opening.date)}</Text>
                    </View>
                  </View>
                  <View style={styles.positionTags}>
                    {opening.openPositions.map((pos) => (
                      <View
                        key={pos.id}
                        style={[styles.positionTag, pos.role === soloProfile.position && styles.matchingPositionTag]}
                      >
                        <Text
                          style={[
                            styles.positionTagText,
                            pos.role === soloProfile.position && styles.matchingPositionTagText,
                          ]}
                        >
                          {pos.role}
                          {pos.required ? " *" : ""}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {upcomingMatches.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Matches</Text>
            </View>

            {upcomingMatches.map((match) => (
              <View key={match.id} style={styles.matchCard}>
                <Image source={{ uri: match.teamLogo }} style={styles.teamLogo} />
                <View style={styles.matchInfo}>
                  <Text style={styles.teamName}>{match.teamName}</Text>
                  <Text style={styles.matchDetails}>vs {match.opponent}</Text>
                  <View style={styles.matchMeta}>
                    <View style={styles.metaItem}>
                      <Calendar color="#666666" size={14} />
                      <Text style={styles.metaText}>{formatDate(match.date)}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Clock color="#666666" size={14} />
                      <Text style={styles.metaText}>{formatTime(match.date)}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <MapPin color="#666666" size={14} />
                      <Text style={styles.metaText}>{match.location}</Text>
                    </View>
                  </View>
                  <View style={styles.roleTag}>
                    <Text style={styles.roleTagText}>{match.role}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
  },
  profileSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  profileStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  statBadge: {
    backgroundColor: "#F0F0F0",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 8,
  },
  statText: {
    fontSize: 12,
    color: "#666666",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    color: "#666666",
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  statItem: {
    width: "30%",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007BFF",
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
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
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
  inviteCard: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
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
  inviteStatus: {
    justifyContent: "center",
  },
  pendingText: {
    fontSize: 12,
    color: "#FFA500",
    fontWeight: "500",
  },
  matchCard: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  matchInfo: {
    flex: 1,
  },
  positionTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  positionTag: {
    backgroundColor: "#F0F0F0",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 8,
    marginTop: 4,
  },
  positionTagText: {
    fontSize: 12,
    color: "#666666",
  },
  matchingPositionTag: {
    backgroundColor: "rgba(0, 123, 255, 0.1)",
  },
  matchingPositionTagText: {
    color: "#007BFF",
  },
  roleTag: {
    backgroundColor: "rgba(0, 123, 255, 0.1)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  roleTagText: {
    fontSize: 12,
    color: "#007BFF",
  },
})

export default SoloScreen
