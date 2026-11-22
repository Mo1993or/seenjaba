
import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  unit: string;
  categoryId: string;
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;
  images: File[];
}

export interface UpdateProductInput extends CreateProductInput {
  productId: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductAdminService {
  private readonly supabase = inject(SupabaseService);

  private readonly bucketName = 'product-images';

  // =====================================================
  // CRÉATION D'UN PRODUIT
  // =====================================================

  async createProduct(input: CreateProductInput): Promise<void> {
    const client = this.supabase.getClient();

    this.validateProduct(input);

    const name = input.name.trim();
    const slug = this.generateSlug(name);

    const { data: product, error: productError } = await client
      .from('products')
      .insert({
        name,
        slug,
        description: input.description.trim(),
        price: input.price,
        unit: input.unit,
        category_id: input.categoryId,
        is_active: input.isActive
      })
      .select('id')
      .single();

    if (productError) throw productError;

    const uploadedPaths: string[] = [];

    try {
      const { error: inventoryError } = await client
        .from('inventory')
        .insert({
          product_id: product.id,
          quantity: input.stock,
          low_stock_threshold: input.lowStockThreshold
        });

      if (inventoryError) throw inventoryError;

      const imageRows = await this.uploadImages(
        product.id,
        input.images,
        uploadedPaths
      );

      if (imageRows.length > 0) {
        const { error: imagesError } = await client
          .from('product_images')
          .insert(imageRows);

        if (imagesError) throw imagesError;
      }
    } catch (error) {
      if (uploadedPaths.length > 0) {
        await client.storage
          .from(this.bucketName)
          .remove(uploadedPaths);
      }

      await client
        .from('products')
        .delete()
        .eq('id', product.id);

      throw error;
    }
  }

  // =====================================================
  // MODIFICATION D'UN PRODUIT
  // =====================================================

  async updateProduct(input: UpdateProductInput): Promise<void> {
    const client = this.supabase.getClient();

    this.validateProduct(input);

    const name = input.name.trim();

    const { error: productError } = await client
      .from('products')
      .update({
        name,
        description: input.description.trim(),
        price: input.price,
        unit: input.unit,
        category_id: input.categoryId,
        is_active: input.isActive
      })
      .eq('id', input.productId);

    if (productError) throw productError;

    // La table inventory utilise product_id comme identifiant.
    const { data: inventory, error: inventoryReadError } = await client
      .from('inventory')
      .select('product_id')
      .eq('product_id', input.productId)
      .maybeSingle();

    if (inventoryReadError) throw inventoryReadError;

    if (inventory) {
      const { error: inventoryError } = await client
        .from('inventory')
        .update({
          quantity: input.stock,
          low_stock_threshold: input.lowStockThreshold
        })
        .eq('product_id', input.productId);

      if (inventoryError) throw inventoryError;
    } else {
      const { error: inventoryError } = await client
        .from('inventory')
        .insert({
          product_id: input.productId,
          quantity: input.stock,
          low_stock_threshold: input.lowStockThreshold
        });

      if (inventoryError) throw inventoryError;
    }

    // Ajout des nouvelles photos sans supprimer les anciennes.
    const uploadedPaths: string[] = [];

    try {
      const imageRows = await this.uploadImages(
        input.productId,
        input.images,
        uploadedPaths
      );

      if (imageRows.length > 0) {
        const { error: imagesError } = await client
          .from('product_images')
          .insert(imageRows);

        if (imagesError) throw imagesError;
      }
    } catch (error) {
      if (uploadedPaths.length > 0) {
        await client.storage
          .from(this.bucketName)
          .remove(uploadedPaths);
      }

      throw error;
    }
  }

  // =====================================================
  // ACTIVER / DÉSACTIVER UN PRODUIT
  // =====================================================

  async setProductActive(
    productId: string,
    isActive: boolean
  ): Promise<void> {
    const { error } = await this.supabase
      .getClient()
      .from('products')
      .update({ is_active: isActive })
      .eq('id', productId);

    if (error) throw error;
  }

  // =====================================================
  // SUPPRESSION D'UN PRODUIT
  // =====================================================

  async deleteProduct(productId: string): Promise<void> {
    const client = this.supabase.getClient();

    const { data: images, error: imagesError } = await client
      .from('product_images')
      .select('image_url')
      .eq('product_id', productId);

    if (imagesError) throw imagesError;

    const storagePaths = (images ?? [])
      .map(image => this.getStoragePath(image.image_url))
      .filter((path): path is string => path !== null);

    if (storagePaths.length > 0) {
      const { error: storageError } = await client.storage
        .from(this.bucketName)
        .remove(storagePaths);

      if (storageError) throw storageError;
    }

    const { error: deleteImagesError } = await client
      .from('product_images')
      .delete()
      .eq('product_id', productId);

    if (deleteImagesError) throw deleteImagesError;

    const { error: deleteInventoryError } = await client
      .from('inventory')
      .delete()
      .eq('product_id', productId);

    if (deleteInventoryError) throw deleteInventoryError;

    const { error: deleteProductError } = await client
      .from('products')
      .delete()
      .eq('id', productId);

    if (deleteProductError) throw deleteProductError;
  }

  // =====================================================
  // UPLOAD DES IMAGES
  // =====================================================

  private async uploadImages(
    productId: string,
    files: File[],
    uploadedPaths: string[]
  ): Promise<{
    product_id: string;
    image_url: string;
    sort_order: number;
  }[]> {
    const client = this.supabase.getClient();

    files.forEach(file => this.validateImage(file));

    const { data: existingImages, error: existingError } = await client
      .from('product_images')
      .select('sort_order')
      .eq('product_id', productId);

    if (existingError) throw existingError;

    let nextOrder = (existingImages ?? []).reduce(
      (max, image) => Math.max(max, image.sort_order),
      -1
    ) + 1;

    const imageRows: {
      product_id: string;
      image_url: string;
      sort_order: number;
    }[] = [];

    for (const file of files) {
      const extension = file.name.split('.').pop() || 'jpg';

      const filePath =
        `products/${productId}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await client.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      uploadedPaths.push(filePath);

      const { data: publicUrl } = client.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      imageRows.push({
        product_id: productId,
        image_url: publicUrl.publicUrl,
        sort_order: nextOrder++
      });
    }

    return imageRows;
  }

  // =====================================================
  // VALIDATIONS
  // =====================================================

  private validateProduct(input: CreateProductInput): void {
    if (!input.name.trim()) {
      throw new Error('Le nom du produit est obligatoire.');
    }

    if (!Number.isFinite(input.price) || input.price <= 0) {
      throw new Error('Le prix doit être supérieur à zéro.');
    }

    if (!input.categoryId) {
      throw new Error('Veuillez sélectionner une catégorie.');
    }

    if (
      !Number.isFinite(input.stock) ||
      !Number.isFinite(input.lowStockThreshold) ||
      input.stock < 0 ||
      input.lowStockThreshold < 0
    ) {
      throw new Error('Les quantités ne peuvent pas être négatives.');
    }

    input.images.forEach(file => this.validateImage(file));
  }

  private validateImage(file: File): void {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        `Format non autorisé pour l'image ${file.name}. Utilisez JPG, PNG ou WEBP.`
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error(
        `L'image ${file.name} dépasse la limite de 5 Mo.`
      );
    }
  }

  // =====================================================
  // UTILITAIRES
  // =====================================================

  private getStoragePath(url: string): string | null {
    const marker = `/object/public/${this.bucketName}/`;
    const index = url.indexOf(marker);

    if (index === -1) return null;

    return decodeURIComponent(
      url.substring(index + marker.length)
    );
  }

  private generateSlug(value: string): string {
    const normalized = value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return `${normalized}-${Date.now()}`;
  }
}
