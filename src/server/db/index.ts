import mysql from 'mysql2/promise';
import { env } from '../env';

const isRemoteHost = env.db.host !== '127.0.0.1' && env.db.host !== 'localhost' && env.db.host !== 'mysql';

const globalForDb = globalThis as unknown as {
  __mysqlPool?: mysql.Pool;
};

export const pool = globalForDb.__mysqlPool ?? mysql.createPool({
  host: env.db.host,
  user: env.db.user,
  password: env.db.password,
  database: env.db.name,
  port: env.db.port,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  queueLimit: 0,
  ssl: isRemoteHost ? { rejectUnauthorized: false } : undefined,
});

if (process.env.NODE_ENV !== 'production' || !globalForDb.__mysqlPool) {
  globalForDb.__mysqlPool = pool;
}

export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  const [rows] = await pool.execute(sql, params);
  return rows as T;
}

export async function withTransaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export default pool;
