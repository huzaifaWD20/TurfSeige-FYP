"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image, SafeAreaView } from "react-native"
import { ChevronLeft, Search, X } from "lucide-react-native"

const InvitePlayersScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [pendingInvites, setPendingInvites] = useState([])

  // Mock data
  useEffect(() => {
    const mockUsers = [
      { id: "1", name: "John Doe", avatar: "https://via.placeholder.com/100", invited: false },
      { id: "2", name: "Jane Smith", avatar: "https://via.placeholder.com/100", invited: false },
      { id: "3", name: "Mike Johnson", avatar: "https://via.placeholder.com/100", invited: false },
      { id: "4", name: "Sarah Williams", avatar: "https://via.placeholder.com/100", invited: false },
      { id: "5", name: "David Brown", avatar: "https://via.placeholder.com/100", invited: false },
      { id: "6", name: "Emily Davis", avatar: "https://via.placeholder.com/100", invited: false },
      { id: "7", name: "Alex Wilson", avatar: "https://via.placeholder.com/100", invited: false },
    ]
    setUsers(mockUsers)
    setFilteredUsers(mockUsers)
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()))
      setFilteredUsers(filtered)
    }
  }, [searchQuery, users])

  const toggleInvite = (userId) => {
    const updatedUsers = users.map((user) => {
      if (user.id === userId) {
        return { ...user, invited: !user.invited }
      }
      return user
    })
    setUsers(updatedUsers)

    // Update filtered users as well
    const updatedFilteredUsers = filteredUsers.map((user) => {
      if (user.id === userId) {
        return { ...user, invited: !user.invited }
      }
      return user
    })
    setFilteredUsers(updatedFilteredUsers)

    // Update pending invites
    const user = users.find((u) => u.id === userId)
    if (user) {
      if (!user.invited) {
        setPendingInvites([...pendingInvites, user])
      } else {
        setPendingInvites(pendingInvites.filter((u) => u.id !== userId))
      }
    }
  }

  const renderUserItem = ({ item }) => (
    <View style={styles.userItem}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <Text style={styles.userName}>{item.name}</Text>
      <TouchableOpacity
        style={[styles.inviteButton, item.invited && styles.invitedButton]}
        onPress={() => toggleInvite(item.id)}
      >
        <Text style={[styles.inviteButtonText, item.invited && styles.invitedButtonText]}>
          {item.invited ? "Invited" : "Invite"}
        </Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#007BFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invite Players</Text>
        <View style={styles.placeholderView} />
      </View>

      <View style={styles.searchContainer}>
        <Search color="#999999" size={20} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
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
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.userList}
      />

      {pendingInvites.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.pendingText}>
            {pendingInvites.length} pending {pendingInvites.length === 1 ? "invite" : "invites"}
          </Text>
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => {
              // Handle sending invites
              navigation.goBack()
            }}
          >
            <Text style={styles.sendButtonText}>Send Invites</Text>
          </TouchableOpacity>
        </View>
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
  userList: {
    paddingHorizontal: 16,
  },
  userItem: {
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
  userName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  inviteButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#007BFF",
  },
  inviteButtonText: {
    color: "#007BFF",
    fontSize: 14,
    fontWeight: "500",
  },
  invitedButton: {
    backgroundColor: "#007BFF",
  },
  invitedButtonText: {
    color: "#FFFFFF",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    backgroundColor: "#FFFFFF",
  },
  pendingText: {
    fontSize: 14,
    color: "#666666",
  },
  sendButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
})

export default InvitePlayersScreen
