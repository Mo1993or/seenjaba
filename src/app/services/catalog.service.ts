
import { Injectable } from '@angular/core';
import { Category, Product } from '../models/shop.models';
import { SupabaseService } from './supabase.service';

export interface CreateCategoryInput {
  name: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryInput extends CreateCategoryInput {
  categoryId: string;
}

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active?: boolean;
}

interface ProductImageRow {
  image_url: string;
  sort_order: number;
}

interface InventoryRow {
  quantity: number;
}

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  unit: string;
  category_id: string | null;
  is_active: boolean;
  categories: { name: string } | { name: string }[] | null;
  product_images: ProductImageRow[] | null;
  inventory: InventoryRow | InventoryRow[] | null;
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  constructor(private readonly supabase: SupabaseService) {}

  private getCategoryIcon(slug: string): string {
    const icons: Record<string, string> = {
      legumes: '🥬',
      poissons: '🐟',
      fruits: '🍊',
      viandes: '🍗',
      cereales: '🌾',
      epicerie: '🛒',
      'produits-laitiers': '🥛',
      boissons: '🥤'
    };

    return icons[slug] ?? '🛍️';
  }

  private createSlug(name: string): string {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private mapCategory(row: CategoryRow): Category {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      icon: this.getCategoryIcon(row.slug)
    };
  }

  // Catégories actives : utilisées dans la boutique et les formulaires produits.
  async getCategories(): Promise<Category[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from('categories')
      .select('id, name, slug, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return (data ?? []).map((row) =>
      this.mapCategory(row as CategoryRow)
    );
  }

  // Toutes les catégories : utilisées dans l'administration.
  async getAllCategories(): Promise<Category[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from('categories')
      .select('id, name, slug, sort_order')
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return (data ?? []).map((row) =>
      this.mapCategory(row as CategoryRow)
    );
  }

  // Création d'une catégorie.
  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const name = input.name.trim();

    if (!name) {
      throw new Error('Le nom de la catégorie est obligatoire.');
    }

    const slug = this.createSlug(name);

    if (!slug) {
      throw new Error('Le nom de la catégorie est invalide.');
    }

    const { data, error } = await this.supabase
      .getClient()
      .from('categories')
      .insert({
        name,
        slug,
        sort_order: input.sortOrder ?? 0,
        is_active: input.isActive ?? true
      })
      .select('id, name, slug, sort_order')
      .single();

    if (error) throw error;

    return this.mapCategory(data as CategoryRow);
  }

  // Modification d'une catégorie.
  async updateCategory(input: UpdateCategoryInput): Promise<Category> {
    const name = input.name.trim();

    if (!name) {
      throw new Error('Le nom de la catégorie est obligatoire.');
    }

    const slug = this.createSlug(name);

    if (!slug) {
      throw new Error('Le nom de la catégorie est invalide.');
    }

    const { data, error } = await this.supabase
      .getClient()
      .from('categories')
      .update({
        name,
        slug,
        sort_order: input.sortOrder ?? 0,
        is_active: input.isActive ?? true
      })
      .eq('id', input.categoryId)
      .select('id, name, slug, sort_order')
      .single();

    if (error) throw error;

    return this.mapCategory(data as CategoryRow);
  }

  // Activation / désactivation.
  async setCategoryActive(
    categoryId: string,
    isActive: boolean
  ): Promise<void> {
    const { error } = await this.supabase
      .getClient()
      .from('categories')
      .update({ is_active: isActive })
      .eq('id', categoryId);

    if (error) throw error;
  }

  // Suppression définitive.
  // Supabase refusera la suppression si des produits utilisent encore
  // cette catégorie et que la contrainte de clé étrangère l'empêche.
  async deleteCategory(categoryId: string): Promise<void> {
    const { error } = await this.supabase
      .getClient()
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) throw error;
  }

  // Catalogue public : uniquement les produits actifs.
  async getProducts(): Promise<Product[]> {
    return this.fetchProducts(true);
  }

  // Catalogue administration : produits actifs et désactivés.
  async getAllProducts(): Promise<Product[]> {
    return this.fetchProducts(false);
  }

  private async fetchProducts(
    activeOnly: boolean
  ): Promise<Product[]> {
    let query = this.supabase
      .getClient()
      .from('products')
      .select(`
        id,
        name,
        slug,
        description,
        price,
        unit,
        category_id,
        is_active,
        categories(name),
        product_images(image_url, sort_order),
        inventory(quantity)
      `);

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data ?? []).map((row) => {
      const product = row as unknown as ProductRow;

      const images = [...(product.product_images ?? [])].sort(
        (a, b) => a.sort_order - b.sort_order
      );

      const category = Array.isArray(product.categories)
        ? product.categories[0]
        : product.categories;

      const inventory = Array.isArray(product.inventory)
        ? product.inventory[0]
        : product.inventory;

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description ?? '',
        price: Number(product.price),
        unit: product.unit,
        category: category?.name ?? 'Autres',
        image: images[0]?.image_url ?? '',
        badge: undefined,
        stock: Number(inventory?.quantity ?? 0),
        isActive: product.is_active
      } as Product;
    });
  }
}
