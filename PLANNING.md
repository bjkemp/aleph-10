# Aleph-10: Vector Memory MCP Server

## Project Vision

Expand the existing MCP weather server to include vector-based memory storage capabilities, allowing for efficient storage and retrieval of information through semantic search. This enhancement will transform the server into a more versatile tool that can maintain context across interactions while continuing to provide weather-related functionalities.

## Architecture Overview

The expanded architecture will consist of the following components:

1. **Core MCP Server**: The existing foundation that implements the Model Context Protocol.
2. **Weather Tools**: The current weather alert and forecast functionality.
3. **Vector Database**: A new component for storing and retrieving vector embeddings.
4. **Embedding Service**: A service for converting text to vector embeddings using free APIs.
5. **Memory Management**: Tools for storing, retrieving, and managing vector-based memories.

## Technology Stack

### Current Technologies
- **TypeScript/Node.js**: Core language and runtime
- **MCP SDK**: For Model Context Protocol implementation
- **Zod**: Schema validation

### New Technologies to Add
- **Vector Database**: 
  - Options: [chromadb](https://www.trychroma.com/) (in-memory or persistent), [LanceDB](https://lancedb.github.io/lancedb/) (file-based)
- **Embedding APIs**:
  - [Google Gemini API](https://ai.google.dev/gemini-api) for text embeddings
  - [Ollama](https://ollama.com/) as a local alternative for embeddings
- **API Communication**:
  - [Axios](https://axios-http.com/) for HTTP requests
- **Storage**:
  - [Node-persist](https://github.com/simonlast/node-persist) or similar for simple persistent storage
- **Testing**:
  - Jest for unit testing

## Module Structure

```
aleph-10/
├── build/                       # Compiled JavaScript output
├── node_modules/                # Dependencies
├── src/                         # Source code
│   ├── index.ts                 # Main application file
│   ├── weather/                 # Weather service module
│   │   ├── alerts.ts            # Weather alerts functionality
│   │   ├── forecast.ts          # Weather forecast functionality
│   │   └── utils.ts             # Weather API utilities
│   ├── memory/                  # Memory management module
│   │   ├── store.ts             # Vector store implementation
│   │   ├── embeddings/          # Embedding services
│   │   │   ├── gemini.ts        # Google Gemini embedding service
│   │   │   ├── ollama.ts        # Ollama embedding service
│   │   │   └── index.ts         # Service factory
│   │   └── tools.ts             # Memory-related MCP tools
│   ├── utils/                   # Shared utilities
│   │   ├── config.ts            # Configuration management
│   │   ├── errors.ts            # Error handling
│   │   └── validation.ts        # Input validation utilities
│   └── types/                   # TypeScript type definitions
│       ├── weather.ts           # Weather-related types
│       ├── memory.ts            # Memory-related types
│       └── api.ts               # API response types
├── tests/                       # Test files
│   ├── weather/                 # Weather module tests
│   ├── memory/                  # Memory module tests
│   └── utils/                   # Utility tests
├── PLANNING.md                  # Project planning document
├── TASK.md                      # Task tracking document
├── package.json                 # Project metadata and dependencies
├── pnpm-lock.yaml              # Lock file for dependencies
└── tsconfig.json               # TypeScript configuration
```

## Database Schema

### Memory Vector Store

The vector database will store items with the following structure:

```typescript
interface MemoryItem {
  id: string;              // Unique identifier for the memory
  text: string;            // Original text content
  metadata: {              // Associated metadata
    timestamp: number;     // When the memory was created/updated
    source: string;        // Source of the information
    tags: string[];        // Categorization tags
    [key: string]: any;    // Additional custom metadata
  };
  embedding: number[];     // Vector embedding of the text
}
```

## API Endpoints & Tools

### New MCP Tools to Implement

1. **memory-store**
   - Store text and metadata in the vector database
   - Automatically generate embeddings using the configured service

2. **memory-retrieve**
   - Retrieve memories semantically similar to a given query
   - Support filtering by metadata

3. **memory-update**
   - Update existing memories
   - Re-generate embeddings as needed

4. **memory-delete**
   - Remove memories from the database

5. **memory-stats**
   - Provide statistics about the memory store

## Embedding Service Architecture

The embedding service will be implemented with a provider pattern to support multiple embedding sources:

```typescript
interface EmbeddingProvider {
  name: string;
  getEmbedding(text: string): Promise<number[]>;
  getDimensions(): number;
}

class GeminiEmbeddingProvider implements EmbeddingProvider {
  // Implementation using Google Gemini API
}

class OllamaEmbeddingProvider implements EmbeddingProvider {
  // Implementation using local Ollama
}
```

## Configuration Management

Environment variables to support:

- `EMBEDDING_PROVIDER`: The embedding provider to use (gemini, ollama)
- `GEMINI_API_KEY`: API key for Google Gemini (if using)
- `OLLAMA_BASE_URL`: Base URL for Ollama API (if using)
- `VECTOR_DB_PATH`: Path for persistent vector database storage
- `LOG_LEVEL`: Logging verbosity

## Deployment Strategy

The server will be designed to run in the following environments:

1. **Local Development**: Running directly on the developer's machine
2. **Containerized**: Packaged as a Docker container
3. **Serverless**: Compatible with serverless environments that support Node.js

## Performance Considerations

- Implement caching for embeddings to reduce API calls
- Optimize vector search for latency vs. accuracy tradeoffs
- Consider batching strategies for embedding generation

## Security Considerations

- Secure API key handling
- Input validation to prevent injection attacks
- Rate limiting for external API calls
- Sanitization of stored memories

## Testing Strategy

- Unit tests for core functionality
- Integration tests for API interactions
- Performance benchmarks for vector operations

## Future Expansion Possibilities

- Multi-modal embeddings (text, images)
- Knowledge graph integration
- Streaming response support
- Fine-tuning of embedding models
- Cross-language vector embedding support

## Coding Style & Conventions

- Use TypeScript interfaces and type safety throughout
- Follow ESLint and Prettier configurations
- Implement error handling with custom error classes
- Use async/await for asynchronous operations
- Document with JSDoc comments
- Keep functions small and focused (< 50 lines)
- Use dependency injection for testability
