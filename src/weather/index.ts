/**
 * Weather module entry point
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAlertsTools } from "./alerts.js";
import { registerForecastTools } from "./forecast.js";

/**
 * Register all weather-related tools with the MCP server
 * 
 * @param server - The MCP server instance
 */
export function registerWeatherTools(server: McpServer): void {
  registerAlertsTools(server);
  registerForecastTools(server);
}
