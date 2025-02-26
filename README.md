# Room MCP

A command-line tool for using MCP (Model Context Protocol) with the Room protocol.

## Installation

You can use this tool directly with npx:

```bash
npx -y @agree-able/room-mcp
```

## Adding to Claude Desktop

To add this tool to Claude Desktop:

1. Open Claude Desktop
2. Go to Settings > Tools
3. Click "Add Tool"
4. Enter the following information:
   - **Name**: Room MCP
   - **Command**: `npx -y @agree-able/room-mcp`
   - **Description**: Use MCP and the Room protocol
5. Click "Save"

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
