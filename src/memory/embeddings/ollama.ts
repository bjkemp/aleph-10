/**
 * Ollama embedding provider implementation
 */
import { EmbeddingProvider } from "../../types/memory.js";
import { EmbeddingError } from "../../utils/errors.js";

/**
 * Default dimensions for Ollama embeddings
 * Note: This may vary based on the model being used
 */
const OLLAMA_DEFAULT_DIMENSIONS = 384;

/**
 * Implementation of the EmbeddingProvider interface for Ollama
 */
export class OllamaEmbeddingProvider implements EmbeddingProvider {
  /**
   * Provider name
   */
  public readonly name = "ollama";
  
  /**
   * Base URL for the Ollama API
   */
  private readonly baseUrl: string;
  
  /**
   * Model to use for embeddings
   */
  private readonly model: string;
  
  /**
   * Create a new Ollama embedding provider
   * 
   * @param baseUrl - Base URL for the Ollama API
   * @param model - Model to use for embeddings
   */
  constructor(baseUrl: string, model: string) {
    this.baseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    this.model = model;
  }
  
  /**
   * Get the dimensions of the embeddings produced by this provider
   */
  getDimensions(): number {
    return OLLAMA_DEFAULT_DIMENSIONS;
  }
  
  /**
   * Get the embedding for the given text
   * 
   * @param text - The text to embed
   * @returns A vector representation of the text
   * @throws EmbeddingError if the embedding fails
   */
  async getEmbedding(text: string): Promise<number[]> {
    try {
      const url = `${this.baseUrl}/api/embeddings`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          prompt: text,
        }),
      });
      
      if (!response.ok) {
        let errorMessage = `HTTP error ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = `${errorMessage}: ${JSON.stringify(errorData)}`;
        } catch {
          // In case we can't parse the error response as JSON
          errorMessage = `${errorMessage}: ${await response.text()}`;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      if (!data.embedding || !Array.isArray(data.embedding)) {
        throw new Error(`Unexpected response format from Ollama API: ${JSON.stringify(data)}`);
      }
      
      return data.embedding;
    } catch (error) {
      if (error instanceof Error) {
        throw new EmbeddingError(`Failed to get embedding from Ollama: ${error.message}`);
      }
      throw new EmbeddingError(`Failed to get embedding from Ollama: ${String(error)}`);
    }
  }
}
