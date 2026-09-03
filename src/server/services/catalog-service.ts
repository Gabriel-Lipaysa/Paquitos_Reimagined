import { SizeRepository } from '../repositories/size-repo';
import { CustomizationRepository } from '../repositories/customization-repo';
import { Size, Customization } from '../db/schema';

export class CatalogService {
  static async getAllSizes(): Promise<Size[]> {
    return SizeRepository.getAll();
  }

  static async createSize(sizename: string, sizeprice: number): Promise<{ success: boolean; message: string; sizeID?: number }> {
    const sizeID = await SizeRepository.create(sizename, sizeprice);
    return { success: true, message: 'Size option added successfully', sizeID };
  }

  static async updateSize(id: number, sizename: string, sizeprice: number): Promise<{ success: boolean; message: string }> {
    const updated = await SizeRepository.update(id, sizename, sizeprice);
    if (updated) return { success: true, message: 'Size option updated successfully' };
    return { success: false, message: 'Size not found' };
  }

  static async deleteSize(id: number): Promise<{ success: boolean; message: string }> {
    const deleted = await SizeRepository.delete(id);
    if (deleted) return { success: true, message: 'Size option deleted' };
    return { success: false, message: 'Size not found' };
  }

  static async getAllCustomizations(): Promise<Customization[]> {
    return CustomizationRepository.getAll();
  }

  static async createCustomization(data: {
    cusName: string;
    cusPrice: number;
    cusImage?: string;
  }): Promise<{ success: boolean; message: string; cusID?: number }> {
    const cusID = await CustomizationRepository.create(data);
    return { success: true, message: 'Customization topping added successfully', cusID };
  }

  static async updateCustomization(
    id: number,
    data: { cusName: string; cusPrice: number; cusImage?: string }
  ): Promise<{ success: boolean; message: string }> {
    const updated = await CustomizationRepository.update(id, data);
    if (updated) return { success: true, message: 'Customization topping updated' };
    return { success: false, message: 'Customization not found' };
  }

  static async deleteCustomization(id: number): Promise<{ success: boolean; message: string }> {
    const deleted = await CustomizationRepository.delete(id);
    if (deleted) return { success: true, message: 'Customization topping deleted' };
    return { success: false, message: 'Customization not found' };
  }
}

