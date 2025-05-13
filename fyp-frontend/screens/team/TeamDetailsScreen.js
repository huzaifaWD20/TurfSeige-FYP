"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, FlatList, ScrollView } from "react-native"
import { ChevronLeft, Users, Calendar, Trophy, TrendingUp, Clock, MapPin, Shield } from "lucide-react-native"
//import { useTeam } from "../../context/TeamContext"
import AsyncStorage from "@react-native-async-storage/async-storage"

const TeamDetailsScreen = ({ navigation, route }) => {
    const { teamId, initialTab = "overview" } = route.params || {}
    // const { getTeamById, isTeamAdmin } = useTeam()

    const [team, setTeam] = useState(null)
    const [isCaptain, setIsCaptain] = useState(false)
    const [activeTab, setActiveTab] = useState(initialTab)
    const [loading, setLoading] = useState(true)

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

                console.log("Fetching data for teamId:", teamId);
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
                console.log("Team data received:", data);

                // Debug the captain data
                console.log("Captain data:", data.captain);

                // Get the captain ID (now handling if it's directly a number)
                const captainId = data.captain ? String(data.captain) : null;
                console.log("Captain ID:", captainId);

                const transformedMembers = data.members.map(member => {
                    // Convert both IDs to strings for comparison
                    const memberId = String(member.id);
                    // Check if member is captain by comparing IDs
                    const isCaptain = captainId === memberId;
                    if (isCaptain) {
                        console.log(`Found captain with ID ${memberId}`);
                    }

                    const memberUsername = member.username || member.name || '';
                    return {
                        ...member,
                        role: isCaptain ? "Captain" : "Player",
                        avatar: member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(memberUsername)}`,
                        name: memberUsername,
                    };
                });

                console.log("Transformed Members:", transformedMembers);

                setTeam({
                    ...data,
                    members: transformedMembers,
                    logo: data.logo || "https://via.placeholder.com/60",
                });

                // Check if current user is the captain
                const isCurrentUserCaptain = data.captain;
                setIsCaptain(isCurrentUserCaptain);  // Set the captain status for UI control
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
            {item.role === "Captain" && (
                <View style={styles.captainIcon}>
                    <Shield color="#007BFF" size={20} />
                </View>
            )}
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
                    <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate("EditTeamScreen", { teamId })}>
                        <Text style={styles.editButtonText}>Edit</Text>
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
        width: 32,
        height: 32,
        borderRadius: 16,
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