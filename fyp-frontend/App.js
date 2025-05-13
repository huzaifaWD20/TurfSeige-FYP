import { NavigationContainer } from "@react-navigation/native"
import { StyleSheet, View, Image } from "react-native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"

// Import Context Providers
//import { TeamProvider } from "./context/TeamContext"
//import { SoloProvider } from "./context/SoloContext"

// Import Screens
import Onboarding1 from "./screens/onboarding/Onboarding1"
import Onboarding2 from "./screens/onboarding/Onboarding2"
import Onboarding3 from "./screens/onboarding/Onboarding3"
import Onboarding4 from "./screens/onboarding/Onboarding4"
import Login from "./screens/auth/Login"
import SignUp from "./screens/auth/SignUp"
import HomeScreen from "./screens/main/HomeScreen"
import ProfileScreen from "./screens/main/ProfileScreen"
import ScheduleScreen from "./screens/main/ScheduleScreen"
import TeamOrSoloScreen from "./screens/main/TeamOrSoloScreen"
import NotificationsScreen from "./screens/main/NotificationsScreen"

// Import Team Management Screens
import TeamScreen from "./screens/team/TeamScreen"
import TeamDetailsScreen from "./screens/team/TeamDetailsScreen"
import CreateTeamScreen from "./screens/team/CreateTeamScreen"
import EditTeamScreen from "./screens/team/EditTeamScreen"
import TeamMembersScreen from "./screens/team/TeamMembersScreen"
import InvitePlayersScreen from "./screens/team/InvitePlayersScreen"
import TeamSettingsScreen from "./screens/team/TeamSettingsScreen"
import DisbandTeamScreen from "./screens/team/DisbandTeamScreen"
import BrowseTeamsScreen from "./screens/team/BrowseTeamsScreen"
import RequestMatchScreen from "./screens/team/RequestMatchScreen"
import MatchRequestsScreen from "./screens/team/MatchRequestsScreen"
import PostMatchScreen from "./screens/team/PostMatchScreen"
import BrowseOpenMatchesScreen from "./screens/team/BrowseOpenMatchesScreen"

// Import Solo Player Screens
import SoloScreen from "./screens/solo/SoloScreen"
import BrowseSoloScreen from "./screens/solo/BrowseSoloScreen"
import SoloMatchRequestsScreen from "./screens/solo/SoloMatchRequestsScreen"
import TeamMatchInvitesScreen from "./screens/solo/TeamMatchInvitesScreen"

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

// Bottom Tab Navigator
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          position: "absolute",
          paddingBottom: 10,
          bottom: 20,
          left: 20,
          right: 20,
          height: 80,
          backgroundColor: "white",
          borderRadius: 30,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 10,
          },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          elevation: 8,
        },
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: "500",
          marginTop: -20,
        },
        tabBarIconStyle: {
          marginTop: -10,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconElement

          if (route.name === "Home") {
            iconElement = (
              <View style={styles.centerNavItem}>
                <View style={styles.soccerIconContainer}>
                  <Image source={require("./assets/soccer-ball-tsp.png")} style={styles.soccerIcon} />
                </View>
              </View>
            )
          } else if (route.name === "Profile") {
            iconElement = <Icon name="account" size={28} color={color} />
          } else if (route.name === "Schedule") {
            iconElement = <Icon name="calendar-month" size={28} color={color} />
          }

          return iconElement
        },
      })}
    >
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
          tabBarIconStyle: {
            marginTop: -60,
          },
        }}
      />
      <Tab.Screen name="Schedule" component={ScheduleScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  )
}

// Main Stack Navigator (for authenticated screens)
const MainStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="TeamOrSolo" component={TeamOrSoloScreen} />
      <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />

      {/* Team Management Screens */}
      <Stack.Screen name="TeamScreen" component={TeamScreen} />
      <Stack.Screen name="TeamDetailsScreen" component={TeamDetailsScreen} />
      <Stack.Screen name="CreateTeamScreen" component={CreateTeamScreen} />
      <Stack.Screen name="EditTeamScreen" component={EditTeamScreen} />
      <Stack.Screen name="TeamMembersScreen" component={TeamMembersScreen} />
      <Stack.Screen name="InvitePlayersScreen" component={InvitePlayersScreen} />
      <Stack.Screen name="TeamSettingsScreen" component={TeamSettingsScreen} />
      <Stack.Screen name="DisbandTeamScreen" component={DisbandTeamScreen} />
      <Stack.Screen name="BrowseTeamsScreen" component={BrowseTeamsScreen} />
      <Stack.Screen name="RequestMatchScreen" component={RequestMatchScreen} />
      <Stack.Screen name="MatchRequestsScreen" component={MatchRequestsScreen} />
      <Stack.Screen name="PostMatchScreen" component={PostMatchScreen} />
      <Stack.Screen name="BrowseOpenMatchesScreen" component={BrowseOpenMatchesScreen} />

      {/* Solo Player Screens */}
      <Stack.Screen name="SoloScreen" component={SoloScreen} />
      <Stack.Screen name="BrowseSoloScreen" component={BrowseSoloScreen} />
      <Stack.Screen name="SoloMatchRequestsScreen" component={SoloMatchRequestsScreen} />
      <Stack.Screen name="TeamMatchInvitesScreen" component={TeamMatchInvitesScreen} />
    </Stack.Navigator>
  )
}

// Root Navigator
const App = () => {
  return (

        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              headerShown: false,
              gestureEnabled: false,
              animation: "slide_from_right",
            }}
          >
            <Stack.Screen name="Main" component={MainStack} />
            <Stack.Group>
              <Stack.Screen name="Onboarding1" component={Onboarding1} />
              <Stack.Screen name="Onboarding2" component={Onboarding2} />
              <Stack.Screen name="Onboarding3" component={Onboarding3} />
              <Stack.Screen name="Onboarding4" component={Onboarding4} />
            </Stack.Group>
            <Stack.Group>
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="SignUp" component={SignUp} />
            </Stack.Group>
          </Stack.Navigator>
        </NavigationContainer>

  )
}

const styles = StyleSheet.create({
  centerNavItem: {
    justifyContent: "center",
    alignItems: "center",
  },
  soccerIconContainer: {
    width: 90,
    height: 90,
    backgroundColor: "#FFF",
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4F6EFF",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 3,
    borderColor: "#E6E6E6",
  },
  soccerIcon: {
    width: 60,
    height: 60,
  },
})

export default App
