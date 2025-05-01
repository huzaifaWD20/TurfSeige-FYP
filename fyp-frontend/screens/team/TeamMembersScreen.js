"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, SafeAreaView } from "react-native"
import { ChevronLeft, MoreVertical, UserPlus, Settings, Shield, Calendar } from "lucide-react-native"
import RemovePlayerModal from "./RemovePlayerModal"
import { useTeam } from "../../context/TeamContext"

const TeamMembersScreen = ({ navigation, route }) => {
  const { teamId } = route.params || { teamId: "1" }
  const { getTeamById, isTeamAdmin } = useTeam()

  const [team, setTeam] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [isRemoveModalVisible, setIsRemoveModalVisible] = useState(false)

  useEffect(() => {
    const teamData = getTeamById(teamId)
    setTeam(teamData)
    setIsAdmin(isTeamAdmin(teamId))
  }, [teamId])

  const handleRemoveMember = () => {
    if (selectedMember) {
      // In a real app, you would call the removeTeamMember function from context
      // For now, we'll just update the local state
      const updatedMembers = team.members.filter((member) => member.id !== selectedMember.id)
      setTeam({ ...team, members: updatedMembers })
      setIsRemoveModalVisible(false)
      setSelectedMember(null)
    }
  }

  const renderMemberItem = ({ item }) => (
    <View style={styles.memberItem}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <View style={[styles.roleBadge, item.role === "Captain" && styles.captainBadge]}>
          <Text style={[styles.roleText, item.role === "Captain" && styles.captainText]}>{item.role}</Text>
        </View>
      </View>
      {isAdmin && item.role !== "Captain" && (
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => {
            setSelectedMember(item)
            setIsRemoveModalVisible(true)
          }}
        >
          <MoreVertical color="#666666" size={20} />
        </TouchableOpacity>
      )}
      {item.role === "Captain" && (
        <View style={styles.captainIcon}>
          <Shield color="#007BFF" size={20} />
        </View>
      )}
    </View>
  )

  if (!team) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeft color="#007BFF" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Team Members</Text>
          <View style={styles.placeholderView} />
        </View>
        <View style={styles.loadingContainer}>
          <Text>Loading team information...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#007BFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Team Members</Text>
        {isAdmin && (
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate("TeamSettingsScreen", { teamId })}
          >
            <Settings color="#007BFF" size={20} />
          </TouchableOpacity>
        )}
        {!isAdmin && <View style={styles.placeholderView} />}
      </View>

      <View style={styles.teamInfoContainer}>
        <Image source={{ uri: team.logo }} style={styles.teamLogo} />
        <View style={styles.teamDetails}>
          <Text style={styles.teamName}>{team.name}</Text>
          {team.description && <Text style={styles.teamDescription}>{team.description}</Text>}
          <Text style={styles.memberCount}>{team.members.length} members</Text>
        </View>
        {isAdmin && (
          <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate("EditTeamScreen", { teamId })}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.requestMatchButton}
          onPress={() => navigation.navigate("RequestMatchScreen", { teamId })}
        >
          <Calendar color="#FFFFFF" size={20} />
          <Text style={styles.requestMatchText}>Request Match</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Members</Text>
      </View>

      <FlatList
        data={team.members}
        renderItem={renderMemberItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.memberList}
      />

      {isAdmin && (
        <TouchableOpacity
          style={styles.inviteButton}
          onPress={() => navigation.navigate("InvitePlayersScreen", { teamId })}
        >
          <UserPlus color="#FFFFFF" size={20} />
          <Text style={styles.inviteButtonText}>Invite Players</Text>
        </TouchableOpacity>
      )}

      <RemovePlayerModal
        isVisible={isRemoveModalVisible}
        member={selectedMember}
        onCancel={() => {
          setIsRemoveModalVisible(false)
          setSelectedMember(null)
        }}
        onRemove={handleRemoveMember}
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
  settingsButton: {
    padding: 8,
    width: 40,
    alignItems: "center",
  },
  placeholderView: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  teamInfoContainer: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    alignItems: "center",
  },
  teamLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  teamDetails: {
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
  memberCount: {
    fontSize: 14,
    color: "#666666",
  },
  editButton: {
    backgroundColor: "#F0F0F0",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  editButtonText: {
    color: "#007BFF",
    fontSize: 14,
    fontWeight: "500",
  },
  actionContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  requestMatchButton: {
    backgroundColor: "#007BFF",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  requestMatchText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  sectionHeader: {
    padding: 16,
    backgroundColor: "#F8F9FA",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  memberList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 80,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  roleBadge: {
    backgroundColor: "#F0F0F0",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  roleText: {
    fontSize: 12,
    color: "#666666",
  },
  captainBadge: {
    backgroundColor: "rgba(0, 123, 255, 0.1)",
  },
  captainText: {
    color: "#007BFF",
  },
  captainIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inviteButton: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: "#007BFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#007BFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  inviteButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
})

export default TeamMembersScreen
