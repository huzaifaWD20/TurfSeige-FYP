"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, FlatList, ScrollView } from "react-native"
import { ChevronLeft, Users, Calendar, Trophy, TrendingUp, Clock, MapPin, Shield, Settings, MoreVertical } from "lucide-react-native"
//import { useTeam } from "../../context/TeamContext"
import RemovePlayerModal from "./RemovePlayerModal"
import AsyncStorage from "@react-native-async-storage/async-storage"

const TeamDetailsScreen = ({ navigation, route }) => {
    const { teamId, initialTab = "overview" } = route.params || {}
    // const { getTeamById, isTeamAdmin } = useTeam()

    const [team, setTeam] = useState(null)
    const [isCaptain, setIsCaptain] = useState(false)
    const [activeTab, setActiveTab] = useState(initialTab)
    const [selectedMember, setSelectedMember] = useState(null)
    const [isRemoveModalVisible, setIsRemoveModalVisible] = useState(false)
    const [loading, setLoading] = useState(true)
   // const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeamDetails = async () => {
            try {
                setLoading(true);
                const token = await AsyncStorage.getItem('accessToken');
                if (!token) {
                    console.warn('No JWT token found');
                    setLoading(false);
                    return;
                }

                // Fetch team details
                const response = await fetch(`http://192.168.20.188:8000/api/teams/${teamId}/`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch team details");
                }

                const data = await response.json();

                // Get the captain ID (assuming the captain is a field with the user ID)
                const captainId = data.captain ? String(data.captain) : null;

                // Check if the current logged-in user is the captain
                const currentUserId = await AsyncStorage.getItem('userId'); // Fetch current user ID from storage
                const isCurrentUserCaptain = currentUserId === captainId;
                setIsCaptain(isCurrentUserCaptain); // Set the captain status

                // Transform team members with the captain role
                const transformedMembers = data.members.map(member => {
                    const memberId = String(member.id);
                    const isCaptain = captainId === memberId;
                    const memberUsername = member.username || member.name || '';
                    return {
                        ...member,
                        role: isCaptain ? "Captain" : "Player",
                        avatar: member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(memberUsername)}`,
                        name: memberUsername,
                    };
                });

                setTeam({
                    ...data,
                    members: transformedMembers,
                    logo: data.logo || "https://via.placeholder.com/60",
                });

            } catch (error) {
                console.error("Error fetching team details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTeamDetails();
    }, [teamId]);



    if (!team || loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <ChevronLeft color="#007BFF" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Team Details</Text>
                    <View style={styles.placeholderView} />
                </View>
                <View style={styles.loadingContainer}>
                    <Text>Loading team information...</Text>
                </View>
            </SafeAreaView>
        )
    }

    const handleRemovePlayer = async () => {
        if (selectedMember) {
            try {
                const token = await AsyncStorage.getItem('accessToken');
                if (!token) {
                    console.warn('No token found');
                    return;
                }

                const response = await fetch(`http://192.168.20.188:8000/api/teams/${teamId}/remove-player/`, {
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

    const renderMemberItem = ({ item }) => (
        <View style={styles.memberItem}>
            <Image
                source={{ uri: item.avatar }}
                style={styles.avatar}
            />
            <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{item.name}</Text>
                <View style={[styles.roleBadge, item.role === "Captain" && styles.captainBadge]}>
                    <Text style={[styles.roleText, item.role === "Captain" && styles.captainText]}>{item.role}</Text>
                </View>
            </View>
            {item.role === "Captain" ? (
                // Show captain icon if this member is a captain
                <View style={styles.captainIcon}>
                    <Shield color="#007BFF" size={20} />
                </View>
            ) : isCaptain ? (
                // Show options button only if current user is a captain and item is NOT a captain
                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => {
                        setSelectedMember(item);
                        setIsRemoveModalVisible(true);
                    }}
                >
                    <MoreVertical color="#666666" size={20} />
                </TouchableOpacity>
            ) : null}
        </View>
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
                <Text style={styles.headerTitle}>{team.name}</Text>
                {isCaptain && (
                    <TouchableOpacity
                        style={styles.settingsButton}
                        onPress={() => navigation.navigate("TeamSettingsScreen", { teamId })}
                    >
                        <Settings color="#007BFF" size={20} />
                    </TouchableOpacity>
                )}
                {!isCaptain && <View style={styles.placeholderView} />}
            </View>

            <View style={styles.teamInfoContainer}>
                <Image
                    source={{ uri: team.logo }}
                    style={styles.teamLogo}
                />
                <View style={styles.teamDetails}>
                    <Text style={styles.teamName}>{team.name}</Text>
                    {team.description && <Text style={styles.teamDescription}>{team.description}</Text>}
                    <Text style={styles.memberCount}>{team.members.length} members</Text>
                </View>
                {isCaptain && (
                    <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate("EditTeamScreen", { teamId })}>
                        <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                )}
                {!isCaptain && <View style={styles.placeholderView} />}
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "overview" && styles.activeTab]}
                    onPress={() => setActiveTab("overview")}
                >
                    <Text style={[styles.tabText, activeTab === "overview" && styles.activeTabText]}>Overview</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "members" && styles.activeTab]}
                    onPress={() => setActiveTab("members")}
                >
                    <Text style={[styles.tabText, activeTab === "members" && styles.activeTabText]}>Members</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "matches" && styles.activeTab]}
                    onPress={() => setActiveTab("matches")}
                >
                    <Text style={[styles.tabText, activeTab === "matches" && styles.activeTabText]}>Matches</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {activeTab === "overview" && (
                    <View style={styles.overviewContainer}>
                        <View style={styles.statsCard}>
                            <Text style={styles.statsTitle}>Team Statistics</Text>
                            <View style={styles.statsGrid}>
                                <View style={styles.statItem}>
                                    <View style={styles.statIconContainer}>
                                        <Calendar color="#007BFF" size={20} />
                                    </View>
                                    <Text style={styles.statValue}>{team.matches_played}</Text>
                                    <Text style={styles.statLabel}>Matches Played</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <View style={[styles.statIconContainer, { backgroundColor: "rgba(40, 167, 69, 0.1)" }]}>
                                        <Trophy color="#28A745" size={20} />
                                    </View>
                                    <Text style={styles.statValue}>{team.wins}</Text>
                                    <Text style={styles.statLabel}>Wins</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <View style={[styles.statIconContainer, { backgroundColor: "rgba(255, 193, 7, 0.1)" }]}>
                                        <TrendingUp color="#FFC107" size={20} />
                                    </View>
                                    <Text style={styles.statValue}>{team.draws}</Text>
                                    <Text style={styles.statLabel}>Draws</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <View style={[styles.statIconContainer, { backgroundColor: "rgba(220, 53, 69, 0.1)" }]}>
                                        <Clock color="#DC3545" size={20} />
                                    </View>
                                    <Text style={styles.statValue}>{team.losses}</Text>
                                    <Text style={styles.statLabel}>Losses</Text>
                                </View>
                            </View>
                        </View>

                        {team.matchHistory && team.matchHistory.length > 0 && (
                            <View style={styles.recentMatchesCard}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardTitle}>Recent Matches</Text>
                                    <TouchableOpacity onPress={() => setActiveTab("matches")}>
                                        <Text style={styles.seeAllText}>See All</Text>
                                    </TouchableOpacity>
                                </View>
                                <FlatList
                                    data={team.matchHistory.slice(0, 3)}
                                    renderItem={renderMatchItem}
                                    keyExtractor={(item, index) => `match-${index}`}
                                    scrollEnabled={false}
                                />
                            </View>
                        )}

                        <View style={styles.teamMembersCard}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>Team Members</Text>
                                <TouchableOpacity onPress={() => setActiveTab("members")}>
                                    <Text style={styles.seeAllText}>See All</Text>
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={team.members.slice(0, 3)}
                                renderItem={renderMemberItem}
                                keyExtractor={(item) => `member-${item.id}`}
                                scrollEnabled={false}
                            />
                        </View>
                    </View>
                )}

                {activeTab === "members" && (
                    <View style={styles.membersContainer}>
                        <FlatList
                            data={team.members}
                            renderItem={renderMemberItem}
                            keyExtractor={(item) => `member-${item.id}`}
                            scrollEnabled={false}
                        />

                        {isCaptain ? (
                            <TouchableOpacity
                                style={styles.inviteButton}
                                onPress={() => navigation.navigate("InvitePlayersScreen", { teamId })}
                            >
                                <Users color="#FFFFFF" size={20} />
                                <Text style={styles.inviteButtonText}>Invite Players</Text>
                            </TouchableOpacity>
                        ) : (
                            <Text>You are not the captain</Text> // For testing purposes to check if the condition works
                        )}
                    </View>
                )}


                {activeTab === "matches" && (
                    <View style={styles.matchesContainer}>
                        {/*{team.matchHistory && team.matchHistory.length > 0 ? (*/}
                        {/*    <FlatList*/}
                        {/*        data={team.matchHistory}*/}
                        {/*        renderItem={renderMatchItem}*/}
                        {/*        keyExtractor={(item, index) => `match-${index}`}*/}
                        {/*        scrollEnabled={false}*/}
                        {/*    />*/}
                        {/*) : (*/}
                        {/*    <View style={styles.emptyState}>*/}
                        {/*        <Text style={styles.emptyStateText}>No match history yet</Text>*/}
                        {/*    </View>*/}
                        {/*)}*/}

                        {isCaptain && (
                            <TouchableOpacity
                                style={styles.scheduleButton}
                                onPress={() => navigation.navigate("PostMatchScreen", { teamId })}
                            >
                                <Calendar color="#FFFFFF" size={20} />
                                <Text style={styles.scheduleButtonText}>Schedule Match</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </ScrollView>
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
        fontSize: 14,
        fontWeight: "500",
        color: "#666666",
    },
    activeTabText: {
        color: "#007BFF",
    },
    content: {
        flex: 1,
    },
    overviewContainer: {
        padding: 16,
    },
    statsCard: {
        backgroundColor: "#F8F9FA",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    statsTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    statItem: {
        width: "48%",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 12,
        alignItems: "center",
        marginBottom: 12,
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(0, 123, 255, 0.1)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    statValue: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333333",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: "#666666",
    },
    recentMatchesCard: {
        backgroundColor: "#F8F9FA",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "600",
    },
    seeAllText: {
        fontSize: 14,
        color: "#007BFF",
    },
    matchItem: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
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
    teamMembersCard: {
        backgroundColor: "#F8F9FA",
        borderRadius: 16,
        padding: 16,
    },
    memberItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: 14,
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
    membersContainer: {
        padding: 16,
    },
    inviteButton: {
        backgroundColor: "#007BFF",
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 16,
    },
    inviteButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
    },
    matchesContainer: {
        padding: 16,
    },
    emptyState: {
        padding: 24,
        alignItems: "center",
    },
    emptyStateText: {
        fontSize: 16,
        color: "#666666",
    },
    scheduleButton: {
        backgroundColor: "#28A745",
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 16,
    },
    scheduleButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
    },
})

export default TeamDetailsScreen