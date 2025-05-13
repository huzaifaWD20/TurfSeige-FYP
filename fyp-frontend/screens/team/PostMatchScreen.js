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
    Alert,
} from "react-native"
import { ChevronLeft, Calendar, MapPin, Clock, Users } from "lucide-react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import { Picker } from "@react-native-picker/picker"
import AsyncStorage from "@react-native-async-storage/async-storage"

const PostMatchScreen = ({ navigation, route }) => {
    const { teamId } = route.params || {}

    const [team, setTeam] = useState(null)
    const [date, setDate] = useState(new Date())
    const [time, setTime] = useState(new Date())
    const [location, setLocation] = useState("")
    const [format, setFormat] = useState("5v5")
    const [paymentCondition, setPaymentCondition] = useState("lose_to_pay")
    const [requiredPlayers, setRequiredPlayers] = useState("5")
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [showTimePicker, setShowTimePicker] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const fetchTeamDetails = async () => {
            try {
                const token = await AsyncStorage.getItem("accessToken")
                if (!token) throw new Error("Access token not found")

                const response = await fetch(`http://192.168.20.188:8000/api/teams/${teamId}/`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.detail || "Failed to fetch team details")
                }

                const data = await response.json()
                setTeam(data)
            } catch (error) {
                console.error("Error fetching team:", error)
                Alert.alert("Error", error.message)
            }
        }

        if (teamId) {
            fetchTeamDetails()
        }
    }, [teamId])

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false)
        if (selectedDate) setDate(selectedDate)
    }

    const handleTimeChange = (event, selectedTime) => {
        setShowTimePicker(false)
        if (selectedTime) setTime(selectedTime)
    }

    const handlePostMatch = async () => {
        if (!location) {
            Alert.alert("Error", "Please enter a location");
            return;
        }

        setIsLoading(true);

        try {
            const token = await AsyncStorage.getItem("accessToken");
            if (!token) throw new Error("Access token not found");

            const formattedDate = date.toISOString().split("T")[0];
            const formattedTime = time.toTimeString().split(" ")[0].slice(0, 5);

            const matchData = {
                team_id: teamId,
                match_format: format,
                date: formattedDate,
                time: formattedTime,
                location,
                payment_condition: paymentCondition,
                //message: message || "",
            };

            const response = await fetch("http://192.168.20.188:8000/api/match/create-match/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(matchData),
            });

            // If response is not OK, log the error details
            if (!response.ok) {
                const errorData = await response.json();
                //console.log("Error Response from Backend:", errorData); // Add this line to log the error
                throw new Error(errorData.error || "Failed to create match");
            }

            Alert.alert(
                "Match Posted",
                "Your match has been posted successfully.",
                [{ text: "OK", onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error("Post match error:", error);
            Alert.alert("Error", error.message || "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };


    if (!team) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <ChevronLeft color="#007BFF" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Post Match</Text>
                    <View style={styles.placeholderView} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" />
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
                <Text style={styles.headerTitle}>Post Match</Text>
                <View style={styles.placeholderView} />
            </View>

            <ScrollView contentContainerStyle={styles.contentContainer}>
                <View style={styles.teamInfoContainer}>
                    <Text style={styles.sectionTitle}>Team</Text>
                    <Text style={styles.teamName}>{team.name}</Text>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Match Format</Text>
                    <View style={styles.pickerContainer}>
                        <Picker selectedValue={format} onValueChange={setFormat} style={styles.picker}>
                            <Picker.Item label="5v5" value="5v5" />
                            <Picker.Item label="6v6" value="6v6" />
                            <Picker.Item label="7v7" value="7v7" />
                            <Picker.Item label="11v11" value="11v11" />
                        </Picker>
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Payment Condition</Text>
                    <View style={styles.pickerContainer}>
                        <Picker selectedValue={paymentCondition} onValueChange={setPaymentCondition} style={styles.picker}>
                            <Picker.Item label="Lose to Pay" value="lose_to_pay" />
                            <Picker.Item label="50/50 Split" value="50_50" />
                            <Picker.Item label="70/30 Split" value="70_30" />
                        </Picker>
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Date</Text>
                    <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowDatePicker(true)}>
                        <Calendar color="#666" size={20} />
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
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                            minimumDate={new Date()}
                        />
                    )}
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Time</Text>
                    <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowTimePicker(true)}>
                        <Clock color="#666" size={20} />
                        <Text style={styles.dateTimeText}>
                            {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </Text>
                    </TouchableOpacity>
                    {showTimePicker && (
                        <DateTimePicker value={time} mode="time" display="default" onChange={handleTimeChange} />
                    )}
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Location</Text>
                    <View style={styles.locationInputContainer}>
                        <MapPin color="#666" size={20} />
                        <TextInput
                            style={styles.locationInput}
                            placeholder="Enter match location"
                            value={location}
                            onChangeText={setLocation}
                        />
                    </View>
                </View>

                <View style={styles.teamStrengthContainer}>
                    <Text style={styles.teamStrengthTitle}>Team Strength</Text>
                    <View style={styles.teamStrengthInfo}>
                        <View style={styles.strengthItem}>
                            <Users color="#007BFF" size={20} />
                            <Text style={styles.strengthText}>
                                {team.members.length} / {requiredPlayers} players confirmed
                            </Text>
                        </View>
                        <Text style={styles.strengthNote}>
                            {team.members.length < parseInt(requiredPlayers)
                                ? "You'll need to find more players."
                                : "Your team is complete!"}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.postButton, (!location || isLoading) && styles.disabledButton]}
                    onPress={handlePostMatch}
                    disabled={!location || isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.postButtonText}>Post Match</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        marginTop: 35,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: "600", color: "#007BFF" },
    placeholderView: { width: 40 },
    contentContainer: { padding: 16 },
    teamInfoContainer: { marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
    teamName: { fontSize: 16 },
    formGroup: { marginBottom: 16 },
    label: { fontSize: 14, marginBottom: 4 },
    pickerContainer: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        overflow: "hidden",
    },
    picker: { height: 50 },
    dateTimeButton: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
    },
    dateTimeText: { marginLeft: 10 },
    locationInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 10,
    },
    locationInput: { flex: 1, height: 50 },
    teamStrengthContainer: { marginVertical: 16 },
    teamStrengthTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
    teamStrengthInfo: {},
    strengthItem: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
    strengthText: { marginLeft: 8 },
    strengthNote: { color: "#666", fontSize: 13 },
    postButton: {
        backgroundColor: "#007BFF",
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
    },
    postButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    disabledButton: { backgroundColor: "#aaa" },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
})

export default PostMatchScreen
