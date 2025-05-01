"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from "react-native"
import { ChevronLeft, Upload } from "lucide-react-native"
import * as ImagePicker from "expo-image-picker"
import { useTeam } from "../../context/TeamContext"

const CreateTeamScreen = ({ navigation }) => {
  const { createTeam } = useTeam()
  const [teamName, setTeamName] = useState("")
  const [teamDescription, setTeamDescription] = useState("")
  const [teamLogo, setTeamLogo] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled) {
      setTeamLogo(result.assets[0].uri)
    }
  }

  const handleCreateTeam = () => {
    if (!teamName.trim()) return

    setIsLoading(true)

    // Create team using context
    const newTeam = createTeam({
      name: teamName,
      description: teamDescription,
      logo: teamLogo || "https://via.placeholder.com/100",
      isPublic: true,
      requireApproval: true,
    })

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      navigation.navigate("TeamMembersScreen", { teamId: newTeam.id })
    }, 1000)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#007BFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Team</Text>
        <View style={styles.placeholderView} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.logoContainer}>
          {teamLogo ? (
            <Image source={{ uri: teamLogo }} style={styles.logoImage} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoPlaceholderText}>LOGO</Text>
            </View>
          )}
          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Upload color="#007BFF" size={20} />
            <Text style={styles.uploadButtonText}>Upload Logo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Team Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter team name"
            value={teamName}
            onChangeText={setTeamName}
            maxLength={30}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Team Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter team description or motto"
            value={teamDescription}
            onChangeText={setTeamDescription}
            multiline
            numberOfLines={4}
            maxLength={200}
          />
        </View>

        <TouchableOpacity
          style={[styles.createButton, !teamName.trim() && styles.disabledButton]}
          onPress={handleCreateTeam}
          disabled={!teamName.trim() || isLoading}
        >
          {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.createButtonText}>Create Team</Text>}
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logoPlaceholderText: {
    fontSize: 16,
    color: "#999999",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  uploadButtonText: {
    fontSize: 14,
    color: "#007BFF",
    marginLeft: 8,
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
  input: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  createButton: {
    backgroundColor: "#007BFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default CreateTeamScreen
