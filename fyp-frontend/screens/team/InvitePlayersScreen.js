"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image, SafeAreaView, Alert } from "react-native"
import { ChevronLeft, Search, X } from "lucide-react-native"
import AsyncStorage from "@react-native-async-storage/async-storage";

const InvitePlayersScreen = ({ navigation, route }) => {
    const { teamId } = route.params || {};

    const [searchQuery, setSearchQuery] = useState("")
    const [users, setUsers] = useState([])
    const [filteredUsers, setFilteredUsers] = useState([])

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const token = await AsyncStorage.getItem("accessToken");

                if (token) {
                    const response = await fetch("http://192.168.20.188:8000/api/teams/available-players/", {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const playersWithInviteStatus = data.map(player => ({
                            ...player,
                            invited: false,
                        }));
                        setUsers(playersWithInviteStatus);
                        setFilteredUsers(playersWithInviteStatus);
                    } else {
                        console.error("Failed to fetch players:", response.status);
                    }
                } else {
                    console.log("No access token found.");
                }
            } catch (error) {
                console.error("Error fetching players:", error);
            }
        };

        fetchPlayers();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredUsers(users);
        } else {
            const filtered = users.filter((user) =>
                user.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredUsers(filtered);
        }
    }, [searchQuery, users]);

    const inviteSinglePlayer = async (playerId) => {
        if (!teamId) {
            Alert.alert("Error", "Team not specified");
            return false;
        }

        try {
            const token = await AsyncStorage.getItem("accessToken");

            const response = await fetch(`http://192.168.20.188:8000/api/teams/${teamId}/invite/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ user_id: playerId }),
            });

            const result = await response.json();

            if (!response.ok) {
                Alert.alert("Error", result.message || "Failed to send invitation");
                return false;
            }

            Alert.alert("Success", "Invitation sent successfully!");
            return true;
        } catch (error) {
            console.error("Invite error:", error);
            Alert.alert("Error", error.message || "Something went wrong. Try again.");
            return false;
        }
    };

    const renderUserItem = ({ item }) => (
        <View style={styles.userItem}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <Text style={styles.userName}>{item.name}</Text>
            <View style={styles.buttonsContainer}>
                <TouchableOpacity
                    style={[
                        styles.directInviteButton,
                        item.invited && { backgroundColor: "#ccc" },
                    ]}
                    disabled={item.invited}
                    onPress={async () => {
                        const success = await inviteSinglePlayer(item.id);
                        if (success) {
                            const updatedUsers = users.map(user =>
                                user.id === item.id ? { ...user, invited: true } : user
                            );
                            setUsers(updatedUsers);
                            setFilteredUsers(updatedUsers.filter(user =>
                                searchQuery.trim() === "" ||
                                user.name.toLowerCase().includes(searchQuery.toLowerCase())
                            ));
                        }
                    }}
                >
                    <Text style={[
                        styles.directInviteText,
                        item.invited && { color: "#888" }
                    ]}>
                        {item.invited ? "Invited" : "Invite Now"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

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
        </SafeAreaView>
    );
};

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
        borderBottomColor: "#E5E5E5",
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    userName: {
        flex: 1,
        fontSize: 16,
        color: "#333333",
    },
    buttonsContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    directInviteButton: {
        backgroundColor: "#007BFF",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginLeft: 10,
    },
    directInviteText: {
        color: "#FFF",
        fontWeight: "600",
    },
});

export default InvitePlayersScreen;
