//"use client"

//import { createContext, useState, useContext } from "react"

//// Create the context
//const TeamContext = createContext()

//// Create a provider component
//export const TeamProvider = ({ children }) => {
//  // Current logged in user
//  const [currentUser, setCurrentUser] = useState({
//    id: "1", // admin@example.com
//    name: "John Doe",
//    avatar: "https://via.placeholder.com/100",
//    playerID: "PLAYER001",
//    isLoggedIn: true,
//  })

//  // Teams state
//  const [teams, setTeams] = useState([
//    {
//      id: "1",
//      name: "FC Barcelona",
//      description: "More than a club",
//      logo: "https://via.placeholder.com/100",
//      members: [
//        {
//          id: "1",
//          name: "John Doe",
//          avatar: "https://via.placeholder.com/100",
//          role: "Captain",
//          playerID: "PLAYER001",
//        },
//      ],
//      isPublic: true,
//      requireApproval: true,
//      createdAt: new Date(),
//      stats: {
//        played: 0,
//        won: 0,
//        lost: 0,
//        draw: 0,
//      },
//      matchHistory: [],
//    },
//    {
//      id: "2",
//      name: "Real Madrid",
//      description: "Champions of Europe",
//      logo: "https://via.placeholder.com/100",
//      members: [
//        {
//          id: "4",
//          name: "Alex Wilson",
//          avatar: "https://via.placeholder.com/100",
//          role: "Captain",
//          playerID: "PLAYER004",
//        },
//        {
//          id: "5",
//          name: "Sarah Williams",
//          avatar: "https://via.placeholder.com/100",
//          role: "Member",
//          playerID: "PLAYER005",
//        },
//      ],
//      isPublic: true,
//      requireApproval: false,
//      createdAt: new Date(),
//      stats: {
//        played: 5,
//        won: 3,
//        lost: 1,
//        draw: 1,
//      },
//      matchHistory: [
//        {
//          id: "match1",
//          opponent: "Manchester United",
//          date: new Date(2023, 10, 15),
//          result: "win",
//          score: "3-1",
//          location: "Santiago Bernabeu",
//        },
//        {
//          id: "match2",
//          opponent: "Liverpool",
//          date: new Date(2023, 10, 22),
//          result: "loss",
//          score: "1-2",
//          location: "Anfield",
//        },
//        {
//          id: "match3",
//          opponent: "Bayern Munich",
//          date: new Date(2023, 11, 5),
//          result: "draw",
//          score: "2-2",
//          location: "Allianz Arena",
//        },
//        {
//          id: "match4",
//          opponent: "PSG",
//          date: new Date(2023, 11, 12),
//          result: "win",
//          score: "2-0",
//          location: "Santiago Bernabeu",
//        },
//        {
//          id: "match5",
//          opponent: "Juventus",
//          date: new Date(2023, 11, 19),
//          result: "win",
//          score: "3-0",
//          location: "Santiago Bernabeu",
//        },
//      ],
//    },
//  ])

//  // User's teams
//  const [userTeams, setUserTeams] = useState(["1"])

//  // Team invitations
//  const [teamInvitations, setTeamInvitations] = useState([
//    {
//      id: "inv1",
//      teamId: "2",
//      teamName: "Real Madrid",
//      teamLogo: "https://via.placeholder.com/100",
//      playerID: "PLAYER002",
//      status: "pending",
//      sentAt: new Date(),
//    },
//  ])

//  // Open matches posted by captains
//  const [openMatches, setOpenMatches] = useState([
//    {
//      id: "open1",
//      teamId: "2",
//      teamName: "Real Madrid",
//      teamLogo: "https://via.placeholder.com/100",
//      date: new Date(2023, 11, 30, 18, 0),
//      location: "Santiago Bernabeu",
//      format: "5v5",
//      paymentCondition: "lose_to_pay",
//      requiredPlayers: 5,
//      confirmedPlayers: 3,
//      status: "open",
//      captain: {
//        id: "4",
//        name: "Alex Wilson",
//        avatar: "https://via.placeholder.com/100",
//      },
//    },
//  ])

