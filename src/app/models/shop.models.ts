export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'shipped' | 'delivered' | 'cancelled';
export interface Category { id: string; name: string; slug: string; icon: string; }
export interface Product {
  id: string; name: string; slug: string; description: string; price: number;
  unit: string; category: string; image: string; badge?: string; stock: number;
}
export interface CartLine { product: Product; quantity: number; }
export interface OrderSummary { id: string; customer: string; date: string; total: number; status: OrderStatus; items: number; }
