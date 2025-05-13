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
    Image,
} from "react-native"
import { ChevronLeft, Calendar, MapPin, Clock, MessageSquare } from "lucide-react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import { Picker } from "@react-native-picker/picker"

// 🟡 Mock teams array (replace with your real data source later)
const teams = [
    {
        id: "1",
        name: "Water Board FC",
        logo: "https://example.com/thunder-logo.png",
        members: [
            { id: "1", name: "John", role: "Captain", avatar: "https://example.com/avatar1.png" },
            { id: "2", name: "Mike", role: "Defender", avatar: "https://example.com/avatar2.png" },
        ],
    },
    {
        id: "7",
        name: "Sadi town Fc",
        logo: "https://example.com/lightning-logo.png",
        members: [
            { id: "3", name: "Leo", role: "Captain", avatar: "https://example.com/avatar3.png" },
            { id: "4", name: "Chris", role: "Striker", avatar: "https://example.com/avatar4.png" },
        ],
    },
]

const RequestMatchScreen = ({ navigation, route }) => {
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

    const [userTeam, setUserTeam] = useState(null)
    const [date, setDate] = useState(new Date())
    const [time, setTime] = useState(new Date())
    const [location, setLocation] = useState("")
    const [message, setMessage] = useState("")
    const [format, setFormat] = useState("5v5")
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [showTimePicker, setShowTimePicker] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [teamMembers, setTeamMembers] = useState([])
    const [selectedMembers, setSelectedMembers] = useState([])

    useEffect(() => {
        const currentTeam = teams.find((team) => team.id === String(requestingTeamId))
        setUserTeam(currentTeam)

        if (currentTeam) {
            setTeamMembers(currentTeam.members)
            setSelectedMembers(currentTeam.members.map((member) => member.id))
        }
    }, [requestingTeamId])

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

    const handleSendRequest = () => {
        if (!location) return

        setIsLoading(true)

        const matchDateTime = new Date(date)
        matchDateTime.setHours(time.getHours(), time.getMinutes())

        const unselectedMembers = teamMembers.filter((member) => !selectedMembers.includes(member.id))

        setTimeout(() => {
            setIsLoading(false)
            navigation.navigate("MatchRequestsScreen", { tab: "outgoing" })
        }, 1000)
    }

    const renderMemberItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.memberItem, selectedMembers.includes(item.id) && styles.selectedMemberItem]}
            onPress={() => toggleMemberSelection(item.id)}
        >
            <Image source={{ uri: item.avatar }} style={styles.memberAvatar} />
            <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{item.name}</Text>
                <Text style={styles.memberRole}>{item.role}</Text>
            </View>
            <View style={[styles.checkBox, selectedMembers.includes(item.id) && styles.checkedBox]}>
                {selectedMembers.includes(item.id) && <Text style={styles.checkMark}>✓</Text>}
            </View>
        </TouchableOpacity>
    )

    if (!teamMembers.length) {
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
                    <Text>Loading team data...</Text>
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
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                        style={styles.membersList}
                    />
                </View>

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