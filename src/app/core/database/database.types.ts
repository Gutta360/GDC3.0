export interface QueryResult<T> { values?: T[] }
export interface ChangeResult { changes?: { changes?: number; lastId?: number } }
export interface SqliteStatement { statement: string; values?: unknown[] }
export type DatabaseState = 'initializing' | 'ready' | 'unsupported' | 'error';