//  // Match requests between teams
//  const [incomingRequests, setIncomingRequests] = useState([
//    {
//      id: "1",
//      requestingTeamId: "2",
//      requestingTeamName: "Real Madrid",
//      requestingTeamLogo: "https://via.placeholder.com/100",
//      targetTeamId: "1",
//      date: new Date(2023, 11, 15, 18, 0),
//      location: "Central Stadium",
//      message: "Let's have a friendly match!",
//      status: "pending",
//      format: "5v5",
//      paymentCondition: "50_50",
//    },
//  ])

//  const [outgoingRequests, setOutgoingRequests] = useState([
//    {
//      id: "2",
//      requestingTeamId: "1",
//      targetTeamId: "2",
//      targetTeamName: "Real Madrid",
//      targetTeamLogo: "https://via.placeholder.com/100",
//      date: new Date(2023, 11, 20, 19, 0),
//      location: "Olympic Stadium",
//      message: "Ready for a challenge?",
//      status: "pending",
//      format: "5v5",
//      paymentCondition: "lose_to_pay",
//    },
//  ])

//  // Match invitations for players
//  const [matchInvitations, setMatchInvitations] = useState([
//    {
//      id: "minv1",
//      matchId: "match101",
//      teamId: "1",
//      teamName: "FC Barcelona",
//      opponent: "Real Madrid",
//      date: new Date(2023, 11, 25, 19, 0),
//      location: "Camp Nou",
//      playerID: "PLAYER001",
//      status: "pending",
//    },
//  ])

//  // Scheduled matches
//  const [scheduledMatches, setScheduledMatches] = useState([
//    {
//      id: "match101",
//      teamId: "1",
//      teamName: "FC Barcelona",
//      teamLogo: "https://via.placeholder.com/100",
//      opponentId: "2",
//      opponentName: "Real Madrid",
//      opponentLogo: "https://via.placeholder.com/100",
//      date: new Date(2023, 11, 25, 19, 0),
//      location: "Camp Nou",
//      format: "5v5",
//      paymentCondition: "50_50",
//      status: "scheduled",
//      confirmedPlayers: [{ id: "1", name: "John Doe", avatar: "https://via.placeholder.com/100", role: "Captain" }],
//      requiredPlayers: 5,
//    },
//  ])

//  // Function to create a new team
//  const createTeam = (teamData) => {
//    const newTeam = {
//      id: Date.now().toString(),
//      ...teamData,
//      members: [
//        {
//          id: currentUser.id,
//          name: currentUser.name,
//          avatar: currentUser.avatar,
//          role: "Captain",
//          playerID: currentUser.playerID,
//        },
//      ],
//      createdAt: new Date(),
//      stats: {
//        played: 0,
//        won: 0,
//        lost: 0,
//        draw: 0,
//      },
//      matchHistory: [],
//    }

//    setTeams([...teams, newTeam])
//    setUserTeams([...userTeams, newTeam.id])

//    return newTeam
//  }

//  // Function to update team details
//  const updateTeam = (teamId, teamData) => {
//    const updatedTeams = teams.map((team) => (team.id === teamId ? { ...team, ...teamData } : team))
//    setTeams(updatedTeams)
//  }

//  // Function to invite a player to a team
//  const invitePlayerToTeam = (teamId, playerID) => {
//    const team = teams.find((t) => t.id === teamId)
//    if (!team) return null

//    const newInvitation = {
//      id: `inv-${Date.now()}`,
//      teamId,
//      teamName: team.name,
//      teamLogo: team.logo,
//      playerID,
//      status: "pending",
//      sentAt: new Date(),
//    }

//    setTeamInvitations([...teamInvitations, newInvitation])
//    return newInvitation
//  }

//  // Function to respond to a team invitation
//  const respondToTeamInvitation = (invitationId, response) => {
//    const invitation = teamInvitations.find((inv) => inv.id === invitationId)
//    if (!invitation) return false

//    if (response === "accepted") {
//      // Add player to team
//      const updatedTeams = teams.map((team) => {
//        if (team.id === invitation.teamId) {
//          return {
//            ...team,
//            members: [
//              ...team.members,
//              {
//                id: currentUser.id,
//                name: currentUser.name,
//                avatar: currentUser.avatar,
//                role: "Member",
//                playerID: currentUser.playerID,
//              },
//            ],
//          }
//        }
//        return team
//      })
//      setTeams(updatedTeams)

