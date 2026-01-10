/**
 * Database service
 *
 * Provides a singleton instance of the database adapter
 */

import { DatabaseAdapter, PostgreSQLAdapter } from './adapters';
import { config } from '../../config';
import logger from '../../utils/logger';

let dbInstance: DatabaseAdapter | null = null;

/**
 * Initializes the database connection
 */
export async function initDatabase(): Promise<DatabaseAdapter> {
  if (dbInstance) {
    return dbInstance;
  }

  // Currently only PostgreSQL is implemented
  // In the future, this can be extended to support other databases
  const dbType = config.database.type.toLowerCase();

  switch (dbType) {
    case 'postgresql':
    case 'postgres':
      dbInstance = new PostgreSQLAdapter();
      break;

    default:
      throw new Error(`Unsupported database type: ${dbType}`);
  }

  await dbInstance.connect();
  logger.info(`Database initialized: ${dbType}`);

  return dbInstance;
}

/**
 * Gets the database instance
 */
export function getDatabase(): DatabaseAdapter {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }

  return dbInstance;
}

/**
 * Closes the database connection
 */
export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.disconnect();
    dbInstance = null;
    logger.info('Database connection closed');
  }
}
