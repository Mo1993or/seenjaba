
import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { OrderStatus } from '../models/shop.models';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

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
  payment_method: 'cash_on_delivery' | 'wave' | 'orange_money' | 'card';
  payment_status: PaymentStatus;
  subtotal: number;
  delivery_fee: number;
  total: number;
  created_at: string;
  updated_at: string;
  order_items: AdminOrderItem[];
}

/**
 * Service utilisé par le checkout client.
 */
@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly supabase = inject(SupabaseService);

  async createCustomerOrder(
    input: CreateCustomerOrderInput
  ): Promise<CreatedOrder> {
    const { data, error } = await this.supabase.getClient().rpc(
      'create_customer_order',
      {
        p_customer_name: input.customerName,
        p_customer_phone: input.customerPhone,
        p_delivery_address: input.deliveryAddress,
        p_delivery_area: input.deliveryArea || null,
        p_delivery_note: input.deliveryNote || null,
        p_items: input.items.map(item => ({
          product_id: item.productId,
          quantity: item.quantity
        }))
      }
    );

    if (error) {
      console.error('Erreur création commande :', error);
      throw new Error(error.message);
    }

    if (!data || data.success !== true || !data.order_number) {
      throw new Error(
        'La commande n’a pas pu être confirmée.'
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
