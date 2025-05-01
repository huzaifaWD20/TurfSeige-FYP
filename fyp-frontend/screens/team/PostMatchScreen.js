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
import { useTeam } from "../../context/TeamContext"

const PostMatchScreen = ({ navigation, route }) => {
  const { teamId } = route.params || {}
  const { getTeamById, postOpenMatch } = useTeam()

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
    const teamData = getTeamById(teamId)
    setTeam(teamData)
  }, [teamId])

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

  const handlePostMatch = () => {
    if (!location) {
      Alert.alert("Error", "Please enter a location")
      return
    }

    setIsLoading(true)

    // Combine date and time
    const matchDateTime = new Date(date)
    matchDateTime.setHours(time.getHours(), time.getMinutes())

    // Create match data
    const matchData = {
      teamId,
      teamName: team.name,
      teamLogo: team.logo,
      date: matchDateTime,
      location,
      format,
      paymentCondition,
      requiredPlayers: Number.parseInt(requiredPlayers),
      confirmedPlayers: team.members.length,
      captain: team.members.find((member) => member.role === "Captain"),
    }

    // Post open match
    postOpenMatch(matchData)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      Alert.alert(
        "Match Posted",
        "Your match has been posted successfully. Other teams can now request to play against you.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ],
      )
    }, 1000)
  }

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

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.teamInfoContainer}>
          <Text style={styles.sectionTitle}>Team</Text>
          <Text style={styles.teamName}>{team.name}</Text>
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
          <Text style={styles.label}>Required Players</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={requiredPlayers}
              onValueChange={(itemValue) => setRequiredPlayers(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="5 players" value="5" />
              <Picker.Item label="6 players" value="6" />
              <Picker.Item label="7 players" value="7" />
              <Picker.Item label="11 players" value="11" />
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Payment Condition</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={paymentCondition}
              onValueChange={(itemValue) => setPaymentCondition(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Lose to Pay" value="lose_to_pay" />
              <Picker.Item label="50/50 Split" value="50_50" />
              <Picker.Item label="70/30 Split" value="70_30" />
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowDatePicker(true)}>
            <Calendar color="#666666" size={20} />
            <Text style={styles.dateTimeText}>
              {date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
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
              {team.members.length < Number.parseInt(requiredPlayers)
                ? "You'll need to find more players to complete your team."
                : "Your team is complete!"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.postButton, !location && styles.disabledButton]}
          onPress={handlePostMatch}
          disabled={!location || isLoading}
        >
          {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.postButtonText}>Post Match</Text>}
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
  teamStrengthContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  teamStrengthTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
  },
  teamStrengthInfo: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
  },
  strengthItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  strengthText: {
    fontSize: 14,
    marginLeft: 8,
  },
  strengthNote: {
    fontSize: 14,
    color: "#666666",
    fontStyle: "italic",
  },
  postButton: {
    backgroundColor: "#28A745",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
  },
  postButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default PostMatchScreen
