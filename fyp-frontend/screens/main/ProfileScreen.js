import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    Platform,
    SafeAreaView,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfileEditModal from '../../components/ProfileEditModal';

const { width } = Dimensions.get('screen');

const ProfileScreen = () => {
    const [profileData, setProfileData] = useState({
        name: 'John Doe',
        email: 'john.doe@example.com',
        age: '25',
        nationality: 'American',
        club: 'Local Futsal Club',
        Individual_Rating: 78,
        skill_level: 'Beginner',
        position: 'Defender',
    });
    const [isModalVisible, setModalVisible] = useState(false);
    const navigation = useNavigation();

    const handleLogout = () => {
        console.log('Logging out');
        navigation.replace('Login');
        AsyncStorage.removeItem("accessToken");
    };

    const handleEditProfile = async (updatedProfileData) => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) {
                console.warn('No token found');
                return;
            }

            const response = await fetch('http://192.168.2.109:8000/api/profile/', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updatedProfileData),
            });

            if (!response.ok) {
                console.error('Failed to update profile');
                return;
            }

            const data = await response.json();
            setProfileData({
                name: data.name || 'N/A',
                email: data.email || 'N/A',
                age: data.age ? String(data.age) : 'N/A',
                nationality: data.nationality || 'N/A',
                club: data.club || 'N/A',
                Individual_Rating: data.Individual_Rating || 0,
                skill_level: data.skill_level || 'Beginner',
                position: data.position || 'Defender',
            });
            console.log('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            const fetchProfileData = async () => {
                try {
                    const token = await AsyncStorage.getItem('accessToken');
                    if (!token) {
                        console.warn('No token found');
                        return;
                    }

                    const response = await fetch('http://192.168.2.109:8000/api/profile/', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (!response.ok) {
                        console.error('Failed to fetch profile data');
                        return;
                    }

                    const data = await response.json();
                    setProfileData({
                        name: data.name || 'N/A',
                        email: data.email || 'N/A',
                        age: data.age ? String(data.age) : 'N/A',
                        nationality: data.nationality || 'N/A',
                        club: data.club || 'N/A',
                        Individual_Rating: data.Individual_Rating || 0,
                        skill_level: data.skill_level || 'Beginner',
                        position: data.position || 'Defender',
                    });
                } catch (error) {
                    console.error('Error fetching profile data:', error);
                }
            };

            fetchProfileData();
        }, [])
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.profileImageContainer}>
                    <Image
                        source={{ uri: 'https://via.placeholder.com/150' }}
                        style={styles.profileImage}
                    />
                </View>
                <Text style={styles.name}>{profileData.name}</Text>
                <Text style={styles.email}>{profileData.email}</Text>
                <Text style={styles.label}>Age: {profileData.age}</Text>
                <Text style={styles.label}>Nationality: {profileData.nationality}</Text>
                <Text style={styles.label}>Club: {profileData.club}</Text>
                <Text style={styles.label}>Individual Rating: {profileData.Individual_Rating}</Text>
                <Text style={styles.label}>Skill Level: {profileData.skill_level}</Text>
                <Text style={styles.label}>Position: {profileData.position}</Text>
            </View>

            <View style={styles.menuContainer}>
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.menuText}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.menuItem, styles.logoutButton]}
                    onPress={handleLogout}
                >
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
            </View>

            <ProfileEditModal
                isVisible={isModalVisible}
                onClose={() => setModalVisible(false)}
                profileData={profileData}
                onSubmit={handleEditProfile}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        marginTop: Platform.OS === 'android' ? 40 : 0,
    },
    header: {
        alignItems: 'center',
        padding: 20,
    },
    profileImageContainer: {
        width: width * 0.25,
        height: width * 0.25,
        borderRadius: (width * 0.25) / 2,
        overflow: 'hidden',
        marginBottom: 15,
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    name: {
        fontSize: width * 0.06,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    email: {
        fontSize: width * 0.04,
        color: '#666',
    },
    label: {
        fontSize: width * 0.035,
        color: '#666',
        marginTop: 3,
    },
    menuContainer: {
        padding: 15,
        marginTop: 20,
    },
    menuItem: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        marginBottom: 10,
    },
    menuText: {
        fontSize: width * 0.04,
        color: '#333',
    },
    logoutButton: {
        backgroundColor: '#FF3B30',
        marginTop: 20,
    },
    logoutText: {
        color: '#fff',
        fontSize: width * 0.04,
        textAlign: 'center',
    },
});

export default ProfileScreen;
