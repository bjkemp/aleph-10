/**
 * Factory for creating embedding providers
 */
import { EmbeddingProvider } from "../../types/memory.js";
import { AppConfig, EmbeddingProviderType } from "../../utils/config.js";
import { ConfigError } from "../../utils/errors.js";
import { GeminiEmbeddingProvider } from "./gemini.js";
import { OllamaEmbeddingProvider } from "./ollama.js";

/**
 * Create an embedding provider based on the application configuration
 * 
 * @param config - The application configuration
 * @returns An instance of the configured embedding provider
 * @throws ConfigError if the provider cannot be created
 */
export function createEmbeddingProvider(config: AppConfig): EmbeddingProvider {
  switch (config.embeddingProvider) {
    case EmbeddingProviderType.GEMINI:
      if (!config.geminiApiKey) {
        throw new ConfigError("GEMINI_API_KEY is required for the Gemini embedding provider");
      }
      return new GeminiEmbeddingProvider(config.geminiApiKey);
    
    case EmbeddingProviderType.OLLAMA:
      return new OllamaEmbeddingProvider(config.ollamaBaseUrl, config.ollamaModel);
    
    default:
      throw new ConfigError(`Unsupported embedding provider: ${config.embeddingProvider}`);
  }
}
