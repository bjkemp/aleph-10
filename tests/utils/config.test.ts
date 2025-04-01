/**
 * Tests for configuration management
 */
import { AppConfig, EmbeddingProviderType, LogLevel, getConfig, loadConfig, validateConfig } from '../../src/utils/config.js';

// Save original environment variables
const originalEnv = { ...process.env };

describe('Config Utilities', () => {
  // Restore environment variables after each test
  afterEach(() => {
    process.env = { ...originalEnv };
  });
  
  describe('loadConfig', () => {
    it('should use default values when environment variables are not set', () => {
      // Clear relevant environment variables
      delete process.env.EMBEDDING_PROVIDER;
      delete process.env.GEMINI_API_KEY;
      delete process.env.OLLAMA_BASE_URL;
      delete process.env.OLLAMA_MODEL;
      delete process.env.VECTOR_DB_PATH;
      delete process.env.LOG_LEVEL;
      
      // Act
      const config = loadConfig();
      
      // Assert
      expect(config).toEqual({
        embeddingProvider: EmbeddingProviderType.GEMINI,
        geminiApiKey: undefined,
        ollamaBaseUrl: 'http://localhost:11434',
        ollamaModel: 'nomic-embed-text',
        vectorDbPath: './data/vector_db',
        logLevel: LogLevel.INFO,
      });
    });
    
    it('should use environment variables when set', () => {
      // Set environment variables
      process.env.EMBEDDING_PROVIDER = 'ollama';
      process.env.GEMINI_API_KEY = 'test-api-key';
      process.env.OLLAMA_BASE_URL = 'http://custom-ollama:11434';
      process.env.OLLAMA_MODEL = 'custom-model';
      process.env.VECTOR_DB_PATH = './custom/path';
      process.env.LOG_LEVEL = 'debug';
      
      // Act
      const config = loadConfig();
      
      // Assert
      expect(config).toEqual({
        embeddingProvider: EmbeddingProviderType.OLLAMA,
        geminiApiKey: 'test-api-key',
        ollamaBaseUrl: 'http://custom-ollama:11434',
        ollamaModel: 'custom-model',
        vectorDbPath: './custom/path',
        logLevel: LogLevel.DEBUG,
      });
    });
    
    it('should ignore invalid enum values and use defaults', () => {
      // Set invalid environment variables
      process.env.EMBEDDING_PROVIDER = 'invalid-provider';
      process.env.LOG_LEVEL = 'invalid-level';
      
      // Mock console.warn
      const originalWarn = console.warn;
      console.warn = jest.fn();
      
      // Act
      const config = loadConfig();
      
      // Assert
      expect(config.embeddingProvider).toBe(EmbeddingProviderType.GEMINI);
      expect(config.logLevel).toBe(LogLevel.INFO);
      
      // Verify warnings were logged
      expect(console.warn).toHaveBeenCalledTimes(2);
      
      // Restore console.warn
      console.warn = originalWarn;
    });
  });
  
  describe('validateConfig', () => {
    it('should not throw error for valid Gemini config', () => {
      // Arrange
      const config: AppConfig = {
        embeddingProvider: EmbeddingProviderType.GEMINI,
        geminiApiKey: 'test-api-key',
        ollamaBaseUrl: 'http://localhost:11434',
        ollamaModel: 'nomic-embed-text',
        vectorDbPath: './data/vector_db',
        logLevel: LogLevel.INFO,
      };
      
      // Act & Assert
      expect(() => validateConfig(config)).not.toThrow();
    });
    
    it('should not throw error for valid Ollama config', () => {
      // Arrange
      const config: AppConfig = {
        embeddingProvider: EmbeddingProviderType.OLLAMA,
        ollamaBaseUrl: 'http://localhost:11434',
        ollamaModel: 'nomic-embed-text',
        vectorDbPath: './data/vector_db',
        logLevel: LogLevel.INFO,
      };
      
      // Act & Assert
      expect(() => validateConfig(config)).not.toThrow();
    });
    
    it('should throw error for Gemini config without API key', () => {
      // Arrange
      const config: AppConfig = {
        embeddingProvider: EmbeddingProviderType.GEMINI,
        ollamaBaseUrl: 'http://localhost:11434',
        ollamaModel: 'nomic-embed-text',
        vectorDbPath: './data/vector_db',
        logLevel: LogLevel.INFO,
      };
      
      // Act & Assert
      expect(() => validateConfig(config)).toThrow();
      expect(() => validateConfig(config)).toThrow(
        'GEMINI_API_KEY is required when using the Gemini embedding provider'
      );
    });
  });
  
  describe('getConfig', () => {
    it('should return a validated configuration', () => {
      // Set environment variables for a valid config
      process.env.EMBEDDING_PROVIDER = 'ollama'; // Use Ollama to avoid needing a Gemini API key
      
      // Mock loadConfig and validateConfig
      const mockConfig: AppConfig = {
        embeddingProvider: EmbeddingProviderType.OLLAMA,
        ollamaBaseUrl: 'http://localhost:11434',
        ollamaModel: 'nomic-embed-text',
        vectorDbPath: './data/vector_db',
        logLevel: LogLevel.INFO,
      };
      
      // Act
      const config = getConfig();
      
      // Assert
      expect(config).toEqual(mockConfig);
    });
    
    it('should throw an error if validation fails', () => {
      // Set environment variables for an invalid config
      process.env.EMBEDDING_PROVIDER = 'gemini';
      delete process.env.GEMINI_API_KEY;
      
      // Act & Assert
      expect(() => getConfig()).toThrow();
    });
  });
});
