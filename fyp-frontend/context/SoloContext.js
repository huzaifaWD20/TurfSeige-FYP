//"use client"

//import { createContext, useState, useContext } from "react"

//// Create the context
//const SoloContext = createContext()

//// Create a provider component
//export const SoloProvider = ({ children }) => {
//  // Solo player profile
//  const [soloProfile, setSoloProfile] = useState({
//    id: "2", // user@example.com
//    name: "John Player",
//    avatar: "https://via.placeholder.com/100",
//    position: "Defender",
//    skillLevel: "Intermediate",
//    rating: 78,
//    stats: {
//      PAC: 75,
//      SHO: 65,
//      PAS: 80,
//      DRI: 70,
//      DEF: 85,
//      PHY: 78,
//    },
//  })

//  // Available match openings
//  const [matchOpenings, setMatchOpenings] = useState([
//    {
//      id: "1",
//      teamId: "1",
//      teamName: "FC Barcelona",
//      teamLogo: "https://via.placeholder.com/100",
//      matchId: "101",
//      opponent: "Real Madrid",
//      date: new Date(2023, 11, 15, 18, 0),
//      location: "Central Stadium",
//      format: "5v5",
//      openPositions: [
//        { id: "pos1", role: "Defender", required: true },
//        { id: "pos2", role: "Attacker", required: false },
//      ],
//      captain: {
//        id: "1",
//        name: "John Doe",
//        avatar: "https://via.placeholder.com/100",
//      },
//    },
//    {
//      id: "2",
//      teamId: "2",
//      teamName: "Real Madrid",
//      teamLogo: "https://via.placeholder.com/100",
//      matchId: "102",
//      opponent: "Manchester United",
//      date: new Date(2023, 11, 18, 19, 30),
//      location: "Olympic Stadium",
//      format: "7v7",
//      openPositions: [
//        { id: "pos3", role: "Goalkeeper", required: true },
//        { id: "pos4", role: "Defender", required: true },
//        { id: "pos5", role: "Attacker", required: false },
//      ],
//      captain: {
//        id: "4",
//        name: "Alex Wilson",
//        avatar: "https://via.placeholder.com/100",
//      },
//    },
//  ])

//  // Solo player's outgoing requests to join matches
//  const [outgoingRequests, setOutgoingRequests] = useState([
//    {
//      id: "solo-req-1",
//      openingId: "2",
//      teamId: "2",
//      teamName: "Real Madrid",
//      teamLogo: "https://via.placeholder.com/100",
//      matchId: "102",
//      opponent: "Manchester United",
//      date: new Date(2023, 11, 18, 19, 30),
//      location: "Olympic Stadium",
//      positionId: "pos4",
//      role: "Defender",
//      status: "pending",
//    },
//  ])

//  // Team match invites for team members
//  const [teamInvites, setTeamInvites] = useState([
//    {
//      id: "team-inv-1",
//      teamId: "1",
//      teamName: "FC Barcelona",
//      teamLogo: "https://via.placeholder.com/100",
//      matchId: "101",
//      opponent: "Real Madrid",
//      date: new Date(2023, 11, 15, 18, 0),
//      location: "Central Stadium",
//      format: "5v5",
//      status: "pending",
//      captain: {
//        id: "1",
//        name: "John Doe",
//        avatar: "https://via.placeholder.com/100",
//      },
//    },
//  ])

//  // Solo player requests received by team captain
//  const [incomingSoloRequests, setIncomingSoloRequests] = useState([
//    {
//      id: "solo-req-2",
//      playerId: "5",
//      playerName: "Sarah Williams",
//      playerAvatar: "https://via.placeholder.com/100",
//      playerPosition: "Attacker",
//      playerRating: 82,
//      openingId: "1",
//      teamId: "1",
//      matchId: "101",
//      opponent: "Real Madrid",
//      date: new Date(2023, 11, 15, 18, 0),
//      positionId: "pos2",
//      role: "Attacker",
//      status: "pending",
//    },
//  ])

//  // Function to send a request to join a match
//  const sendJoinRequest = (openingId, positionId, role) => {
//    const opening = matchOpenings.find((o) => o.id === openingId)
//    if (!opening) return null

//    const newRequest = {
//      id: `solo-req-${Date.now()}`,
//      openingId,
//      teamId: opening.teamId,
//      teamName: opening.teamName,
//      teamLogo: opening.teamLogo,
//      matchId: opening.matchId,
//      opponent: opening.opponent,
//      date: opening.date,
//      location: opening.location,
//      positionId,
//      role,
//      status: "pending",
//    }

//    setOutgoingRequests([...outgoingRequests, newRequest])

//    // Also add to the team's incoming requests (for demo purposes)
//    const newIncomingRequest = {
//      id: newRequest.id,
//      playerId: soloProfile.id,
//      playerName: soloProfile.name,
//      playerAvatar: soloProfile.avatar,
//      playerPosition: soloProfile.position,
//      playerRating: soloProfile.rating,
//      openingId,
//      teamId: opening.teamId,
//      matchId: opening.matchId,
//      opponent: opening.opponent,
//      date: opening.date,
//      positionId,
//      role,
//      status: "pending",
//    }

