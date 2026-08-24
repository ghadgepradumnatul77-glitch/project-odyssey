import { parseRuntimeConfig } from './runtime';
export interface IntelligenceConfig { enabled: boolean; serviceUrl: string | null; timeoutMs: number; }

export function getIntelligenceConfig(): IntelligenceConfig {
  return parseRuntimeConfig(process.env).intelligence;
}
