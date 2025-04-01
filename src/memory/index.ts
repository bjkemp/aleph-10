/**
 * Memory module entry point
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { EmbeddingProvider } from "../types/memory.js";
import { AppConfig } from "../utils/config.js";
import { createEmbeddingProvider } from "./embeddings/index.js";
import { InMemoryVectorStore } from "./store.js";
import { registerMemoryTools } from "./tools.js";

/**
 * Initialize the memory module and register memory tools
 * 
 * @param server - The MCP server instance
 * @param config - Application configuration
 * @returns A cleanup function to call when shutting down
 */
export async function initializeMemoryModule(
  server: McpServer,
  config: AppConfig
): Promise<() => Promise<void>> {
  // Create the embedding provider
  const embeddingProvider = createEmbeddingProvider(config);
  
  // Create and initialize the vector store
  const vectorStore = new InMemoryVectorStore(
    embeddingProvider,
    config.vectorDbPath,
  );
  
  await vectorStore.initialize();
  
  // Register memory tools
  registerMemoryTools(server, vectorStore);
  
  // Return a cleanup function
  return async () => {
    // Nothing to clean up for now, but we'll keep this for future expansion
  };
}