//    setIncomingSoloRequests([...incomingSoloRequests, newIncomingRequest])

//    return newRequest
//  }

//  // Function to cancel a join request
//  const cancelJoinRequest = (requestId) => {
//    setOutgoingRequests(outgoingRequests.filter((req) => req.id !== requestId))
//    setIncomingSoloRequests(incomingSoloRequests.filter((req) => req.id !== requestId))
//  }

//  // Function for team captain to respond to a solo player request
//  const respondToSoloRequest = (requestId, response) => {
//    const updatedRequests = incomingSoloRequests.map((req) =>
//      req.id === requestId ? { ...req, status: response } : req,
//    )
//    setIncomingSoloRequests(updatedRequests)

//    // Update the outgoing request status for the solo player
//    const updatedOutgoing = outgoingRequests.map((req) => (req.id === requestId ? { ...req, status: response } : req))
//    setOutgoingRequests(updatedOutgoing)

//    // If accepted, remove the position from openings
//    if (response === "accepted") {
//      const request = incomingSoloRequests.find((req) => req.id === requestId)
//      if (request) {
//        const updatedOpenings = matchOpenings.map((opening) => {
//          if (opening.id === request.openingId) {
//            return {
//              ...opening,
//              openPositions: opening.openPositions.filter((pos) => pos.id !== request.positionId),
//            }
//          }
//          return opening
//        })
//        setMatchOpenings(updatedOpenings)
//      }
//    }
//  }

//  // Function for team member to respond to a match invite
//  const respondToTeamInvite = (inviteId, response) => {
//    const updatedInvites = teamInvites.map((inv) => (inv.id === inviteId ? { ...inv, status: response } : inv))
//    setTeamInvites(updatedInvites)

//    // If declined, create an opening for the position
//    if (response === "declined") {
//      const invite = teamInvites.find((inv) => inv.id === inviteId)
//      if (invite) {
//        // Find if there's already an opening for this match
//        const existingOpening = matchOpenings.find((opening) => opening.matchId === invite.matchId)

//        if (existingOpening) {
//          // Add position to existing opening
//          const updatedOpenings = matchOpenings.map((opening) => {
//            if (opening.matchId === invite.matchId) {
//              return {
//                ...opening,
//                openPositions: [
//                  ...opening.openPositions,
//                  {
//                    id: `pos-${Date.now()}`,
//                    role: soloProfile.position, // Using the declining player's position
//                    required: true,
//                  },
//                ],
//              }
//            }
//            return opening
//          })
//          setMatchOpenings(updatedOpenings)
//        } else {
//          // Create new opening
//          const newOpening = {
//            id: `opening-${Date.now()}`,
//            teamId: invite.teamId,
//            teamName: invite.teamName,
//            teamLogo: invite.teamLogo,
//            matchId: invite.matchId,
//            opponent: invite.opponent,
//            date: invite.date,
//            location: invite.location,
//            format: invite.format,
//            openPositions: [
//              {
//                id: `pos-${Date.now()}`,
//                role: soloProfile.position,
//                required: true,
//              },
//            ],
//            captain: invite.captain,
//          }
//          setMatchOpenings([...matchOpenings, newOpening])
//        }
//      }
//    }
//  }

//  // Function for team captain to create match openings
//  const createMatchOpening = (matchData, positions) => {
//    const newOpening = {
//      id: `opening-${Date.now()}`,
//      ...matchData,
//      openPositions: positions,
//    }
//    setMatchOpenings([...matchOpenings, newOpening])
//    return newOpening
//  }

//  // Function to get filtered match openings based on player position
//  const getFilteredOpenings = (position = null) => {
//    if (!position) return matchOpenings

//    return matchOpenings
//      .map((opening) => {
//        // Check if there are positions matching the player's position
//        const matchingPositions = opening.openPositions.filter((pos) => pos.role === position)
//        if (matchingPositions.length > 0) {
//          return {
//            ...opening,
//            openPositions: matchingPositions,
//            relevanceScore: matchingPositions.some((pos) => pos.required) ? 2 : 1,
//          }
//        }
//        return null
//      })
//      .filter(Boolean)
//      .sort((a, b) => b.relevanceScore - a.relevanceScore)
//  }

//  return (
//    <SoloContext.Provider
//      value={{
//        soloProfile,
//        matchOpenings,
//        outgoingRequests,
//        teamInvites,
//        incomingSoloRequests,
//        sendJoinRequest,
//        cancelJoinRequest,
//        respondToSoloRequest,
//        respondToTeamInvite,
//        createMatchOpening,
//        getFilteredOpenings,
//      }}
//    >
//      {children}
//    </SoloContext.Provider>
//  )
//}

//// Custom hook to use the solo context
//export const useSolo = () => {
//  const context = useContext(SoloContext)
//  if (!context) {
//    throw new Error("useSolo must be used within a SoloProvider")
//  }
//  return context
//}
