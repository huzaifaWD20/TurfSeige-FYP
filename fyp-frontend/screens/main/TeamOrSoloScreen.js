"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native"
import { useNavigation } from "@react-navigation/native"

const TeamOrSoloScreen = () => {
  const navigation = useNavigation()
  const [selectedOption, setSelectedOption] = useState(null)

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Find Match</Text>
      <Text style={styles.subHeader}>Choose your type</Text>
      <View style={styles.optionContainer}>
        <TouchableOpacity
          style={[styles.option, selectedOption === "solo" && styles.optionSelected]}
          onPress={() => {
            setSelectedOption("solo")
            navigation.navigate("SoloScreen")
          }}
          activeOpacity={0.7}
        >
          <View style={styles.imageContainer}>
            <Image source={require("../../assets/screen3.jpg")} style={styles.image} />
            <Text style={styles.optionText}>Solo</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.option, selectedOption === "team" && styles.optionSelected]}
          onPress={() => {
            setSelectedOption("team")
            navigation.navigate("TeamScreen")
          }}
          activeOpacity={0.7}
        >
          <View style={styles.imageContainer}>
            <Image source={require("../../assets/screen2.jpg")} style={styles.image} />
            <Text style={styles.optionText}>Team</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  header: {
    fontSize: 30,
    fontWeight: "600",
    color: "#007BFF",
    marginBottom: 8,
    marginTop: 20,
    paddingTop: 50,
    textAlign: "center",
  },
  subHeader: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 30,
    textAlign: "center",
  },
  optionContainer: {
    width: "100%",
    paddingHorizontal: 20,
    gap: 20,
  },
  option: {
    width: "100%",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionSelected: {
    borderColor: "#007BFF",
    borderWidth: 2,
  },
  imageContainer: {
    width: "100%",
    height: 330,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  optionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007BFF",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    textAlign: "center",
    paddingVertical: 8,
  },
})

export default TeamOrSoloScreen
