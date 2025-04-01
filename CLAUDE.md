# Aleph-10: Model Context Protocol Weather Server

## Project Overview

Aleph-10 is a Model Context Protocol (MCP) server implementation that provides weather-related data tools. It leverages the National Weather Service (NWS) API to offer functionalities such as retrieving weather alerts for specific states and obtaining weather forecasts for given geographical coordinates.

## Technology Stack

- **TypeScript**: The project is written in TypeScript, providing type safety and modern JavaScript features.
- **Model Context Protocol SDK**: Utilizes the `@modelcontextprotocol/sdk` package for MCP server implementation.
- **Zod**: Used for runtime type validation and schema definition.
- **Node.js**: The runtime environment for the application.

## Core Functionality

The server currently implements two main tools:

1. **get-alerts**: Retrieves weather alerts for a specified US state using a two-letter state code.
2. **get-forecast**: Fetches weather forecast data for a specific location based on latitude and longitude coordinates.

## Project Structure

```
aleph-10/
├── build/              # Compiled JavaScript output
├── node_modules/       # Dependencies
├── src/                # Source code
│   └── index.ts        # Main application file
├── package.json        # Project metadata and dependencies
├── pnpm-lock.yaml      # Lock file for dependencies
└── tsconfig.json       # TypeScript configuration
```

## Implementation Details

- The server uses the StdioServerTransport for communication, which means it reads from stdin and writes to stdout.
- API requests to the National Weather Service include proper headers and error handling.
- The server formats the retrieved data into human-readable text responses.
- Type definitions are provided for the various API responses to ensure type safety.

## Development Workflow

To build the project:
```bash
pnpm build
```

This compiles the TypeScript code and makes the output executable.

## Future Enhancements

Potential areas for expansion:
- Additional weather data endpoints (historical data, radar imagery)
- Support for international weather data sources
- More detailed forecast information
- Visualization capabilities for weather data
- Caching mechanism for frequently requested data
- Automated testing for the API integration

## Notes

- The NWS API only supports US locations for forecasts
- There may be rate limiting considerations for the NWS API
- Error handling is implemented but could be enhanced for more specific error scenarios
