/**
 * Tests for OllamaEmbeddingProvider
 */
import { OllamaEmbeddingProvider } from '../../../src/memory/embeddings/ollama.js';
import { EmbeddingError } from '../../../src/utils/errors.js';

// Mock the global fetch function
global.fetch = jest.fn();

describe('OllamaEmbeddingProvider', () => {
  let provider: OllamaEmbeddingProvider;
  const mockBaseUrl = 'http://localhost:11434';
  const mockModel = 'nomic-embed-text';
  
  beforeEach(() => {
    provider = new OllamaEmbeddingProvider(mockBaseUrl, mockModel);
    jest.clearAllMocks();
  });
  
  describe('constructor', () => {
    it('should create an instance with the correct name', () => {
      expect(provider.name).toBe('ollama');
    });
  });
  
  describe('getDimensions', () => {
    it('should return the correct embedding dimensions', () => {
      expect(provider.getDimensions()).toBe(1024);
    });
  });
  
  describe('getEmbedding', () => {
    it('should return an embedding array on successful API call', async () => {
      // Arrange
      const mockEmbedding = Array(1024).fill(0).map((_, i) => i / 1024);
      const mockResponse = {
        embedding: mockEmbedding,
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });
      
      // Act
      const result = await provider.getEmbedding('Test text');
      
      // Assert
      expect(result).toEqual(mockEmbedding);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/api/embeddings`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining(mockModel),
        })
      );
    });
    
    it('should throw EmbeddingError when API call fails', async () => {
      // Arrange
      const errorMessage = 'API error';
      const mockErrorResponse = {
        error: errorMessage,
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValueOnce(mockErrorResponse),
      });
      
      // Act & Assert
      await expect(provider.getEmbedding('Test text')).rejects.toThrow(EmbeddingError);
      await expect(provider.getEmbedding('Test text')).rejects.toThrow(
        /Failed to get embedding from Ollama:/
      );
    });
    
    it('should throw EmbeddingError when response format is unexpected', async () => {
      // Arrange
      const mockInvalidResponse = {
        // Missing the 'embedding' property
        something_else: {}
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockInvalidResponse),
      });
      
      // Act & Assert
      await expect(provider.getEmbedding('Test text')).rejects.toThrow(EmbeddingError);
      await expect(provider.getEmbedding('Test text')).rejects.toThrow(
        /Failed to get embedding from Ollama:/
      );
    });
    
    it('should throw EmbeddingError when fetch throws an error', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      // Act & Assert
      await expect(provider.getEmbedding('Test text')).rejects.toThrow(EmbeddingError);
      await expect(provider.getEmbedding('Test text')).rejects.toThrow(
        /Failed to get embedding from Ollama: Network error/
      );
    });
  });
});
