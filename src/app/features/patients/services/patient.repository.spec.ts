import { describe, expect, it, vi } from 'vitest';
import type { DatabaseService } from '../../../core/database/database.service';
import type { PatientRequest } from '../models/patient.model';
import { PatientRepository } from './patient.repository';

describe('PatientRepository', () => {
  const input: PatientRequest = {
    firstName: 'Anu', lastName: 'Rao', gender: 'FEMALE', age: 32, mobile: '9876543210',
    address: 'Bengaluru', referredBy: 'SELF', doctorName: null, consultationFee: 500,
    registrationDate: '2026-10-29T06:30:00.000Z'
  };

  it('writes sequence, patient, and GDB-compatible outbox in one transaction batch', async () => {
    const connection = { query: vi.fn().mockResolvedValueOnce({ values: [{ next_number: 7 }] }).mockResolvedValueOnce({ values: [{ id: 'saved' }] }) };
    const executeBatch = vi.fn().mockResolvedValue({ changes: { changes: 3 } });
    const database = { requireConnection: () => connection, executeBatch } as unknown as DatabaseService;
    const created = await new PatientRepository(database).create(input);
    expect(created.patientNumber).toBe('P-00007');
    expect(executeBatch).toHaveBeenCalledOnce();
    const statements = executeBatch.mock.calls[0][0] as Array<{ statement: string }>;
    expect(statements).toHaveLength(3);
    expect(statements.some(value => value.statement.includes('INSERT INTO patients'))).toBe(true);
    expect(statements.some(value => value.statement.includes('base_version'))).toBe(true);
    expect(statements.some(value => value.statement.includes('INSERT INTO sync_outbox'))).toBe(true);
  });

  it('does not create a new version or outbox event for an unchanged update', async () => {
    const row = { id: 'id-1', patient_number: 'P-00001', first_name: 'Anu', last_name: 'Rao', gender: 'FEMALE', age: 32,
      mobile: '9876543210', address: 'Bengaluru', referred_by: 'SELF', doctor_name: null, consultation_fee_cents: 50000,
      registration_date: input.registrationDate, is_active: 1, created_at: input.registrationDate, updated_at: input.registrationDate,
      deleted_at: null, record_version: 3 };
    const connection = { query: vi.fn().mockResolvedValue({ values: [row] }) };
    const executeBatch = vi.fn();
    const database = { requireConnection: () => connection, executeBatch } as unknown as DatabaseService;
    const result = await new PatientRepository(database).update('P-00001', input);
    expect(result.recordVersion).toBe(3);
    expect(executeBatch).not.toHaveBeenCalled();
  });
});
