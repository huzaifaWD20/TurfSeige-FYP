import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const { width, height } = Dimensions.get('window');

const ProfileEditModal = ({ isVisible, onClose, profileData, onSubmit }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (profileData) {
            setFormData({
                ...profileData,
                age: profileData.age?.toString() || '',
            });
        }
    }, [profileData]);

    const getDefaultStats = (skill_level, position) => {
        const statsBySkill = {
            Beginner: { PAC: 50, SHO: 45, PAS: 50, DRI: 48, DEF: 55, PHY: 50 },
            Intermediate: { PAC: 60, SHO: 55, PAS: 60, DRI: 58, DEF: 65, PHY: 60 },
            Advanced: { PAC: 70, SHO: 65, PAS: 70, DRI: 68, DEF: 75, PHY: 70 },
            Professional: { PAC: 80, SHO: 75, PAS: 80, DRI: 78, DEF: 85, PHY: 80 },
        };

        let stats = { ...statsBySkill[skill_level] || statsBySkill["Beginner"] };

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

    const handleSkillLevelChange = (skill_level) => {
        const stats = getDefaultStats(skill_level, formData.position);
        const Individual_Rating = (
            (stats.PAC + stats.SHO + stats.PAS + stats.DRI + stats.DEF + stats.PHY) / 6
        ).toFixed(2);

        setFormData(prev => ({
            ...prev,
            skill_level,
            ...stats,
            Individual_Rating: parseFloat(Individual_Rating),
        }));
    };

    const handlePositionChange = (position) => {
        const stats = getDefaultStats(formData.skill_level, position);
        const Individual_Rating = (
            (stats.PAC + stats.SHO + stats.PAS + stats.DRI + stats.DEF + stats.PHY) / 6
        ).toFixed(2);

        setFormData(prev => ({
            ...prev,
            position,
            ...stats,
            Individual_Rating: parseFloat(Individual_Rating),
        }));
    };

    const handleSave = () => {
        onSubmit({
            ...formData,
            age: parseInt(formData.age),
        });
        onClose();
    };

    return (
        <Modal visible={isVisible} animationType="slide" transparent={true}>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <ScrollView>
                        <Text style={styles.modalTitle}>Edit Profile</Text>

                        <Text style={styles.label}>Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Name"
                            value={formData.name}
                            onChangeText={text => setFormData({ ...formData, name: text })}
                        />

                        <Text style={styles.label}>Age</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Age"
                            keyboardType="numeric"
                            value={formData.age}
                            onChangeText={text => setFormData({ ...formData, age: text })}
                        />

                        <Text style={styles.label}>Nationality</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nationality"
                            value={formData.nationality}
                            onChangeText={text => setFormData({ ...formData, nationality: text })}
                        />

                        <Text style={styles.label}>Club</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Club"
                            value={formData.club}
                            onChangeText={text => setFormData({ ...formData, club: text })}
                        />

                        <Text style={styles.label}>Skill Level</Text>
                        <Picker selectedValue={formData.skill_level} onValueChange={handleSkillLevelChange}>
                            <Picker.Item label="Beginner" value="Beginner" />
                            <Picker.Item label="Intermediate" value="Intermediate" />
                            <Picker.Item label="Advanced" value="Advanced" />
                            <Picker.Item label="Professional" value="Professional" />
                        </Picker>

                        <Text style={styles.label}>Position</Text>
                        <Picker selectedValue={formData.position} onValueChange={handlePositionChange}>
                            <Picker.Item label="Defender" value="Defender" />
                            <Picker.Item label="Attacker" value="Attacker" />
                            <Picker.Item label="Goalkeeper" value="Goalkeeper" />
                        </Picker>

                        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                            <Text style={styles.saveButtonText}>Save</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: width * 0.9,
        maxHeight: height * 0.85,
        alignSelf: 'center',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    saveButton: {
        backgroundColor: '#007BFF', // blue color
        padding: 12,
        borderRadius: 8,
        marginTop: 15,
    },
    saveButtonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    cancelButton: {
        marginTop: 10,
        padding: 12,
        backgroundColor: '#ccc',
        borderRadius: 8,
    },
    cancelButtonText: {
        textAlign: 'center',
        color: '#333',
    },
});

export default ProfileEditModal;
