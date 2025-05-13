"use client"

import { useState, useEffect } from "react"
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
    FlatList,
    Alert,
} from "react-native"
import { ChevronLeft, Calendar, MapPin, Clock, MessageSquare } from "lucide-react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import { Picker } from "@react-native-picker/picker"
import AsyncStorage from '@react-native-async-storage/async-storage';

const RequestMatchScreen = ({ navigation, route }) => {
    const {
        opponentTeamId,
        opponentTeamName,
        requestingTeamId,
        requestingTeamName,
    } = route.params;

    const [userTeam, setUserTeam] = useState(null)
    const [teamMembers, setTeamMembers] = useState([])
    const [selectedMembers, setSelectedMembers] = useState([])
    const [date, setDate] = useState(new Date())
    const [time, setTime] = useState(new Date())
    const [location, setLocation] = useState("")
    const [message, setMessage] = useState("")
    const [format, setFormat] = useState("5v5")
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [showTimePicker, setShowTimePicker] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isTeamDataLoading, setIsTeamDataLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState(null)

    // Fetch team data when component mounts
    useEffect(() => {
        fetchTeamData();
    }, [requestingTeamId]);

    const fetchTeamData = async () => {
        setIsTeamDataLoading(true);
        setErrorMessage(null);

        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) throw new Error('Authentication token not found');

            const response = await fetch(`http://192.168.20.188:8000/api/teams/${requestingTeamId}/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error(`API error: ${response.status}`);

            const data = await response.json();

            // Safely handle the data structure
            const members = data.members?.map(member => ({
                ...member,
                position: member?.position || 'Not specified' // Default value if position is null/undefined
            })) || []; // Fallback empty array if members is undefined

            console.log("Team data:", data);
            console.log("Processed members:", members);

            setUserTeam({
                ...data,
                members: members
            });

            setTeamMembers(members);
            setSelectedMembers(members.map(member => member.id));

            setIsTeamDataLoading(false);
        } catch (error) {
            console.error('Error fetching team data:', error);
            setErrorMessage(error.message || 'Failed to load team data');
            setIsTeamDataLoading(false);
        }
    };
    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || date
        setShowDatePicker(false)
        setDate(currentDate)
    }

    const handleTimeChange = (event, selectedTime) => {
        const currentTime = selectedTime || time
        setShowTimePicker(false)
        setTime(currentTime)
    }

    const toggleMemberSelection = (memberId) => {
        if (selectedMembers.includes(memberId)) {
            setSelectedMembers(selectedMembers.filter((id) => id !== memberId))
        } else {
            setSelectedMembers([...selectedMembers, memberId])
        }
    }

    const handleSendRequest = async () => {
        if (!location) {
            Alert.alert("Missing Information", "Please enter a match location");
            return;
        }

        setIsLoading(true);

        try {
            // Format the date to match what Django expects (YYYY-MM-DD)
            const dateStr = date.toISOString().split('T')[0];

            // Prepare request payload that matches your Django view's expectations
            const requestData = {
                requestingTeamId: requestingTeamId,  // Note camelCase to match your Django view
                targetTeamId: opponentTeamId,       // Note camelCase to match your Django view
                format: format,                     // Simple format name (not match_format)
                date: dateStr,                      // Just the date part (YYYY-MM-DD)
                location: location,
                message: message,
                // selected_members: selectedMembers, // Uncomment if you implement this later
            };

            const token = await AsyncStorage.getItem('accessToken');
            if (!token) throw new Error('Authentication token not found');

            const response = await fetch('http://192.168.20.188:8000/api/match/request/custom/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            // Check if the response is successful (status code 2xx)
            if (!response.ok) {
                // Try to parse the error response
                let errorMessage = 'Failed to send match request';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    console.warn('Could not parse error response', e);
                }
                throw new Error(errorMessage);
            }

            // If successful
            Alert.alert(
                "Success",
                "Match request sent successfully!",
                [{ text: "OK", onPress: () => navigation.navigate("MatchRequestsScreen", { tab: "outgoing" }) }]
            );
        } catch (error) {
            console.error('Error sending match request:', error);
            Alert.alert(
                "Error",
                error.message || "Failed to send match request. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };
    const renderMemberItem = ({ item }) => {
        if (!item) return null; // Safety check

        const isCaptain = userTeam?.captain === item.id;
        const position = item.position || 'Position not set';

        return (
            <TouchableOpacity
                style={[styles.memberItem, selectedMembers.includes(item.id) && styles.selectedMemberItem]}
                onPress={() => toggleMemberSelection(item.id)}
            >
                <View style={styles.memberAvatar}>
                    <Text style={styles.memberInitial}>{(item.name || '?').charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{item.name || 'Unknown'}</Text>
                    <Text style={styles.memberRole}>{isCaptain ? 'Captain' : 'Member'}</Text>
                    <Text style={styles.memberPosition}>{position}</Text>
                </View>
                <View style={[styles.checkBox, selectedMembers.includes(item.id) && styles.checkedBox]}>
                    {selectedMembers.includes(item.id) && <Text style={styles.checkMark}>✓</Text>}
                </View>
            </TouchableOpacity>
        );
    };
    if (isTeamDataLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <ChevronLeft color="#007BFF" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Request Match</Text>
                    <View style={styles.placeholderView} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007BFF" />
                    <Text style={styles.loadingText}>Loading team data...</Text>
                </View>
            </SafeAreaView>
        )
    }

    if (errorMessage) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <ChevronLeft color="#007BFF" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Request Match</Text>
                    <View style={styles.placeholderView} />
                </View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{errorMessage}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchTeamData}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <ChevronLeft color="#007BFF" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Request Match</Text>
                <View style={styles.placeholderView} />
            </View>

            {/* FORM */}
            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                <View style={styles.teamInfoContainer}>
                    <Text style={styles.sectionTitle}>Requesting Team</Text>
                    <Text style={styles.teamName}>{requestingTeamName}</Text>
                </View>

                <View style={styles.teamInfoContainer}>
                    <Text style={styles.sectionTitle}>Opponent Team</Text>
                    <Text style={styles.teamName}>{opponentTeamName}</Text>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Match Format</Text>
                    <View style={styles.pickerContainer}>
                        <Picker selectedValue={format} onValueChange={(itemValue) => setFormat(itemValue)} style={styles.picker}>
                            <Picker.Item label="5v5" value="5v5" />
                            <Picker.Item label="6v6" value="6v6" />
                            <Picker.Item label="7v7" value="7v7" />
                            <Picker.Item label="11v11" value="11v11" />
                        </Picker>
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Date</Text>
                    <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowDatePicker(true)}>
                        <Calendar color="#666666" size={20} />
                        <Text style={styles.dateTimeText}>
                            {date.toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker value={date} mode="date" display="default" onChange={handleDateChange} minimumDate={new Date()} />
                    )}
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Time</Text>
                    <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowTimePicker(true)}>
                        <Clock color="#666666" size={20} />
                        <Text style={styles.dateTimeText}>
                            {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </Text>
                    </TouchableOpacity>
                    {showTimePicker && <DateTimePicker value={time} mode="time" display="default" onChange={handleTimeChange} />}
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Location</Text>
                    <View style={styles.locationInputContainer}>
                        <MapPin color="#666666" size={20} style={styles.inputIcon} />
                        <TextInput
                            style={styles.locationInput}
                            placeholder="Enter match location"
                            value={location}
                            onChangeText={setLocation}
                        />
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Message (Optional)</Text>
                    <View style={styles.messageInputContainer}>
                        <MessageSquare color="#666666" size={20} style={styles.inputIcon} />
                        <TextInput
                            style={styles.messageInput}
                            placeholder="Add a message to the opponent team"
                            value={message}
                            onChangeText={setMessage}
                            multiline
                            numberOfLines={4}
                        />
                    </View>
                </View>

                {teamMembers.length > 0 && (
                    <View style={styles.formGroup}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.label}>Invite Team Members</Text>
                            <TouchableOpacity onPress={() => setSelectedMembers(teamMembers.map((member) => member.id))}>
                                <Text style={styles.selectAllText}>Select All</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.helperText}>Unselected members will create openings for solo players to join</Text>
                        <FlatList
                            data={teamMembers}
                            renderItem={renderMemberItem}
                            keyExtractor={(item) => item.id.toString()}
                            scrollEnabled={false}
                            style={styles.membersList}
                        />
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.sendButton, (!location) && styles.disabledButton]}
                    onPress={handleSendRequest}
                    disabled={!location || isLoading}
                >
                    {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.sendButtonText}>Send Request</Text>}
                </TouchableOpacity>
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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: "#666666",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    errorText: {
        fontSize: 16,
        color: "#FF3B30",
        textAlign: "center",
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: "#007BFF",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 16,
    },
    retryButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 24,
    },
    teamInfoContainer: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "500",
        color: "#666666",
        marginBottom: 8,
    },
    teamName: {
        fontSize: 18,
        fontWeight: "600",
    },
    formGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 8,
        color: "#333333",
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: "#E5E5E5",
        borderRadius: 16,
        backgroundColor: "#F8F9FA",
        overflow: "hidden",
    },
    picker: {
        height: 50,
    },
    dateTimeButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8F9FA",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E5E5E5",
    },
    dateTimeText: {
        fontSize: 16,
        marginLeft: 8,
        color: "#333333",
    },
    locationInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8F9FA",
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: "#E5E5E5",
    },
    inputIcon: {
        marginRight: 8,
    },
    locationInput: {
        flex: 1,
        height: 50,
        fontSize: 16,
    },
    messageInputContainer: {
        flexDirection: "row",
        backgroundColor: "#F8F9FA",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E5E5E5",
        alignItems: "flex-start",
    },
    messageInput: {
        flex: 1,
        height: 100,
        fontSize: 16,
        textAlignVertical: "top",
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    selectAllText: {
        fontSize: 14,
        color: "#007BFF",
    },
    helperText: {
        fontSize: 14,
        color: "#666666",
        marginBottom: 12,
        fontStyle: "italic",
    },
    membersList: {
        marginTop: 8,
    },
    memberItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8F9FA",
        borderRadius: 16,
        padding: 12,
        marginBottom: 8,
    },
    selectedMemberItem: {
        backgroundColor: "rgba(0, 123, 255, 0.1)",
    },
    memberAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: "#007BFF",
        justifyContent: 'center',
        alignItems: 'center',
    },
    memberInitial: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
    },
    memberPosition: {
        fontSize: 11,
        color: "#888888",
        marginTop: 2,
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: 14,
        fontWeight: "500",
        marginBottom: 4,
    },
    memberRole: {
        fontSize: 12,
        color: "#666666",
    },
    checkBox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#E5E5E5",
        justifyContent: "center",
        alignItems: "center",
    },
    checkedBox: {
        backgroundColor: "#007BFF",
        borderColor: "#007BFF",
    },
    checkMark: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "bold",
    },
    sendButton: {
        backgroundColor: "#007BFF",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        marginTop: 16,
    },
    disabledButton: {
        backgroundColor: "#CCCCCC",
    },
    sendButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
})

export default RequestMatchScreen