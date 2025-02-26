#!/usr/bin/env node
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { BreakoutRoom } from "@agree-able/room";
import { z } from "zod";
import fs from "fs";

// Create an MCP server
const server = new McpServer({
  name: "Join a room with another agent",
  version: "1.0.0"
});

const rooms = {}
const messagesByRoom = {}
const roomTranscripts = {}

if (process.env.transcriptsFolder) {
  // check if the folder exists, if not create it (with sycn)
  fs.mkdirSync(process.env.transcriptsFolder, { recursive: true })
}

server.tool(
  'join-with-invite',
  'join a room with an invite code',
  { invite: z.string() },
  ({ invite }) => new Promise(async (resolve, reject) => {
    const room = new BreakoutRoom({ invite })
    await room.ready()
    room.on("message", async (message) => {
      if (!message.data) return
      messagesByRoom[room.roomId].push(message)
      // if this is not the first message, just return
      if (messagesByRoom[room.roomId].length > 1) return
      // otherwise lets resolve the promise with the message
      let response = `Room created with id: ${roomInfo.roomId}. Host first message to us is: ${message.data}`
      resolve({
        content: [{ type: 'text', text: response }]
      })
    })
    room.on("peerLeft", () => {
      room.peerLeft = true
    });
    const roomInfo = room.getRoomInfo()
    rooms[roomInfo.roomId] = room
    messagesByRoom[roomInfo.roomId] = []
  })
);

server.tool(
  'send-message',
  'send a message to a room',
  { roomId: z.string(), message: z.string() },
  ({ roomId, message }) => new Promise(async (resolve, reject) => {
    const room = rooms[roomId]
    if (!room) {s
      reject(`Room with id ${roomId} not found`)
      return
    }
    if (roomTranscripts[roomId]) {
      return resolve({
        content: [{ 
          type: 'text', 
          text: `room ${roomId} is closed. A transcript is available at rooms://${roomId}/transcript.json`
        }]
      })
    }
    if (room.peerLeft) {
      return resolve({
        content: [{ 
          type: 'text', 
          text: `the other party left the room ${roomId}. The room should be exited.`
        }]
      })
    }
    
    // Set up a one-time message handler to capture the response
    const messageHandler = (responseMessage) => {
      if (!responseMessage.data) return
      
      // Remove this handler after receiving a message
      room.off("message", messageHandler)
      
      // Store the message in the room's message history
      messagesByRoom[roomId].push(responseMessage)
      
      // Resolve the promise with both the sent message and the response
      resolve({
        content: [{ 
          type: 'text', 
          text: `Message sent to room ${roomId}. Response received: ${responseMessage.data}` 
        }]
      })
    }
    
    // Register the message handler
    room.on("message", messageHandler)
    
    // Send the message
    await room.message(message)
    
    // Add our sent message to the history
    messagesByRoom[roomId].push({ data: message, sent: true })
  })
)

server.tool(
  'exit-room',
  'exit a room and clean up resources',
  { roomId: z.string() },
  async ({ roomId }) => {
    const room = rooms[roomId]
    if (!room) {
      return {
        content: [{ type: 'text', text: `Room with id ${roomId} not found` }]
      }
    }
    
    try {
      const transcript = await room.getTranscript()
      roomTranscripts[roomId] = transcript
      // Call exit on the room
      await room.exit()
      
      // Clean up resources
      delete rooms[roomId]
      delete messagesByRoom[roomId]

      // if there is a transcriptsFolder, save the transcript
      if (process.env.transcriptsFolder) {
        const transcriptPath = `${process.env.transcriptsFolder}/${roomId}.json`
        fs.writeFileSync(transcriptPath, JSON.stringify(transcript, null, 2))
      }
      
      return {
        content: [{ type: 'text', text: `Successfully exited room ${roomId} and cleaned up resources. A transcript is available at rooms://${roomId}/transcript.json` }]
      }
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error exiting room ${roomId}: ${error.message}` }]
      }
    }
  }
)

// Dynamic resource to retrieve the transcript of a finished chat
server.resource(
  "final-room-transcript",
  new ResourceTemplate("rooms://{roomId}/transcript.json", { list: undefined }),
  async (uri, { roomId }) => {
    if (!roomTranscripts[roomId]) {
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify({ error: `Transcript for room ${roomId} not found` }),
          type: "application/json"
        }]
      }
    }
    
    return {
      contents: [{
        uri: uri.href,
        text: JSON.stringify(roomTranscripts[roomId]),
        mimeType: "application/json"
      }]
    }
  }
);


// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
