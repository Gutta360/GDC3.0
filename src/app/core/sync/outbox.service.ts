import { Injectable, signal } from '@angular/core';
import { DatabaseService } from '../database/database.service';

@Injectable({ providedIn: 'root' })
export class OutboxService {
  readonly pendingCount = signal(0);
  constructor(private readonly database: DatabaseService) {}

  async refresh(): Promise<number> {
    const result = await this.database.requireConnection().query("SELECT COUNT(*) AS count FROM sync_outbox WHERE sync_status <> 'ACKNOWLEDGED'") as { values?: { count: number }[] };
    const count = Number(result.values?.[0]?.count ?? 0);
    this.pendingCount.set(count);
    return count;
  }
}
