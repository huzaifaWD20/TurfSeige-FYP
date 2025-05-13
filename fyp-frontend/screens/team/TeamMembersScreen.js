"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, SafeAreaView } from "react-native"
import { ChevronLeft, MoreVertical, UserPlus, Settings, Shield, Calendar } from "lucide-react-native"
import RemovePlayerModal from "./RemovePlayerModal"
import AsyncStorage from '@react-native-async-storage/async-storage'

const TeamMembersScreen = ({ navigation, route }) => {
    const {
        opponentTeamId,
        opponentTeamName,
        requestingTeamId,
        requestingTeamName,
    } = route.params;

    useEffect(() => {
        console.log("Opponent Team ID:", opponentTeamId);
        console.log("Opponent Team Name:", opponentTeamName);
        console.log("Requesting Team ID:", requestingTeamId);
        console.log("Requesting Team Name:", requestingTeamName);
    }, []);

    const [team, setTeam] = useState(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [selectedMember, setSelectedMember] = useState(null)
    const [isRemoveModalVisible, setIsRemoveModalVisible] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTeamDetails = async () => {
            try {
                setLoading(true)
                const token = await AsyncStorage.getItem('accessToken')
                if (!token) {
                    console.warn('No JWT token found')
                    setLoading(false)
                    return
                }

                const response = await fetch(`http://192.168.20.188:8000/api/teams/${opponentTeamId}/`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                })

                if (!response.ok) {
                    throw new Error("Failed to fetch team details")
                }

                const data = await response.json()
                console.log("API Response:", data.id) // Debug log
                console.log("Team id", requestingTeamId)

                // Debug the captain data
                //console.log("Captain data:", data.captain)

                // Create a quick lookup for who's the captain
                let captainUsername = null;
                if (data.captain) {
                    captainUsername = data.captain.username || '';
                }
                // Get the captain ID (now handling if it's directly a number)
                const captainId = data.captain ? String(data.captain) : null
                //console.log("Captain ID:", captainId)

                const transformedMembers = data.members.map(member => {
                    // Convert both IDs to strings for comparison
                    const memberId = String(member.id)

                    // Check if member is captain by comparing IDs
                    const isCaptain = captainId === memberId

                    if (isCaptain) {
                        console.log(`Found captain with ID ${memberId}`)
                    }

                    const memberUsername = member.username || member.name || ''

                    return {
                        ...member,
                        role: isCaptain ? "Captain" : "Player",
                        avatar: member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(memberUsername)}`,
                        name: memberUsername,
                    }
                })


                //console.log("Transformed Members:", transformedMembers) // Debug log

                setTeam({
                    ...data,
                    members: transformedMembers,
                    logo: data.logo || "https://via.placeholder.com/60",
                })

                const isCurrentUserAdmin = data.captain?.id === data.current_user_id
                setIsAdmin(isCurrentUserAdmin)

            } catch (error) {
                console.error("Error fetching team details:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchTeamDetails()
    }, [requestingTeamId])


    const handleRemovePlayer = async () => {
        if (selectedMember) {
            try {
                const token = await AsyncStorage.getItem('accessToken');
                if (!token) {
                    console.warn('No token found');
                    return;
                }

                const response = await fetch(`http://192.168.20.188:8000/api/teams/${requestingTeamId}/remove-player/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify({ player_id: selectedMember.id }),
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to remove player');
                }

                // If player removal was successful, update the team members list
                const updatedMembers = team.members.filter((member) => member.id !== selectedMember.id);
                setTeam({ ...team, members: updatedMembers });

                setIsRemoveModalVisible(false);  // Close the modal
                setSelectedMember(null);  // Clear selected member
            } catch (error) {
                console.error('Error removing player:', error);
            }
        }
    };


    const renderMemberItem = ({ item }) => {
        // Debug role for this item
        console.log(`Rendering ${item.name} with role: ${item.role}`);

        return (
            <View style={styles.memberItem}>
                <Image
                    source={{ uri: item.avatar }}
                    style={styles.avatar}
                    defaultSource={require('../../assets/logo.png')}
                />
                <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{item.name || 'Unknown Player'}</Text>
                    <View style={[styles.roleBadge, item.role === "Captain" && styles.captainBadge]}>
                        <Text style={[styles.roleText, item.role === "Captain" && styles.captainText]}>{item.role}</Text>
                    </View>
                </View>
                {item.role === "Captain" ? (
                    <View style={styles.captainIcon}>
                        <Shield color="#007BFF" size={20} />
                    </View>
                ) : isAdmin ? (
                    <TouchableOpacity
                        style={styles.menuButton}
                        onPress={() => {
                            setSelectedMember(item)
                            setIsRemoveModalVisible(true)
                        }}
                    >
                        <MoreVertical color="#666666" size={20} />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 40 }} />
                )}
            </View>
        );
    }


    if (loading || !team) {
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
                        onPress={() => navigation.navigate("TeamSettingsScreen", { requestingTeamId })}
                    >
                        <Settings color="#007BFF" size={20} />
                    </TouchableOpacity>
                )}
                {!isAdmin && <View style={styles.placeholderView} />}
            </View>

            <View style={styles.teamInfoContainer}>
                <Image
                    source={{ uri: team.logo }}
                    style={styles.teamLogo}
                    defaultSource={require('../../assets/logo.png')}
                />
                <View style={styles.teamDetails}>
                    <Text style={styles.teamName}>{team.name || 'Team'}</Text>
                    {team.description && <Text style={styles.teamDescription}>{team.description}</Text>}
                    <Text style={styles.memberCount}>{team.members.length} members</Text>
                </View>
                {isAdmin && (
                    <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate("EditTeamScreen", { requestingTeamId })}>
                        <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.actionContainer}>
                <TouchableOpacity
                    style={styles.requestMatchButton}
                    onPress={() => navigation.navigate("RequestMatchScreen", {
                        opponentTeamId,
                        opponentTeamName,
                        requestingTeamId,
                        requestingTeamName,
                    })
}
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
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                contentContainerStyle={styles.memberList}
                ListEmptyComponent={
                    <View style={styles.emptyList}>
                        <Text style={styles.emptyListText}>No members found</Text>
                    </View>
                }
            />

            {isAdmin && (
                <TouchableOpacity
                    style={styles.inviteButton}
                    onPress={() => navigation.navigate("InvitePlayersScreen", { requestingTeamId })}
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
                onRemove={handleRemovePlayer}
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
    emptyList: {
        padding: 20,
        alignItems: 'center',
    },
    emptyListText: {
        color: '#666666',
        fontSize: 16,
    },
})

export default TeamMembersScreen