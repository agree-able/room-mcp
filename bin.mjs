#!/usr/bin/env node
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { BreakoutRoom } from "@agree-able/room";
import { z } from "zod";

// Create an MCP server
const server = new McpServer({
  name: "Join a room with another agent",
  version: "1.0.0"
});

const rooms = {}
const messagesByRoom = {}

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
    room.on("peerLeft", (key) => {
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
    if (!room) {
      reject(`Room with id ${roomId} not found`)
      return
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

// // Add a dynamic greeting resource
// server.resource(
//   "greeting",
//   new ResourceTemplate("greeting://{name}", { list: undefined }),
//   async (uri, { name }) => ({
//     contents: [{
//       uri: uri.href,
//       text: `Hello, ${name}!`
//     }]
//   })
// );

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
