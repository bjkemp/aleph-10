/**
 * Tests for error handling utilities
 */
import { 
  ConfigError, 
  EmbeddingError, 
  MemoryNotFoundError, 
  VectorStoreError,
  formatErrorResponse 
} from '../../src/utils/errors.js';

describe('Error Classes', () => {
  describe('ConfigError', () => {
    it('should create an instance with the correct name', () => {
      // Arrange & Act
      const error = new ConfigError('Test error');
      
      // Assert
      expect(error.message).toBe('Configuration error: Test error');
      expect(error.name).toBe('ConfigError');
      expect(error instanceof Error).toBe(true);
    });
  });
  
  describe('EmbeddingError', () => {
    it('should create an instance with the correct name', () => {
      // Arrange & Act
      const error = new EmbeddingError('Test error');
      
      // Assert
      expect(error.message).toBe('Embedding error: Test error');
      expect(error.name).toBe('EmbeddingError');
      expect(error instanceof Error).toBe(true);
    });
  });
  
  describe('MemoryNotFoundError', () => {
    it('should create an instance with the correct name', () => {
      // Arrange & Act
      const error = new MemoryNotFoundError('test-id');
      
      // Assert
      expect(error.message).toBe("Memory with ID 'test-id' not found");
      expect(error.name).toBe('MemoryNotFoundError');
      expect(error instanceof Error).toBe(true);
    });
  });
  
  describe('VectorStoreError', () => {
    it('should create an instance with the correct name', () => {
      // Arrange & Act
      const error = new VectorStoreError('Test error');
      
      // Assert
      expect(error.message).toBe('Vector store error: Test error');
      expect(error.name).toBe('VectorStoreError');
      expect(error instanceof Error).toBe(true);
    });
  });
});

describe('formatErrorResponse', () => {
  it('should format a standard Error', () => {
    // Arrange
    const error = new Error('Test error');
    
    // Act
    const response = formatErrorResponse(error);
    
    // Assert
    expect(response).toEqual({
      error: 'UnexpectedError',
      details: 'Test error',
    });
  });
  
  it('should format a custom error class', () => {
    // Arrange
    const error = new ConfigError('Invalid configuration');
    
    // Act
    const response = formatErrorResponse(error);
    
    // Assert
    expect(response).toEqual({
      error: 'ConfigError',
      details: 'Configuration error: Invalid configuration',
    });
  });
  
  it('should handle non-Error objects', () => {
    // Arrange
    const notAnError = 'This is not an error';
    
    // Act
    const response = formatErrorResponse(notAnError);
    
    // Assert
    expect(response).toEqual({
      error: 'UnknownError',
      details: 'This is not an error',
    });
  });
  
  it('should handle null/undefined', () => {
    // Act
    const response1 = formatErrorResponse(null);
    const response2 = formatErrorResponse(undefined);
    
    // Assert
    expect(response1).toEqual({
      error: 'UnknownError',
      details: 'null',
    });
    
    expect(response2).toEqual({
      error: 'UnknownError',
      details: 'undefined',
    });
  });
});
