export type OutboxOperation = 'CREATE' | 'UPDATE' | 'DELETE';
export type OutboxStatus = 'PENDING' | 'IN_FLIGHT' | 'ACKNOWLEDGED' | 'FAILED';

export interface OutboxEvent {
  eventId: string; contractVersion: 1; applicationCode: 'GDC'; entityType: 'PATIENT'; entityId: string;
  operation: OutboxOperation; baseVersion: number; entityVersion: number; payloadVersion: 1;
  payload: string; createdAt: string; status: OutboxStatus;
}
