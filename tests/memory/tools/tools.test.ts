/**
 * Tests for memory tools registration and functionality
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerMemoryTools } from "../../../src/memory/tools.js";
import { MemoryItem, SearchResult, VectorStore } from "../../../src/types/memory.js";
import { MemoryNotFoundError } from "../../../src/utils/errors.js";

// Mock McpServer
jest.mock("@modelcontextprotocol/sdk/server/mcp.js", () => {
  return {
    McpServer: jest.fn().mockImplementation(() => {
      return {
        tool: jest.fn(),
      };
    }),
  };
});

describe('Memory Tools', () => {
  let mockServer: jest.Mocked<McpServer>;
  let mockVectorStore: jest.Mocked<VectorStore>;
  
  beforeEach(() => {
    // Create mock server
    mockServer = new McpServer() as jest.Mocked<McpServer>;
    
    // Create mock vector store
    mockVectorStore = {
      add: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      search: jest.fn(),
      searchByText: jest.fn(),
      getStats: jest.fn(),
      clear: jest.fn(),
      initialize: jest.fn(),
    } as unknown as jest.Mocked<VectorStore>;
    
    // Reset mocks
    jest.clearAllMocks();
  });
  
  describe('registerMemoryTools', () => {
    it('should register all memory tools with the server', () => {
      // Act
      registerMemoryTools(mockServer, mockVectorStore);
      
      // Assert
      expect(mockServer.tool).toHaveBeenCalledTimes(5);
      
      // Check tool registrations by name
      const toolNames = (mockServer.tool as jest.Mock).mock.calls.map(call => call[0]);
      expect(toolNames).toContain('memory-store');
      expect(toolNames).toContain('memory-retrieve');
      expect(toolNames).toContain('memory-update');
      expect(toolNames).toContain('memory-delete');
      expect(toolNames).toContain('memory-stats');
    });
  });
  
  describe('memory-store tool', () => {
    it('should handle successful memory storage', async () => {
      // Arrange
      const addedItem: MemoryItem = {
        id: 'test-id',
        text: 'Test memory',
        metadata: {
          timestamp: Date.now(),
          source: 'user',
          tags: [],
        },
        embedding: [],
      };
      mockVectorStore.add.mockResolvedValue(addedItem);
      
      let storeToolCallback: Function | undefined;
      
      mockServer.tool.mockImplementation((name, _desc, _schema, callback) => {
        if (name === 'memory-store') {
          storeToolCallback = callback;
        }
      });
      
      // Register tools to capture callbacks
      registerMemoryTools(mockServer, mockVectorStore);
      
      // Act
      const result = await storeToolCallback?.({
        text: 'Test memory',
        source: 'user',
      });
      
      // Assert
      expect(mockVectorStore.add).toHaveBeenCalledWith(expect.objectContaining({
        text: 'Test memory',
        metadata: expect.objectContaining({
          source: 'user',
        }),
      }));
      
      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: expect.stringContaining('Memory stored successfully'),
          },
        ],
        json_response: {
          id: 'test-id',
          success: true,
        },
      });
    });
    
    it('should handle errors during memory storage', async () => {
      // Arrange
      const testError = new Error('Test error');
      mockVectorStore.add.mockRejectedValue(testError);
      
      let storeToolCallback: Function | undefined;
      
      mockServer.tool.mockImplementation((name, _desc, _schema, callback) => {
        if (name === 'memory-store') {
          storeToolCallback = callback;
        }
      });
      
      // Register tools to capture callbacks
      registerMemoryTools(mockServer, mockVectorStore);
      
      // Act
      const result = await storeToolCallback?.({
        text: 'Test memory',
      });
      
      // Assert
      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: expect.stringContaining('Failed to store memory'),
          },
        ],
        json_response: expect.objectContaining({
          success: false,
        }),
      });
    });
  });
  
  describe('memory-retrieve tool', () => {
    it('should return search results in formatted response', async () => {
      // Arrange
      const searchResults: SearchResult[] = [
        {
          item: {
            id: 'item1',
            text: 'Memory content 1',
            metadata: {
              timestamp: Date.now(),
              source: 'user',
              tags: ['tag1'],
            },
            embedding: [],
          },
          score: 0.95,
        },
        {
          item: {
            id: 'item2',
            text: 'Memory content 2',
            metadata: {
              timestamp: Date.now(),
              source: 'system',
              tags: ['tag2'],
            },
            embedding: [],
          },
          score: 0.85,
        },
      ];
      
      mockVectorStore.searchByText.mockResolvedValue(searchResults);
      
      let retrieveToolCallback: Function | undefined;
      
      mockServer.tool.mockImplementation((name, _desc, _schema, callback) => {
        if (name === 'memory-retrieve') {
          retrieveToolCallback = callback;
        }
      });
      
      // Register tools to capture callbacks
      registerMemoryTools(mockServer, mockVectorStore);
      
      // Act
      const result = await retrieveToolCallback?.({
        query: 'Test query',
        limit: 5,
      });
      
      // Assert
      expect(mockVectorStore.searchByText).toHaveBeenCalledWith(
        'Test query',
        5,
        undefined
      );
      
      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: expect.stringContaining('Found 2 memories'),
          },
        ],
        json_response: {
          memories: expect.arrayContaining([
            expect.objectContaining({
              id: 'item1',
              score: 0.95,
            }),
            expect.objectContaining({
              id: 'item2',
              score: 0.85,
            }),
          ]),
          count: 2,
        },
      });
    });
    
    it('should handle no results found', async () => {
      // Arrange
      mockVectorStore.searchByText.mockResolvedValue([]);
      
      let retrieveToolCallback: Function | undefined;
      
      mockServer.tool.mockImplementation((name, _desc, _schema, callback) => {
        if (name === 'memory-retrieve') {
          retrieveToolCallback = callback;
        }
      });
      
      // Register tools to capture callbacks
      registerMemoryTools(mockServer, mockVectorStore);
      
      // Act
      const result = await retrieveToolCallback?.({
        query: 'Test query',
      });
      
      // Assert
      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: 'No matching memories found.',
          },
        ],
        json_response: {
          memories: [],
          count: 0,
        },
      });
    });
  });
  
  describe('memory-update tool', () => {
    it('should handle successful memory update', async () => {
      // Arrange
      const existingItem: MemoryItem = {
        id: 'test-id',
        text: 'Original text',
        metadata: {
          timestamp: Date.now(),
          source: 'user',
          tags: ['original'],
        },
        embedding: [],
      };
      
      const updatedItem: MemoryItem = {
        ...existingItem,
        text: 'Updated text',
        metadata: {
          ...existingItem.metadata,
          tags: ['updated'],
        },
      };
      
      mockVectorStore.get.mockResolvedValue(existingItem);
      mockVectorStore.update.mockResolvedValue(updatedItem);
      
      let updateToolCallback: Function | undefined;
      
      mockServer.tool.mockImplementation((name, _desc, _schema, callback) => {
        if (name === 'memory-update') {
          updateToolCallback = callback;
        }
      });
      
      // Register tools to capture callbacks
      registerMemoryTools(mockServer, mockVectorStore);
      
      // Act
      const result = await updateToolCallback?.({
        id: 'test-id',
        text: 'Updated text',
        tags: ['updated'],
      });
      
      // Assert
      expect(mockVectorStore.get).toHaveBeenCalledWith('test-id');
      expect(mockVectorStore.update).toHaveBeenCalledWith(
        'test-id',
        expect.objectContaining({
          text: 'Updated text',
          metadata: expect.objectContaining({
            tags: ['updated'],
          }),
        })
      );
      
      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: expect.stringContaining('Memory updated successfully'),
          },
        ],
        json_response: {
          id: 'test-id',
          success: true,
          item: updatedItem,
        },
      });
    });
    
    it('should handle non-existent memory', async () => {
      // Arrange
      mockVectorStore.get.mockResolvedValue(null);
      
      let updateToolCallback: Function | undefined;
      
      mockServer.tool.mockImplementation((name, _desc, _schema, callback) => {
        if (name === 'memory-update') {
          updateToolCallback = callback;
        }
      });
      
      // Register tools to capture callbacks
      registerMemoryTools(mockServer, mockVectorStore);
      
      // Act
      const result = await updateToolCallback?.({
        id: 'non-existent-id',
        text: 'Updated text',
      });
      
      // Assert
      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: expect.stringContaining('Failed to update memory'),
          },
        ],
        json_response: expect.objectContaining({
          success: false,
        }),
      });
    });
  });
  
  describe('memory-delete tool', () => {
    it('should handle successful memory deletion', async () => {
      // Arrange
      mockVectorStore.delete.mockResolvedValue(true);
      
      let deleteToolCallback: Function | undefined;
      
      mockServer.tool.mockImplementation((name, _desc, _schema, callback) => {
        if (name === 'memory-delete') {
          deleteToolCallback = callback;
        }
      });
      
      // Register tools to capture callbacks
      registerMemoryTools(mockServer, mockVectorStore);
      
      // Act
      const result = await deleteToolCallback?.({
        id: 'test-id',
      });
      
      // Assert
      expect(mockVectorStore.delete).toHaveBeenCalledWith('test-id');
      
      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: expect.stringContaining('Memory deleted successfully'),
          },
        ],
        json_response: {
          id: 'test-id',
          success: true,
        },
      });
    });
    
    it('should handle non-existent memory deletion', async () => {
      // Arrange
      mockVectorStore.delete.mockResolvedValue(false);
      
      let deleteToolCallback: Function | undefined;
      
      mockServer.tool.mockImplementation((name, _desc, _schema, callback) => {
        if (name === 'memory-delete') {
          deleteToolCallback = callback;
        }
      });
      
      // Register tools to capture callbacks
      registerMemoryTools(mockServer, mockVectorStore);
      
      // Act
      const result = await deleteToolCallback?.({
        id: 'non-existent-id',
      });
      
      // Assert
      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: expect.stringContaining('Failed to delete memory'),
          },
        ],
        json_response: expect.objectContaining({
          success: false,
        }),
      });
    });
  });
  
  describe('memory-stats tool', () => {
    it('should return formatted memory stats', async () => {
      // Arrange
      const stats = {
        totalItems: 2,
        uniqueSources: ['user', 'system'],
        uniqueTags: ['tag1', 'tag2'],
        oldestTimestamp: Date.now() - 1000,
        newestTimestamp: Date.now(),
      };
      
      mockVectorStore.getStats.mockResolvedValue(stats);
      
      let statsToolCallback: Function | undefined;
      
      mockServer.tool.mockImplementation((name, _desc, _schema, callback) => {
        if (name === 'memory-stats') {
          statsToolCallback = callback;
        }
      });
      
      // Register tools to capture callbacks
      registerMemoryTools(mockServer, mockVectorStore);
      
      // Act
      const result = await statsToolCallback?.({});
      
      // Assert
      expect(mockVectorStore.getStats).toHaveBeenCalled();
      
      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: expect.stringContaining('Memory store statistics'),
          },
        ],
        json_response: stats,
      });
    });
    
    it('should handle errors when getting stats', async () => {
      // Arrange
      const testError = new Error('Test error');
      mockVectorStore.getStats.mockRejectedValue(testError);
      
      let statsToolCallback: Function | undefined;
      
      mockServer.tool.mockImplementation((name, _desc, _schema, callback) => {
        if (name === 'memory-stats') {
          statsToolCallback = callback;
        }
      });
      
      // Register tools to capture callbacks
      registerMemoryTools(mockServer, mockVectorStore);
      
      // Act
      const result = await statsToolCallback?.({});
      
      // Assert
      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: expect.stringContaining('Failed to get memory stats'),
          },
        ],
        json_response: expect.objectContaining({
          success: false,
        }),
      });
    });
  });
});
