/**
 * Configuration management for the application
 */

/**
 * Supported embedding providers
 */
export enum EmbeddingProviderType {
  GEMINI = 'gemini',
  OLLAMA = 'ollama',
}

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Application configuration
 */
export interface AppConfig {
  embeddingProvider: EmbeddingProviderType;
  geminiApiKey?: string;
  ollamaBaseUrl: string;
  ollamaModel: string;
  vectorDbPath: string;
  logLevel: LogLevel;
}

/**
 * Default configuration values
 */
const defaultConfig: AppConfig = {
  embeddingProvider: EmbeddingProviderType.GEMINI,
  ollamaBaseUrl: 'http://localhost:11434',
  ollamaModel: 'nomic-embed-text',
  vectorDbPath: './data/vector_db',
  logLevel: LogLevel.INFO,
};

/**
 * Load configuration from environment variables
 */
export function loadConfig(): AppConfig {
  return {
    embeddingProvider: getEnumFromEnv('EMBEDDING_PROVIDER', EmbeddingProviderType, defaultConfig.embeddingProvider),
    geminiApiKey: process.env.GEMINI_API_KEY,
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL || defaultConfig.ollamaBaseUrl,
    ollamaModel: process.env.OLLAMA_MODEL || defaultConfig.ollamaModel,
    vectorDbPath: process.env.VECTOR_DB_PATH || defaultConfig.vectorDbPath,
    logLevel: getEnumFromEnv('LOG_LEVEL', LogLevel, defaultConfig.logLevel),
  };
}

/**
 * Helper function to get an enum value from an environment variable
 */
function getEnumFromEnv<T extends object>(
  envVarName: string, 
  enumObj: T, 
  defaultValue: T[keyof T]
): T[keyof T] {
  const envValue = process.env[envVarName];
  if (!envValue) return defaultValue;

  // Check if the value exists in the enum
  const enumValues = Object.values(enumObj);
  if (enumValues.includes(envValue as any)) {
    return envValue as T[keyof T];
  }
  
  console.warn(`Invalid ${envVarName} value: ${envValue}. Using default: ${defaultValue}`);
  return defaultValue;
}

/**
 * Validate the configuration
 * 
 * @throws Error if the configuration is invalid
 */
export function validateConfig(config: AppConfig): void {
  if (config.embeddingProvider === EmbeddingProviderType.GEMINI && !config.geminiApiKey) {
    throw new Error('GEMINI_API_KEY is required when using the Gemini embedding provider');
  }
}

/**
 * Get the current application configuration
 */
export function getConfig(): AppConfig {
  const config = loadConfig();
  validateConfig(config);
  return config;
}
