
import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { OrderStatus } from '../models/shop.models';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded';

export type StorePaymentMethod =
  | 'cash_on_delivery'
  | 'wave'
  | 'orange_money'
  | 'card';

export interface CreateCustomerOrderInput {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryArea?: string;
  deliveryNote?: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}

export interface CreateStoreOrderInput {
  customerName: string;
  customerPhone?: string;
  paymentMethod: StorePaymentMethod;
  paymentStatus: 'pending' | 'paid';
  items: {
    productId: string;
    quantity: number;
  }[];
}

export interface CreatedOrder {
  success: boolean;
  order_id: string;
  order_number: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
}

export interface AdminOrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  unit: string;
  unit_price: number;
  quantity: number;
  total: number;
  created_at: string;
}

export interface AdminOrder {
  id: string;
  order_number: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_area: string | null;
  delivery_note: string | null;
  status: OrderStatus;
  payment_method: StorePaymentMethod;
  payment_status: PaymentStatus;
  order_source: 'online' | 'store';
  subtotal: number;
  delivery_fee: number;
  total: number;
  created_at: string;
  updated_at: string;
  order_items: AdminOrderItem[];
}

/**
 * Service utilisé par le checkout client
 * et par la création des ventes en boutique.
 */
@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly supabase = inject(SupabaseService);

  /**
   * Création d'une commande depuis le checkout client.
   *
   * IMPORTANT :
   * Cette méthode conserve la fonction SQL existante
   * create_customer_order.
   */
  async createCustomerOrder(
    input: CreateCustomerOrderInput
  ): Promise<CreatedOrder> {
    const { data, error } = await this.supabase
      .getClient()
      .rpc('create_customer_order', {
        p_customer_name: input.customerName,
        p_customer_phone: input.customerPhone,
        p_delivery_address: input.deliveryAddress,
        p_delivery_area: input.deliveryArea || null,
        p_delivery_note: input.deliveryNote || null,
        p_items: input.items.map(item => ({
          product_id: item.productId,
          quantity: item.quantity
        }))
      });

    if (error) {
      console.error('Erreur création commande client :', error);
      throw new Error(error.message);
    }

    if (!data || data.success !== true || !data.order_number) {
      throw new Error(
        'La commande client n’a pas pu être confirmée.'
      );
    }

    return data as CreatedOrder;
  }

  /**
   * Création d'une vente directement depuis l'administration.
   *
   * Cette méthode utilise une fonction SQL distincte :
   * create_admin_store_order.
   *
   * Le stock est vérifié et déduit côté Supabase.
   */
  async createAdminStoreOrder(
    input: CreateStoreOrderInput
  ): Promise<CreatedOrder> {
    if (!input.customerName.trim()) {
      throw new Error('Le nom du client est obligatoire.');
    }

    if (!input.items.length) {
      throw new Error('Ajoute au moins un produit à la commande.');
    }

    const { data, error } = await this.supabase
      .getClient()
      .rpc('create_admin_store_order', {
        p_customer_name: input.customerName.trim(),
        p_customer_phone: input.customerPhone?.trim() || null,
        p_items: input.items.map(item => ({
          product_id: item.productId,
          quantity: item.quantity
        })),
        p_payment_method: input.paymentMethod,
        p_payment_status: input.paymentStatus
      });

    if (error) {
      console.error('Erreur création vente boutique :', error);
      throw new Error(error.message);
    }

    if (!data || data.success !== true || !data.order_number) {
      throw new Error(
        'La vente boutique n’a pas pu être enregistrée.'
      );
    }

    return data as CreatedOrder;
  }
}

/**
 * Service utilisé par le tableau de bord administrateur.
 */
@Injectable({
  providedIn: 'root'
})
export class OrderAdminService {
  private readonly supabase = inject(SupabaseService);

  async getAllOrders(): Promise<AdminOrder[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur chargement commandes :', error);
      throw new Error(error.message);
    }

    return (data ?? []).map((order: any) => ({
      ...order,
      order_source: order.order_source ?? 'online',
      subtotal: Number(order.subtotal),
      delivery_fee: Number(order.delivery_fee),
      total: Number(order.total),
      order_items: (order.order_items ?? []).map((item: any) => ({
        ...item,
        unit_price: Number(item.unit_price),
        quantity: Number(item.quantity),
        total: Number(item.total)
      }))
    })) as AdminOrder[];
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus
  ): Promise<void> {
    const { error } = await this.supabase
      .getClient()
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) {
      console.error('Erreur mise à jour commande :', error);
      throw new Error(error.message);
    }
  }
}
