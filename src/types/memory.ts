/**
 * Type definitions for memory-related data structures
 */

/**
 * Represents a memory item stored in the vector database
 */
export interface MemoryItem {
  id: string;              // Unique identifier for the memory
  text: string;            // Original text content
  metadata: MemoryMetadata; // Associated metadata
  embedding: number[];     // Vector embedding of the text
}

/**
 * Metadata associated with a memory item
 */
export interface MemoryMetadata {
  timestamp: number;     // When the memory was created/updated
  source: string;        // Source of the information
  tags: string[];        // Categorization tags
  [key: string]: any;    // Additional custom metadata
}

/**
 * Options for filtering memory items
 */
export interface MemoryFilter {
  tags?: string[];       // Filter by tags
  source?: string;       // Filter by source
  fromDate?: number;     // Filter by timestamp (from)
  toDate?: number;       // Filter by timestamp (to)
  [key: string]: any;    // Additional filter criteria
}

/**
 * Result of a vector search operation
 */
export interface SearchResult {
  item: MemoryItem;      // The memory item
  score: number;         // Similarity score (0-1)
}

/**
 * Statistics about the memory store
 */
export interface MemoryStats {
  totalItems: number;    // Total number of memory items
  uniqueSources: string[]; // List of unique sources
  uniqueTags: string[];  // List of unique tags
  oldestTimestamp: number; // Timestamp of the oldest memory
  newestTimestamp: number; // Timestamp of the newest memory
}

/**
 * Interface for any vector store implementation
 */
export interface VectorStore {
  // Core operations
  add(item: Omit<MemoryItem, 'id'>): Promise<MemoryItem>;
  get(id: string): Promise<MemoryItem | null>;
  update(id: string, item: Partial<Omit<MemoryItem, 'id'>>): Promise<MemoryItem | null>;
  delete(id: string): Promise<boolean>;
  
  // Search operations
  search(embedding: number[], limit?: number, filter?: MemoryFilter): Promise<SearchResult[]>;
  searchByText(text: string, limit?: number, filter?: MemoryFilter): Promise<SearchResult[]>;
  
  // Utility operations
  getStats(): Promise<MemoryStats>;
  clear(): Promise<void>;
}

/**
 * Interface for any embedding provider
 */
export interface EmbeddingProvider {
  name: string;
  getEmbedding(text: string): Promise<number[]>;
  getDimensions(): number;
}
