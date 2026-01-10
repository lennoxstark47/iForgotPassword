/**
 * Database migration script
 *
 * Run this script to initialize or update the database schema
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';
import { config } from '../../../config';
import logger from '../../../utils/logger';

async function runMigrations() {
  const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
    ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
  });

  try {
    logger.info('Starting database migration...');

    // Read the init.sql file
    const sqlPath = join(__dirname, 'init.sql');
    const sql = readFileSync(sqlPath, 'utf8');

    // Execute the SQL
    await pool.query(sql);

    logger.info('Database migration completed successfully!');
  } catch (error) {
    logger.error('Database migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      logger.info('Migration script finished');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration script failed:', error);
      process.exit(1);
    });
}

export { runMigrations };
