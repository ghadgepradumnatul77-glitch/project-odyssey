export function assertNonProductionMutation(environment: NodeJS.ProcessEnv, operation: string, readOnly = false): void {
  if (!readOnly && environment.NODE_ENV?.trim().toLowerCase() === 'production') {
    throw new Error(`DEMO_BOOTSTRAP_FORBIDDEN_IN_PRODUCTION: ${operation} is not permitted when NODE_ENV=production.`);
  }
}
