import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
  Image,
  SafeAreaView,
  TextInput, // Changed to use React Native's TextInput instead
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import MapView, { Marker } from 'react-native-maps';
import { ChevronLeft } from 'lucide-react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const ScheduleScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [matches, setMatches] = useState([]);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newMatch, setNewMatch] = useState({
    teamName: '',
    playerCount: '',
    time: new Date(),
    location: null,
    paymentType: 'loose_to_pay',
  });

  useEffect(() => {
    if (selectedDate) {
      fetchMatchesForDate(selectedDate);
    }
  }, [selectedDate]);

  const fetchMatchesForDate = async (date) => {
    try {
      // Simulating API call with conditional data
      if (date === '2024-12-02') {
        setMatches([]);
      } else {
        setMatches([
          {
            id: 1,
            title: 'Boeung Ket Club',
            type: '5v5',
            time: '18:00 - 19:00',
            location: 'Central Stadium',
            imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYGEW2fcgeUhCYSdHk-tzwoZZ5uLZOalU1Yw&s'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const renderHeader = () => (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft color="#007BFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule</Text>
        <View style={styles.placeholderView} />
      </View>
    </SafeAreaView>
  );

  const renderCreateMatchModal = () => (
    <Modal
      visible={isCreateModalVisible}
      animationType="slide"
      transparent={true}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Match</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Team Name"
              value={newMatch.teamName}
              onChangeText={(text) => setNewMatch({...newMatch, teamName: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Number of Players"
              keyboardType="numeric"
              value={newMatch.playerCount}
              onChangeText={(text) => setNewMatch({...newMatch, playerCount: text})}
            />

            <View style={styles.paymentTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  newMatch.paymentType === 'loose_to_pay' && styles.selectedPayment
                ]}
                onPress={() => setNewMatch({...newMatch, paymentType: 'loose_to_pay'})}
              >
                <Text style={[
                  styles.paymentText,
                  newMatch.paymentType === 'loose_to_pay' && styles.selectedPaymentText
                ]}>Lose to Pay</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  newMatch.paymentType === '50_50' && styles.selectedPayment
                ]}
                onPress={() => setNewMatch({...newMatch, paymentType: '50_50'})}
              >
                <Text style={[
                  styles.paymentText,
                  newMatch.paymentType === '50_50' && styles.selectedPaymentText
                ]}>50/50</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  newMatch.paymentType === '70_30' && styles.selectedPayment
                ]}
                onPress={() => setNewMatch({...newMatch, paymentType: '70_30'})}
              >
                <Text style={[
                  styles.paymentText,
                  newMatch.paymentType === '70_30' && styles.selectedPaymentText
                ]}>70/30</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: 37.78825,
                  longitude: -122.4324,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                onPress={(e) => setNewMatch({
                  ...newMatch,
                  location: e.nativeEvent.coordinate
                })}
              >
                {newMatch.location && (
                  <Marker coordinate={newMatch.location} />
                )}
              </MapView>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsCreateModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => {
                  // Handle match creation
                  setIsCreateModalVisible(false);
                }}
              >
                <Text style={styles.buttonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: '#007BFF' }
        }}
        theme={{
          selectedDayBackgroundColor: '#007BFF',
          todayTextColor: '#007BFF',
          arrowColor: '#007BFF',
        }}
      />

      <View style={styles.scheduleContainer}>
        <View style={styles.scheduleHeader}>
          <Text style={styles.scheduleTitle}>My Schedule</Text>
          <Text style={styles.selectedDate}>
            {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            }) : ''}
          </Text>
        </View>

        <ScrollView style={styles.matchesList}>
          {matches.map((match, index) => (
            <View key={index} style={styles.matchCard}>
              <Image
                source={{ uri: match.imageUrl }}
                style={styles.matchImage}
              />
              <View style={styles.matchInfo}>
                <Text style={styles.matchTitle}>{match.title}</Text>
                <Text style={styles.matchDetails}>{match.type}</Text>
                <Text style={styles.matchTime}>{match.time}</Text>
                <Text style={styles.matchLocation}>{match.location}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {matches.length === 0 && (
          <TouchableOpacity
            style={styles.createMatchButton}
            onPress={() => setIsCreateModalVisible(true)}
          >
            <Text style={styles.createMatchButtonText}>Create Match</Text>
          </TouchableOpacity>
        )}
      </View>

      {renderCreateMatchModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    marginTop: 35,
  },
  backButton: {
    padding: 8,
    width: 40,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: '600',
    color: '#007BFF',
    flex: 1,
    textAlign: 'center',
  },
  placeholderView: {
    width: 40,
  },
  scheduleContainer: {
    flex: 1,
    padding: 16,
    paddingBottom: 70,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scheduleTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  selectedDate: {
    fontSize: 16,
    color: '#666',
  },
  matchCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  matchImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  matchInfo: {
    flex: 1,
  },
  matchTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  matchDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  matchTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  matchLocation: {
    fontSize: 14,
    color: '#666',
  },
  createMatchButton: {
    backgroundColor: '#007BFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    marginBottom: 140,
  },
  createMatchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    color: '#007BFF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  paymentTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  paymentOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectedPayment: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
  },
  paymentText: {
    color: '#000',
  },
  selectedPaymentText: {
    color: '#fff',
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  map: {
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#FF4A4A',
    marginRight: 8,
    alignItems: 'center',
  },
  createButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#007BFF',
    marginLeft: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ScheduleScreen;
