# Aleph-10: Vector Memory MCP Server

Aleph-10 is a Model Context Protocol (MCP) server that combines weather data services with vector-based memory storage. This project provides tools for retrieving weather information and managing semantic memory through vector embeddings.

## Features

- **Weather Information**: Get weather alerts and forecasts using the National Weather Service API
- **Vector Memory**: Store and retrieve information using semantic search
- **Multiple Embedding Options**: Support for both cloud-based (Google Gemini) and local (Ollama) embedding providers
- **Metadata Support**: Add and filter by metadata for efficient memory management

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- pnpm package manager

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/aleph-10.git
cd aleph-10
```

2. Install dependencies
```bash
pnpm install
```

3. Configure environment variables (create a `.env` file in the project root)
```
EMBEDDING_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key
VECTOR_DB_PATH=./data/vector_db
LOG_LEVEL=info
```

4. Build the project
```bash
pnpm build
```

5. Run the server
```bash
node build/index.js
```

## Usage

The server implements the Model Context Protocol and provides the following tools:

### Weather Tools

- **get-alerts**: Get weather alerts for a specific US state
  - Parameters: `state` (two-letter state code)

- **get-forecast**: Get weather forecast for a location
  - Parameters: `latitude` and `longitude`

### Memory Tools

- **memory-store**: Store information in the vector database
  - Parameters: `text` (content to store), `metadata` (optional associated data)

- **memory-retrieve**: Find semantically similar information
  - Parameters: `query` (search text), `limit` (max results), `filters` (metadata filters)

- **memory-update**: Update existing memory entries
  - Parameters: `id` (memory ID), `text` (new content), `metadata` (updated metadata)

- **memory-delete**: Remove entries from the database
  - Parameters: `id` (memory ID to delete)

- **memory-stats**: Get statistics about the memory store
  - Parameters: none

## Configuration

The following environment variables can be configured:

| Variable | Description | Default |
|----------|-------------|---------|
| `EMBEDDING_PROVIDER` | Provider for vector embeddings (`gemini` or `ollama`) | `gemini` |
| `GEMINI_API_KEY` | API key for Google Gemini | - |
| `OLLAMA_BASE_URL` | Base URL for Ollama API | `http://localhost:11434` |
| `VECTOR_DB_PATH` | Storage location for vector database | `./data/vector_db` |
| `LOG_LEVEL` | Logging verbosity | `info` |

## Development

### Project Structure

The project follows a modular structure:

```
aleph-10/
├── src/                         # Source code
│   ├── index.ts                 # Main application entry point
│   ├── weather/                 # Weather service module
│   ├── memory/                  # Memory management module
│   ├── utils/                   # Shared utilities
│   └── types/                   # TypeScript type definitions
└── tests/                       # Test files
```

### Running Tests

```bash
pnpm test
```

### Building

```bash
pnpm build
```

## License

This project is licensed under the ISC License.

## Acknowledgments

- [Model Context Protocol](https://github.com/anthropics/model-context-protocol)
- [National Weather Service API](https://www.weather.gov/documentation/services-web-api)
