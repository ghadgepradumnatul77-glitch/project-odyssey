import type helmet from 'helmet';
import type { RuntimeEnvironment } from '../config/runtime';

export function helmetOptions(environment: RuntimeEnvironment): Parameters<typeof helmet>[0] {
  return {
    hsts: environment === 'staging' || environment === 'production'
      ? { maxAge: 31_536_000, includeSubDomains: true }
      : false
  };
}
