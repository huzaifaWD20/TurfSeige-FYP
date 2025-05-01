import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const ProfileEditModal = ({ isVisible, onClose, profileData, setProfileData }) => {
  const [formData, setFormData] = useState({
    name: profileData?.name || '',
    email: profileData?.email || '',
    nationality: profileData?.nationality || '',
    club: profileData?.club || 'None',
    skillLevel: profileData?.skillLevel || 'Beginner',
    age: profileData?.age || '',
    PAC: profileData?.PAC || 50,
    SHO: profileData?.SHO || 45,
    PAS: profileData?.PAS || 50,
    DRI: profileData?.DRI || 48,
    DEF: profileData?.DEF || 55,
    PHY: profileData?.PHY || 50,
    Individual_Rating: profileData?.Individual_Rating || 50,
    position: profileData?.position || 'Defender', // Added default position
  });

  useEffect(() => {
    if (profileData) {
      setFormData({
        ...profileData,
      });
    }
  }, [profileData]);

  const getDefaultStats = (skillLevel, position) => {
    const statsBySkill = {
      Beginner: { PAC: 50, SHO: 45, PAS: 50, DRI: 48, DEF: 55, PHY: 50 },
      Intermediate: { PAC: 60, SHO: 55, PAS: 60, DRI: 58, DEF: 65, PHY: 60 },
      Advanced: { PAC: 70, SHO: 65, PAS: 70, DRI: 68, DEF: 75, PHY: 70 },
      Professional: { PAC: 80, SHO: 75, PAS: 80, DRI: 78, DEF: 85, PHY: 80 },
    };

    let stats = { ...statsBySkill[skillLevel] || statsBySkill["Beginner"] };

    const positionBoost = {
      Defender: { DEF: 5, PHY: 3 },
      Attacker: { SHO: 5, PAC: 4 },
      Goalkeeper: { DEF: 6, PAS: 3 }
    };

    if (positionBoost[position]) {
      Object.keys(positionBoost[position]).forEach(stat => {
        stats[stat] += positionBoost[position][stat];
      });
    }

    return stats;
  };

  const handleSkillLevelChange = (newSkillLevel) => {
    const stats = getDefaultStats(newSkillLevel, formData.position);
    const individualRating = (
      (stats.PAC + stats.SHO + stats.PAS + stats.DRI + stats.DEF + stats.PHY) / 6
    ).toFixed(2);

    setFormData({
      ...formData,
      skillLevel: newSkillLevel,
      ...stats,
      Individual_Rating: parseFloat(individualRating),
    });
  };

  const handlePositionChange = (newPosition) => {
    const stats = getDefaultStats(formData.skillLevel, newPosition);
    const individualRating = (
      (stats.PAC + stats.SHO + stats.PAS + stats.DRI + stats.DEF + stats.PHY) / 6
    ).toFixed(2);

    setFormData({
      ...formData,
      position: newPosition,
      ...stats,
      Individual_Rating: parseFloat(individualRating),
    });
  };

  const handleSave = () => {
    setProfileData(formData); // Update the profile data in the parent screen
    onClose();
    alert("Profile updated!");
  };

  return (
    <Modal visible={isVisible} animationType="slide" onRequestClose={onClose} transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          <Text style={styles.label}>Age:</Text>
          <TextInput
            style={styles.input}
            value={formData.age.toString()}
            editable={false} // Disabled input
          />
          <Text style={styles.label}>Skill Level:</Text>
          <Picker selectedValue={formData.skillLevel} onValueChange={handleSkillLevelChange} style={styles.picker} enabled={false}>
            <Picker.Item label="Beginner" value="Beginner" />
            <Picker.Item label="Intermediate" value="Intermediate" />
            <Picker.Item label="Advanced" value="Advanced" />
            <Picker.Item label="Professional" value="Professional" />
          </Picker>

          <Text style={styles.label}>Nationality:</Text>
          <TextInput style={styles.input} value={formData.nationality} editable={false} />

          <Text style={styles.label}>Club:</Text>
          <TextInput style={styles.input} value={formData.club} editable={false} />

          <Text style={styles.label}>Position:</Text>
          <Picker selectedValue={formData.position} onValueChange={handlePositionChange} style={styles.picker} enabled={false}>
            <Picker.Item label="Defender" value="Defender" />
            <Picker.Item label="Attacker" value="Attacker" />
            <Picker.Item label="Goalkeeper" value="Goalkeeper" />
          </Picker>

          <Text style={styles.label}>Individual Rating: {formData.Individual_Rating}</Text>

          <Button title="Save Changes" onPress={handleSave} color="#007BFF" />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    width: '90%',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
    backgroundColor: '#E8E8E8',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  closeButtonText: {
    color: '#000',
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
    color: '#888', // Indicate disabled state
    backgroundColor: '#f4f4f4', // Indicate disabled state
  },
  picker: {
    marginBottom: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    color: '#888', // Indicate disabled state
    backgroundColor: '#f4f4f4', // Indicate disabled state
  },
});

export default ProfileEditModal;