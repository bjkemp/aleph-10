#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { initializeMemoryModule } from "./memory/index.js";
import { registerWeatherTools } from "./weather/index.js";
import { getConfig } from "./utils/config.js";
/**
 * Main application entry point
 */
async function main() {
    try {
        // Load configuration
        const config = getConfig();
        // Create server instance
        const server = new McpServer({
            name: "aleph-10",
            version: "1.0.0",
            capabilities: {
                resources: {},
                tools: {},
            },
        });
        // Register weather tools
        registerWeatherTools(server);
        // Initialize memory module
        const cleanupMemory = await initializeMemoryModule(server, config);
        // Connect the server to the transport
        const transport = new StdioServerTransport();
        await server.connect(transport);
        console.error("Aleph-10 MCP Server running on stdio");
        // Handle cleanup on exit
        process.on("SIGINT", async () => {
            console.error("Shutting down...");
            await cleanupMemory();
            process.exit(0);
        });
        process.on("SIGTERM", async () => {
            console.error("Shutting down...");
            await cleanupMemory();
            process.exit(0);
        });
    }
    catch (error) {
        console.error("Fatal error in main():", error);
        process.exit(1);
    }
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
