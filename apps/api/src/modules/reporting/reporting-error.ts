export class ReportingError extends Error {
  constructor(public readonly code: string, public readonly status: number, message: string) {
    super(message);
    this.name = 'ReportingError';
  }
}

export function reportingIntegrity(message = 'Authoritative workflow records are inconsistent or malformed.'): never {
  throw new ReportingError('REPORTING_DATA_INTEGRITY_ERROR', 409, message);
}