//      // Add team to user's teams
//      if (!userTeams.includes(invitation.teamId)) {
//        setUserTeams([...userTeams, invitation.teamId])
//      }
//    }

//    // Update invitation status
//    const updatedInvitations = teamInvitations.map((inv) =>
//      inv.id === invitationId ? { ...inv, status: response } : inv,
//    )
//    setTeamInvitations(updatedInvitations)

//    return true
//  }

//  // Function to post an open match
//  const postOpenMatch = (matchData) => {
//    const newMatch = {
//      id: `open-${Date.now()}`,
//      ...matchData,
//      status: "open",
//    }

//    setOpenMatches([...openMatches, newMatch])
//    return newMatch
//  }

//  // Function to add a member to a team
//  const addTeamMember = (teamId, member) => {
//    const updatedTeams = teams.map((team) => {
//      if (team.id === teamId) {
//        return {
//          ...team,
//          members: [...team.members, member],
//        }
//      }
//      return team
//    })
//    setTeams(updatedTeams)
//  }

//  // Function to remove a member from a team
//  const removeTeamMember = (teamId, memberId) => {
//    const updatedTeams = teams.map((team) => {
//      if (team.id === teamId) {
//        return {
//          ...team,
//          members: team.members.filter((member) => member.id !== memberId),
//        }
//      }
//      return team
//    })
//    setTeams(updatedTeams)
//  }

//  // Function to disband a team
//  const disbandTeam = (teamId) => {
//    const updatedTeams = teams.filter((team) => team.id !== teamId)
//    setTeams(updatedTeams)
//    setUserTeams(userTeams.filter((id) => id !== teamId))
//  }

//  // Function to create a match request
//  const createMatchRequest = (requestData) => {
//    const newRequest = {
//      id: Date.now().toString(),
//      ...requestData,
//      status: "pending",
//    }

//    setOutgoingRequests([...outgoingRequests, newRequest])

//    return newRequest
//  }

//  // Function to handle match request response
//  const respondToMatchRequest = (requestId, response) => {
//    const updatedRequests = incomingRequests.map((request) =>
//      request.id === requestId ? { ...request, status: response } : request,
//    )
//    setIncomingRequests(updatedRequests)

//    if (response === "accepted") {
//      const request = incomingRequests.find((req) => req.id === requestId)
//      if (request) {
//        // Create a scheduled match
//        const newMatch = {
//          id: `match-${Date.now()}`,
//          teamId: request.targetTeamId,
//          teamName: getTeamById(request.targetTeamId)?.name || "",
//          teamLogo: getTeamById(request.targetTeamId)?.logo || "",
//          opponentId: request.requestingTeamId,
//          opponentName: request.requestingTeamName,
//          opponentLogo: request.requestingTeamLogo,
//          date: request.date,
//          location: request.location,
//          format: request.format || "5v5",
//          paymentCondition: request.paymentCondition || "50_50",
//          status: "scheduled",
//          confirmedPlayers: getTeamById(request.targetTeamId)?.members || [],
//          requiredPlayers: Number.parseInt(request.format?.split("v")[0] || 5),
//        }

//        setScheduledMatches([...scheduledMatches, newMatch])

//        // Create match invitations for all team members
//        const team = getTeamById(request.targetTeamId)
//        if (team) {
//          const newInvitations = team.members.map((member) => ({
//            id: `minv-${Date.now()}-${member.id}`,
//            matchId: newMatch.id,
//            teamId: team.id,
//            teamName: team.name,
//            opponent: request.requestingTeamName,
//            date: request.date,
//            location: request.location,
//            playerID: member.playerID,
//            status: "pending",
//          }))

//          setMatchInvitations([...matchInvitations, ...newInvitations])
//        }
//      }
//    }
//  }

//  // Function to respond to a match invitation
//  const respondToMatchInvitation = (invitationId, response) => {
//    const invitation = matchInvitations.find((inv) => inv.id === invitationId)
//    if (!invitation) return false

