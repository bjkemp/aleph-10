/**
 * In-memory vector store implementation
 */
import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { 
  EmbeddingProvider, 
  MemoryFilter, 
  MemoryItem, 
  MemoryMetadata, 
  MemoryStats, 
  SearchResult, 
  VectorStore 
} from '../types/memory.js';
import { MemoryNotFoundError, VectorStoreError } from '../utils/errors.js';

/**
 * In-memory implementation of the VectorStore interface
 */
export class InMemoryVectorStore implements VectorStore {
  /**
   * The map of memory items by ID
   */
  private items: Map<string, MemoryItem> = new Map();
  
  /**
   * The embedding provider to use for embedding text
   */
  private embeddingProvider: EmbeddingProvider;
  
  /**
   * The path to the file for persisting the vector store
   */
  private persistPath?: string;
  
  /**
   * Create a new in-memory vector store
   * 
   * @param embeddingProvider - The embedding provider to use
   * @param persistPath - Optional path to persist the vector store
   */
  constructor(embeddingProvider: EmbeddingProvider, persistPath?: string) {
    this.embeddingProvider = embeddingProvider;
    this.persistPath = persistPath;
  }
  
  /**
   * Initialize the vector store
   * 
   * @returns A promise that resolves when the store is initialized
   */
  async initialize(): Promise<void> {
    if (this.persistPath) {
      try {
        // Ensure directory exists
        const dir = path.dirname(this.persistPath);
        await fs.mkdir(dir, { recursive: true });
        
        // Try to load existing data
        try {
          const data = await fs.readFile(this.persistPath, 'utf-8');
          const parsed = JSON.parse(data);
          
          if (Array.isArray(parsed)) {
            this.items.clear();
            for (const item of parsed) {
              this.items.set(item.id, item);
            }
            console.log(`Loaded ${this.items.size} items from ${this.persistPath}`);
          }
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
            console.warn(`Failed to load vector store from ${this.persistPath}:`, error);
          }
        }
      } catch (error) {
        throw new VectorStoreError(`Failed to initialize vector store: ${error}`);
      }
    }
  }
  
  /**
   * Add a memory item to the store
   * 
   * @param item - The memory item to add (without an ID)
   * @returns The added memory item with a generated ID
   */
  async add(item: Omit<MemoryItem, 'id'>): Promise<MemoryItem> {
    const id = randomUUID();
    const memoryItem: MemoryItem = {
      ...item,
      id,
    };
    
    this.items.set(id, memoryItem);
    await this.persist();
    
    return memoryItem;
  }
  
  /**
   * Get a memory item by ID
   * 
   * @param id - The ID of the memory item
   * @returns The memory item or null if not found
   */
  async get(id: string): Promise<MemoryItem | null> {
    return this.items.get(id) || null;
  }
  
  /**
   * Update a memory item
   * 
   * @param id - The ID of the memory item
   * @param updates - The updates to apply
   * @returns The updated memory item or null if not found
   */
  async update(id: string, updates: Partial<Omit<MemoryItem, 'id'>>): Promise<MemoryItem | null> {
    const item = this.items.get(id);
    if (!item) {
      return null;
    }
    
    const updatedItem: MemoryItem = {
      ...item,
      ...updates,
      id, // Ensure ID doesn't change
    };
    
    // If text is updated and no new embedding is provided, generate a new embedding
    if (updates.text && !updates.embedding) {
      try {
        updatedItem.embedding = await this.embeddingProvider.getEmbedding(updates.text);
      } catch (error) {
        throw new VectorStoreError(`Failed to generate embedding for updated text: ${error}`);
      }
    }
    
    // Merge metadata if it's a partial update
    if (updates.metadata && Object.keys(updates.metadata).length > 0) {
      updatedItem.metadata = {
        ...item.metadata,
        ...updates.metadata,
      };
    }
    
    this.items.set(id, updatedItem);
    await this.persist();
    
    return updatedItem;
  }
  
  /**
   * Delete a memory item
   * 
   * @param id - The ID of the memory item
   * @returns True if the item was deleted, false if it wasn't found
   */
  async delete(id: string): Promise<boolean> {
    const result = this.items.delete(id);
    if (result) {
      await this.persist();
    }
    return result;
  }
  
  /**
   * Search for memory items by vector similarity
   * 
   * @param embedding - The query embedding
   * @param limit - The maximum number of results to return
   * @param filter - Optional filter criteria
   * @returns The search results, ordered by similarity
   */
  async search(embedding: number[], limit = 10, filter?: MemoryFilter): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    for (const item of this.items.values()) {
      // Apply filter if provided
      if (filter && !this.matchesFilter(item, filter)) {
        continue;
      }
      
      // Calculate cosine similarity
      const similarity = this.cosineSimilarity(embedding, item.embedding);
      
      results.push({
        item,
        score: similarity,
      });
    }
    
    // Sort by score in descending order and limit the results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
  
  /**
   * Search for memory items by text similarity
   * 
   * @param text - The query text
   * @param limit - The maximum number of results to return
   * @param filter - Optional filter criteria
   * @returns The search results, ordered by similarity
   */
  async searchByText(text: string, limit = 10, filter?: MemoryFilter): Promise<SearchResult[]> {
    try {
      const embedding = await this.embeddingProvider.getEmbedding(text);
      return this.search(embedding, limit, filter);
    } catch (error) {
      throw new VectorStoreError(`Failed to search by text: ${error}`);
    }
  }
  
  /**
   * Get statistics about the memory store
   * 
   * @returns Statistics about the stored memory items
   */
  async getStats(): Promise<MemoryStats> {
    if (this.items.size === 0) {
      return {
        totalItems: 0,
        uniqueSources: [],
        uniqueTags: [],
        oldestTimestamp: 0,
        newestTimestamp: 0,
      };
    }
    
    let oldestTimestamp = Infinity;
    let newestTimestamp = -Infinity;
    const sourcesSet = new Set<string>();
    const tagsSet = new Set<string>();
    
    for (const item of this.items.values()) {
      // Track timestamps
      const timestamp = item.metadata.timestamp;
      if (timestamp < oldestTimestamp) {
        oldestTimestamp = timestamp;
      }
      if (timestamp > newestTimestamp) {
        newestTimestamp = timestamp;
      }
      
      // Track sources
      if (item.metadata.source) {
        sourcesSet.add(item.metadata.source);
      }
      
      // Track tags
      if (item.metadata.tags && Array.isArray(item.metadata.tags)) {
        for (const tag of item.metadata.tags) {
          tagsSet.add(tag);
        }
      }
    }
    
    return {
      totalItems: this.items.size,
      uniqueSources: Array.from(sourcesSet),
      uniqueTags: Array.from(tagsSet),
      oldestTimestamp,
      newestTimestamp,
    };
  }
  
  /**
   * Clear all memory items
   */
  async clear(): Promise<void> {
    this.items.clear();
    await this.persist();
  }
  
  /**
   * Persist the vector store to disk if a path is configured
   * 
   * @returns A promise that resolves when the persistence is complete
   */
  private async persist(): Promise<void> {
    if (!this.persistPath) {
      return;
    }
    
    try {
      const data = JSON.stringify(Array.from(this.items.values()));
      await fs.writeFile(this.persistPath, data, 'utf-8');
    } catch (error) {
      console.error(`Failed to persist vector store to ${this.persistPath}:`, error);
    }
  }
  
  /**
   * Check if a memory item matches the filter criteria
   * 
   * @param item - The memory item to check
   * @param filter - The filter criteria
   * @returns True if the item matches the filter, false otherwise
   */
  private matchesFilter(item: MemoryItem, filter: MemoryFilter): boolean {
    const { metadata } = item;
    
    // Filter by tags
    if (filter.tags && Array.isArray(filter.tags) && filter.tags.length > 0) {
      if (!metadata.tags || !Array.isArray(metadata.tags)) {
        return false;
      }
      
      // Check if the item has at least one of the filter tags
      const hasMatchingTag = filter.tags.some(tag => metadata.tags.includes(tag));
      if (!hasMatchingTag) {
        return false;
      }
    }
    
    // Filter by source
    if (filter.source && metadata.source !== filter.source) {
      return false;
    }
    
    // Filter by timestamp range
    if (filter.fromDate && metadata.timestamp < filter.fromDate) {
      return false;
    }
    if (filter.toDate && metadata.timestamp > filter.toDate) {
      return false;
    }
    
    // Filter by custom metadata
    for (const [key, value] of Object.entries(filter)) {
      // Skip the standard filter keys we've already handled
      if (['tags', 'source', 'fromDate', 'toDate'].includes(key)) {
        continue;
      }
      
      // Check if the metadata has the key and the value matches
      if (metadata[key] !== value) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Calculate the cosine similarity between two vectors
   * 
   * @param a - The first vector
   * @param b - The second vector
   * @returns The cosine similarity between the vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new VectorStoreError(
        `Vector dimensions don't match: ${a.length} vs ${b.length}`
      );
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    if (normA === 0 || normB === 0) {
      return 0;
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
