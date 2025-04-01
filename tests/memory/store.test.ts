/**
 * Tests for InMemoryVectorStore
 */
import { InMemoryVectorStore } from '../../src/memory/store.js';
import { EmbeddingProvider, MemoryItem } from '../../src/types/memory.js';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock embedding provider for testing
class MockEmbeddingProvider implements EmbeddingProvider {
  name = 'mock';
  private dimensions = 16; // Changed to match the expected dimensions
  
  async getEmbedding(text: string): Promise<number[]> {
    // Create a fixed-length embedding vector
    const embedding = new Array(this.dimensions).fill(0);
    
    // Fill with some deterministic values based on the text
    for (let i = 0; i < Math.min(text.length, this.dimensions); i++) {
      embedding[i] = text.charCodeAt(i) / 255;
    }
    
    return embedding;
  }
  
  getDimensions(): number {
    return this.dimensions;
  }
}

describe('InMemoryVectorStore', () => {
  let vectorStore: InMemoryVectorStore;
  let mockProvider: EmbeddingProvider;
  
  beforeEach(() => {
    mockProvider = new MockEmbeddingProvider();
    vectorStore = new InMemoryVectorStore(mockProvider);
  });
  
  describe('add', () => {
    it('should add a memory item and assign an ID', async () => {
      // Arrange
      const item = {
        text: 'Test memory',
        metadata: {
          timestamp: Date.now(),
          source: 'test',
          tags: ['test'],
        },
        embedding: await mockProvider.getEmbedding('Test memory'),
      };
      
      // Act
      const result = await vectorStore.add(item);
      
      // Assert
      expect(result.id).toBeDefined();
      expect(result.text).toBe(item.text);
      expect(result.metadata).toEqual(item.metadata);
      expect(result.embedding).toEqual(item.embedding);
      
      // Verify item is retrievable
      const retrieved = await vectorStore.get(result.id);
      expect(retrieved).toEqual(result);
    });
  });
  
  describe('get', () => {
    it('should return null for non-existent ID', async () => {
      // Act
      const result = await vectorStore.get('non-existent-id');
      
      // Assert
      expect(result).toBeNull();
    });
    
    it('should retrieve an existing item by ID', async () => {
      // Arrange
      const item = {
        text: 'Test memory',
        metadata: {
          timestamp: Date.now(),
          source: 'test',
          tags: ['test'],
        },
        embedding: await mockProvider.getEmbedding('Test memory'),
      };
      const added = await vectorStore.add(item);
      
      // Act
      const result = await vectorStore.get(added.id);
      
      // Assert
      expect(result).toEqual(added);
    });
  });
  
  describe('update', () => {
    it('should update an existing item', async () => {
      // Arrange
      const item = {
        text: 'Original text',
        metadata: {
          timestamp: Date.now(),
          source: 'test',
          tags: ['original'],
        },
        embedding: await mockProvider.getEmbedding('Original text'),
      };
      const added = await vectorStore.add(item);
      
      // Act
      const updates = {
        text: 'Updated text',
        metadata: {
          tags: ['updated'],
        },
      };
      const result = await vectorStore.update(added.id, updates);
      
      // Assert
      expect(result).toBeDefined();
      expect(result?.id).toBe(added.id);
      expect(result?.text).toBe(updates.text);
      expect(result?.metadata.tags).toEqual(updates.metadata.tags);
      
      // Source should be preserved
      expect(result?.metadata.source).toBe(item.metadata.source);
      
      // Embedding should be updated
      expect(result?.embedding).not.toEqual(item.embedding);
    });
    
    it('should return null when updating non-existent item', async () => {
      // Act
      const result = await vectorStore.update('non-existent-id', {
        text: 'Updated text',
      });
      
      // Assert
      expect(result).toBeNull();
    });
  });
  
  describe('delete', () => {
    it('should delete an existing item', async () => {
      // Arrange
      const item = {
        text: 'Test memory',
        metadata: {
          timestamp: Date.now(),
          source: 'test',
          tags: ['test'],
        },
        embedding: await mockProvider.getEmbedding('Test memory'),
      };
      const added = await vectorStore.add(item);
      
      // Act
      const result = await vectorStore.delete(added.id);
      
      // Assert
      expect(result).toBe(true);
      
      // Verify item is no longer retrievable
      const retrieved = await vectorStore.get(added.id);
      expect(retrieved).toBeNull();
    });
    
    it('should return false when deleting non-existent item', async () => {
      // Act
      const result = await vectorStore.delete('non-existent-id');
      
      // Assert
      expect(result).toBe(false);
    });
  });
  
  describe('search', () => {
    it('should return results ordered by similarity', async () => {
      // Arrange
      const items = [
        {
          text: 'Apple is a fruit',
          metadata: { timestamp: Date.now(), source: 'test', tags: ['fruit'] },
          embedding: await mockProvider.getEmbedding('Apple is a fruit'),
        },
        {
          text: 'Banana is also a fruit',
          metadata: { timestamp: Date.now(), source: 'test', tags: ['fruit'] },
          embedding: await mockProvider.getEmbedding('Banana is also a fruit'),
        },
        {
          text: 'Car is a vehicle',
          metadata: { timestamp: Date.now(), source: 'test', tags: ['vehicle'] },
          embedding: await mockProvider.getEmbedding('Car is a vehicle'),
        },
      ];
      
      for (const item of items) {
        await vectorStore.add(item);
      }
      
      // Act
      const queryEmbedding = await mockProvider.getEmbedding('fruit');
      const results = await vectorStore.search(queryEmbedding, 3);
      
      // Assert
      expect(results.length).toBe(3);
      
      // Fruit-related items should be ranked higher than vehicle
      const fruitItems = results.filter(r => r.item.metadata.tags.includes('fruit'));
      const vehicleItems = results.filter(r => r.item.metadata.tags.includes('vehicle'));
      
      // Check if all fruit items have higher scores than vehicle items
      for (const fruitItem of fruitItems) {
        for (const vehicleItem of vehicleItems) {
          expect(fruitItem.score).toBeGreaterThan(vehicleItem.score);
        }
      }
    });
    
    it('should apply filters to search results', async () => {
      // Arrange
      const items = [
        {
          text: 'Apple is a fruit',
          metadata: { timestamp: Date.now(), source: 'test', tags: ['fruit'] },
          embedding: await mockProvider.getEmbedding('Apple is a fruit'),
        },
        {
          text: 'Banana is also a fruit',
          metadata: { timestamp: Date.now(), source: 'data', tags: ['fruit'] },
          embedding: await mockProvider.getEmbedding('Banana is also a fruit'),
        },
        {
          text: 'Car is a vehicle',
          metadata: { timestamp: Date.now(), source: 'test', tags: ['vehicle'] },
          embedding: await mockProvider.getEmbedding('Car is a vehicle'),
        },
      ];
      
      for (const item of items) {
        await vectorStore.add(item);
      }
      
      // Act
      const queryEmbedding = await mockProvider.getEmbedding('anything');
      const results = await vectorStore.search(queryEmbedding, 10, { source: 'test' });
      
      // Assert
      expect(results.length).toBe(2);
      
      // All results should have source='test'
      for (const result of results) {
        expect(result.item.metadata.source).toBe('test');
      }
    });
  });
  
  describe('searchByText', () => {
    it('should search by converting text to embedding', async () => {
      // Arrange
      const items = [
        {
          text: 'Apple is a fruit',
          metadata: { timestamp: Date.now(), source: 'test', tags: ['fruit'] },
          embedding: await mockProvider.getEmbedding('Apple is a fruit'),
        },
        {
          text: 'Banana is also a fruit',
          metadata: { timestamp: Date.now(), source: 'test', tags: ['fruit'] },
          embedding: await mockProvider.getEmbedding('Banana is also a fruit'),
        },
        {
          text: 'Car is a vehicle',
          metadata: { timestamp: Date.now(), source: 'test', tags: ['vehicle'] },
          embedding: await mockProvider.getEmbedding('Car is a vehicle'),
        },
      ];
      
      for (const item of items) {
        await vectorStore.add(item);
      }
      
      // Act
      const results = await vectorStore.searchByText('fruit', 3);
      
      // Assert
      expect(results.length).toBe(3);
      
      // Fruit-related items should be ranked higher than vehicle
      const fruitItems = results.filter(r => r.item.metadata.tags.includes('fruit'));
      const vehicleItems = results.filter(r => r.item.metadata.tags.includes('vehicle'));
      
      // Check if all fruit items have higher scores than vehicle items
      for (const fruitItem of fruitItems) {
        for (const vehicleItem of vehicleItems) {
          expect(fruitItem.score).toBeGreaterThan(vehicleItem.score);
        }
      }
    });
  });
  
  describe('getStats', () => {
    it('should return correct statistics', async () => {
      // Arrange
      const now = Date.now();
      const items = [
        {
          text: 'Item 1',
          metadata: { timestamp: now - 1000, source: 'source1', tags: ['tag1'] },
          embedding: await mockProvider.getEmbedding('Item 1'),
        },
        {
          text: 'Item 2',
          metadata: { timestamp: now, source: 'source2', tags: ['tag2', 'tag3'] },
          embedding: await mockProvider.getEmbedding('Item 2'),
        },
      ];
      
      for (const item of items) {
        await vectorStore.add(item);
      }
      
      // Act
      const stats = await vectorStore.getStats();
      
      // Assert
      expect(stats.totalItems).toBe(2);
      expect(stats.uniqueSources).toContain('source1');
      expect(stats.uniqueSources).toContain('source2');
      expect(stats.uniqueTags).toContain('tag1');
      expect(stats.uniqueTags).toContain('tag2');
      expect(stats.uniqueTags).toContain('tag3');
      expect(stats.oldestTimestamp).toBe(now - 1000);
      expect(stats.newestTimestamp).toBe(now);
    });
    
    it('should return empty stats for empty store', async () => {
      // Act
      const stats = await vectorStore.getStats();
      
      // Assert
      expect(stats.totalItems).toBe(0);
      expect(stats.uniqueSources).toEqual([]);
      expect(stats.uniqueTags).toEqual([]);
      expect(stats.oldestTimestamp).toBe(0);
      expect(stats.newestTimestamp).toBe(0);
    });
  });
  
  describe('clear', () => {
    it('should remove all items', async () => {
      // Arrange
      const items = [
        {
          text: 'Item 1',
          metadata: { timestamp: Date.now(), source: 'test', tags: ['tag1'] },
          embedding: await mockProvider.getEmbedding('Item 1'),
        },
        {
          text: 'Item 2',
          metadata: { timestamp: Date.now(), source: 'test', tags: ['tag2'] },
          embedding: await mockProvider.getEmbedding('Item 2'),
        },
      ];
      
      for (const item of items) {
        await vectorStore.add(item);
      }
      
      // Verify items were added
      const statsBefore = await vectorStore.getStats();
      expect(statsBefore.totalItems).toBe(2);
      
      // Act
      await vectorStore.clear();
      
      // Assert
      const statsAfter = await vectorStore.getStats();
      expect(statsAfter.totalItems).toBe(0);
    });
  });
});
