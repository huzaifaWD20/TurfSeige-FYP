import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native"

const RemovePlayerModal = ({ isVisible, member, onCancel, onRemove }) => {
  if (!member) return null

  return (
    <Modal visible={isVisible} transparent={true} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Remove Player</Text>
          <Text style={styles.modalMessage}>Are you sure you want to remove {member?.name} from the team?</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333333",
  },
  modalMessage: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 24,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F0F0F0",
    borderRadius: 16,
    padding: 16,
    marginRight: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#333333",
    fontSize: 16,
    fontWeight: "500",
  },
  removeButton: {
    flex: 1,
    backgroundColor: "#FF4A4A",
    borderRadius: 16,
    padding: 16,
    marginLeft: 8,
    alignItems: "center",
  },
  removeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
})

export default RemovePlayerModal