//    // Update invitation status
//    const updatedInvitations = matchInvitations.map((inv) =>
//      inv.id === invitationId ? { ...inv, status: response } : inv,
//    )
//    setMatchInvitations(updatedInvitations)

//    if (response === "accepted") {
//      // Update confirmed players in scheduled match
//      const updatedMatches = scheduledMatches.map((match) => {
//        if (match.id === invitation.matchId) {
//          // Check if player is already in confirmed players
//          const playerExists = match.confirmedPlayers.some((p) => p.playerID === currentUser.playerID)

//          if (!playerExists) {
//            return {
//              ...match,
//              confirmedPlayers: [
//                ...match.confirmedPlayers,
//                {
//                  id: currentUser.id,
//                  name: currentUser.name,
//                  avatar: currentUser.avatar,
//                  role: "Member",
//                  playerID: currentUser.playerID,
//                },
//              ],
//            }
//          }
//        }
//        return match
//      })
//      setScheduledMatches(updatedMatches)
//    }

//    return true
//  }

//  // Function to cancel an outgoing match request
//  const cancelMatchRequest = (requestId) => {
//    const updatedRequests = outgoingRequests.filter((request) => request.id !== requestId)
//    setOutgoingRequests(updatedRequests)
//  }

//  // Get a team by ID
//  const getTeamById = (teamId) => {
//    return teams.find((team) => team.id === teamId)
//  }

//  // Get user's teams
//  const getUserTeams = () => {
//    return teams.filter((team) => userTeams.includes(team.id))
//  }

//  // Check if user is team admin
//  const isTeamAdmin = (teamId) => {
//    const team = teams.find((team) => team.id === teamId)
//    if (!team) return false

//    // Find the captain (first member with role "Captain")
//    const captain = team.members.find((member) => member.role === "Captain")
//    return captain && captain.id === currentUser.id
//  }

//  // Check if user is in a team
//  const isUserInTeam = (teamId) => {
//    return userTeams.includes(teamId)
//  }

//  // Get user's pending team invitations
//  const getUserTeamInvitations = () => {
//    return teamInvitations.filter((inv) => inv.playerID === currentUser.playerID && inv.status === "pending")
//  }

//  // Get user's pending match invitations
//  const getUserMatchInvitations = () => {
//    return matchInvitations.filter((inv) => inv.playerID === currentUser.playerID && inv.status === "pending")
//  }

//  // Set current user (for login/logout)
//  const setUser = (user) => {
//    setCurrentUser({
//      ...user,
//      isLoggedIn: true,
//    })

//    // Update userTeams based on the new user
//    const userTeamIds = teams
//      .filter((team) => team.members.some((member) => member.playerID === user.playerID))
//      .map((team) => team.id)

//    setUserTeams(userTeamIds)
//  }

//  // Logout current user
//  const logoutUser = () => {
//    setCurrentUser({
//      id: "",
//      name: "",
//      avatar: "",
//      playerID: "",
//      isLoggedIn: false,
//    })
//    setUserTeams([])
//  }

//  return (
//    <TeamContext.Provider
//      value={{
//        currentUser,
//        teams,
//        userTeams,
//        incomingRequests,
//        outgoingRequests,
//        teamInvitations,
//        matchInvitations,
//        openMatches,
//        scheduledMatches,
//        createTeam,
//        updateTeam,
//        addTeamMember,
//        removeTeamMember,
//        disbandTeam,
//        createMatchRequest,
//        respondToMatchRequest,
//        cancelMatchRequest,
//        getTeamById,
//        getUserTeams,
//        isTeamAdmin,
//        isUserInTeam,
//        invitePlayerToTeam,
//        respondToTeamInvitation,
//        getUserTeamInvitations,
//        postOpenMatch,
//        respondToMatchInvitation,
//        getUserMatchInvitations,
//        setUser,
//        logoutUser,
//      }}
//    >
//      {children}
//    </TeamContext.Provider>
//  )
//}

//// Custom hook to use the team context
//export const useTeam = () => {
//  const context = useContext(TeamContext)
//  if (!context) {
//    throw new Error("useTeam must be used within a TeamProvider")
//  }
//  return context
//}
