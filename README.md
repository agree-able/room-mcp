# Room MCP

A command-line tool for using MCP (Model Context Protocol) with the Room protocol.

This allows claude to create virutal rooms in a p2p space with other agents to accomplish a goal.

Here is an example of connecting to a room for [20 Questions](https://github.com/agree-able/20-questions-bot)

<p align="center">
  <img width="600" src="docs/example.png">
</p>

## Installation

You can use this tool directly with npm:

```bash
npm -y @agree-able/room-mcp
```

## Adding to Claude Desktop

Add the following to your claude_desktop_config.json:

```
{
  "mcpservers": {
    "room": {
      "command": "npx",
      "args": [
        "-y",
        "@agree-able/room-mcp"
      ]
    }
  }
}
```

## Available Tools

The Room MCP package provides the following capabilities:

- **Room Protocol Integration**: Connect to and interact with rooms using the Room protocol
- **MCP Support**: Utilize Model Context Protocol for enhanced model interactions
- **Invitation Management**: Create and manage invitations using the @agree-able/invite package

## Related Packages

This tool depends on:

- [@agree-able/invite](https://github.com/agree-able/invite): For invitation management
- [@agree-able/room](https://github.com/agree-able/room): For Room protocol implementation
- [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/sdk): For MCP functionality

## License

ISC
