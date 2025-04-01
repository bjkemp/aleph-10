/**
 * Tests for embedding provider factory
 */
import { createEmbeddingProvider } from '../../../src/memory/embeddings/index.js';
import { GeminiEmbeddingProvider } from '../../../src/memory/embeddings/gemini.js';
import { OllamaEmbeddingProvider } from '../../../src/memory/embeddings/ollama.js';
import { AppConfig, EmbeddingProviderType } from '../../../src/utils/config.js';
import { ConfigError } from '../../../src/utils/errors.js';

describe('createEmbeddingProvider', () => {
  it('should create a GeminiEmbeddingProvider when configured', () => {
    // Arrange
    const config: AppConfig = {
      embeddingProvider: EmbeddingProviderType.GEMINI,
      geminiApiKey: 'test-api-key',
      ollamaBaseUrl: 'http://localhost:11434',
      ollamaModel: 'nomic-embed-text',
      vectorDbPath: './data/vector_db',
      logLevel: 'info' as any,
    };
    
    // Act
    const provider = createEmbeddingProvider(config);
    
    // Assert
    expect(provider).toBeInstanceOf(GeminiEmbeddingProvider);
    expect(provider.name).toBe('gemini');
  });
  
  it('should create an OllamaEmbeddingProvider when configured', () => {
    // Arrange
    const config: AppConfig = {
      embeddingProvider: EmbeddingProviderType.OLLAMA,
      ollamaBaseUrl: 'http://localhost:11434',
      ollamaModel: 'nomic-embed-text',
      vectorDbPath: './data/vector_db',
      logLevel: 'info' as any,
    };
    
    // Act
    const provider = createEmbeddingProvider(config);
    
    // Assert
    expect(provider).toBeInstanceOf(OllamaEmbeddingProvider);
    expect(provider.name).toBe('ollama');
  });
  
  it('should throw ConfigError when Gemini provider is selected without API key', () => {
    // Arrange
    const config: AppConfig = {
      embeddingProvider: EmbeddingProviderType.GEMINI,
      ollamaBaseUrl: 'http://localhost:11434',
      ollamaModel: 'nomic-embed-text',
      vectorDbPath: './data/vector_db',
      logLevel: 'info' as any,
    };
    
    // Act & Assert
    expect(() => createEmbeddingProvider(config)).toThrow(ConfigError);
    expect(() => createEmbeddingProvider(config)).toThrow(
      'GEMINI_API_KEY is required for the Gemini embedding provider'
    );
  });
  
  it('should throw ConfigError for unsupported provider type', () => {
    // Arrange
    const config: AppConfig = {
      embeddingProvider: 'invalid' as EmbeddingProviderType,
      ollamaBaseUrl: 'http://localhost:11434',
      ollamaModel: 'nomic-embed-text',
      vectorDbPath: './data/vector_db',
      logLevel: 'info' as any,
    };
    
    // Act & Assert
    expect(() => createEmbeddingProvider(config)).toThrow(ConfigError);
    expect(() => createEmbeddingProvider(config)).toThrow(
      'Unsupported embedding provider: invalid'
    );
  });
});
