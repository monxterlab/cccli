export interface ConfigStorage {
  configs: Record<string, Record<string, string>>;
  activeConfig?: string;
}

export interface ClaudeConfig {
  [key: string]: string;
}

export type OS = 'win32' | 'darwin' | 'linux' | 'unknown';

/**
 * 单个路由配置
 */
export interface RouterConfig {
  /** 路由名称（唯一标识） */
  name: string;
  /** OpenAI API 基础地址 */
  openaiBaseUrl: string;
  /** 本地路由服务地址（如 http://localhost:3000） */
  routerUrl: string;
  /** OpenAI API Key */
  apiKey: string;
  /** 监听端口（默认 3000） */
  port: number;
}

/**
 * 路由配置存储结构
 */
export interface RoutersStorage {
  routers: Record<string, RouterConfig>;
}
