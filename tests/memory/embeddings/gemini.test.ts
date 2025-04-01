/**
 * Tests for GeminiEmbeddingProvider
 */
import { GeminiEmbeddingProvider } from '../../../src/memory/embeddings/gemini.js';
import { EmbeddingError } from '../../../src/utils/errors.js';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the global fetch function
global.fetch = vi.fn();

describe('GeminiEmbeddingProvider', () => {
  let provider: GeminiEmbeddingProvider;
  const mockApiKey = 'test-api-key';
  
  beforeEach(() => {
    provider = new GeminiEmbeddingProvider(mockApiKey);
    vi.resetAllMocks();
  });
  
  describe('constructor', () => {
    it('should create an instance with the correct name', () => {
      expect(provider.name).toBe('gemini');
    });
  });
  
  describe('getDimensions', () => {
    it('should return the correct embedding dimensions', () => {
      expect(provider.getDimensions()).toBe(768);
    });
  });
  
  describe('getEmbedding', () => {
    it('should return an embedding array on successful API call', async () => {
      // Arrange
      const mockEmbedding = Array(768).fill(0).map((_, i) => i / 768);
      const mockResponse = {
        embedding: {
          values: mockEmbedding,
        },
      };
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      });
      
      // Act
      const result = await provider.getEmbedding('Test text');
      
      // Assert
      expect(result).toEqual(mockEmbedding);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`key=${mockApiKey}`),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining('Test text'),
        })
      );
    });
    
    it('should throw EmbeddingError when API call fails', async () => {
      // Arrange
      const errorMessage = 'API error';
      const mockErrorResponse = {
        error: {
          message: errorMessage,
        },
      };
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValueOnce(mockErrorResponse),
      });
      
      // Act & Assert
      await expect(provider.getEmbedding('Test text')).rejects.toThrow(EmbeddingError);
      await expect(provider.getEmbedding('Test text')).rejects.toThrow(
        /Failed to get embedding from Gemini:/
      );
    });
    
    it('should throw EmbeddingError when response format is unexpected', async () => {
      // Arrange
      const mockInvalidResponse = {
        // Missing the 'embedding' property
        something_else: {}
      };
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockInvalidResponse),
      });
      
      // Act & Assert
      await expect(provider.getEmbedding('Test text')).rejects.toThrow(EmbeddingError);
      await expect(provider.getEmbedding('Test text')).rejects.toThrow(
        /Failed to get embedding from Gemini:/
      );
    });
    
    it('should throw EmbeddingError when fetch throws an error', async () => {
      // Arrange
      const error = new Error('Network error');
      (global.fetch as any).mockRejectedValueOnce(error);
      
      // Act & Assert
      await expect(provider.getEmbedding('Test text')).rejects.toThrow(EmbeddingError);
      
      // Update the regex to match only part of the error message
      await expect(provider.getEmbedding('Test text')).rejects.toThrow(
        /Failed to get embedding from Gemini/
      );
    });
  });
});
