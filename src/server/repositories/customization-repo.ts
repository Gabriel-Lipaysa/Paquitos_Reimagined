import { query } from '../db';
import { Customization } from '../db/schema';
import { ensureDatabaseSchema } from '../db/auto-migrate';

export class CustomizationRepository {
  static async getAll(): Promise<Customization[]> {
    await ensureDatabaseSchema();
    try {
      return await query<Customization[]>('SELECT * FROM customization ORDER BY cusPrice ASC');
    } catch (err) {
      console.warn('Fallback customization query:', err);
      return [
        { cusID: 1, cusName: 'Extra Mozzarella', cusPrice: 45, cusImage: 'cheese.png' },
        { cusID: 2, cusName: 'Crispy Bacon', cusPrice: 55, cusImage: 'bacon.png' },
        { cusID: 3, cusName: 'Sliced Pepperoni', cusPrice: 50, cusImage: 'pepperoni.png' },
      ];
    }
  }

  static async findById(id: number): Promise<Customization | null> {
    await ensureDatabaseSchema();
    try {
      const rows = await query<Customization[]>('SELECT * FROM customization WHERE cusID = ? LIMIT 1', [id]);
      return rows[0] || null;
    } catch (err) {
      return null;
    }
  }

  static async create(data: { cusName: string; cusPrice: number; cusImage?: string }): Promise<number> {
    await ensureDatabaseSchema();
    const result: any = await query(
      'INSERT INTO customization (cusName, cusPrice, cusImage) VALUES (?, ?, ?)',
      [data.cusName, data.cusPrice, data.cusImage || '']
    );
    return result.insertId;
  }

  static async update(
    id: number,
    data: { cusName: string; cusPrice: number; cusImage?: string }
  ): Promise<boolean> {
    await ensureDatabaseSchema();
    if (data.cusImage) {
      const result: any = await query(
        'UPDATE customization SET cusName = ?, cusPrice = ?, cusImage = ? WHERE cusID = ?',
        [data.cusName, data.cusPrice, data.cusImage, id]
      );
      return result.affectedRows > 0;
    } else {
      const result: any = await query(
        'UPDATE customization SET cusName = ?, cusPrice = ? WHERE cusID = ?',
        [data.cusName, data.cusPrice, id]
      );
      return result.affectedRows > 0;
    }
  }

  static async delete(id: number): Promise<boolean> {
    await ensureDatabaseSchema();
    const result: any = await query('DELETE FROM customization WHERE cusID = ?', [id]);
    return result.affectedRows > 0;
  }
}
