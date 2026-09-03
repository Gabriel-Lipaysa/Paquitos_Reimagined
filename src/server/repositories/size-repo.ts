import { query } from '../db';
import { Size } from '../db/schema';
import { ensureDatabaseSchema } from '../db/auto-migrate';

export class SizeRepository {
  static async getAll(): Promise<Size[]> {
    await ensureDatabaseSchema();
    try {
      return await query<Size[]>('SELECT * FROM size ORDER BY sizeprice ASC');
    } catch (err) {
      console.warn('Fallback size query:', err);
      return [
        { sizeID: 1, sizename: 'Solo (10")', sizeprice: 0 },
        { sizeID: 2, sizename: 'Medium (12")', sizeprice: 80 },
        { sizeID: 3, sizename: 'Family (14")', sizeprice: 150 },
      ];
    }
  }

  static async findById(id: number): Promise<Size | null> {
    await ensureDatabaseSchema();
    try {
      const rows = await query<Size[]>('SELECT * FROM size WHERE sizeID = ? LIMIT 1', [id]);
      return rows[0] || null;
    } catch (err) {
      return null;
    }
  }

  static async create(sizename: string, sizeprice: number): Promise<number> {
    await ensureDatabaseSchema();
    const result: any = await query('INSERT INTO size (sizename, sizeprice) VALUES (?, ?)', [
      sizename,
      sizeprice,
    ]);
    return result.insertId;
  }

  static async update(id: number, sizename: string, sizeprice: number): Promise<boolean> {
    await ensureDatabaseSchema();
    const result: any = await query('UPDATE size SET sizename = ?, sizeprice = ? WHERE sizeID = ?', [
      sizename,
      sizeprice,
      id,
    ]);
    return result.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    await ensureDatabaseSchema();
    const result: any = await query('DELETE FROM size WHERE sizeID = ?', [id]);
    return result.affectedRows > 0;
  }
}
