
import { Injectable, signal, computed } from '@angular/core';
import { CartLine, Product } from '../models/shop.models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly storageKey = 'seenjaba_cart';

  private readonly linesState = signal<CartLine[]>(this.loadCart());

  readonly lines = this.linesState.asReadonly();

  readonly count = computed(() =>
    this.linesState().reduce(
      (sum, line) => sum + line.quantity,
      0
    )
  );

  readonly total = computed(() =>
    this.linesState().reduce(
      (sum, line) => sum + line.product.price * line.quantity,
      0
    )
  );

  readonly isEmpty = computed(() => this.linesState().length === 0);

  private loadCart(): CartLine[] {
    try {
      if (typeof localStorage === 'undefined') {
        return [];
      }

      const stored = localStorage.getItem(this.storageKey);

      if (!stored) return [];

      const parsed = JSON.parse(stored);

      if (!Array.isArray(parsed)) return [];

      return parsed.filter((line: any) =>
        line &&
        line.product &&
        typeof line.product.id === 'string' &&
        Number.isFinite(line.quantity) &&
        line.quantity > 0
      );
    } catch (error) {
      console.error('Impossible de récupérer le panier :', error);
      return [];
    }
  }

  private persist(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(
          this.storageKey,
          JSON.stringify(this.linesState())
        );
      }
    } catch (error) {
      console.error('Impossible de sauvegarder le panier :', error);
    }
  }

  add(product: Product): void {
    this.linesState.update(lines => {
      const existing = lines.find(
        line => line.product.id === product.id
      );

      if (existing) {
        return lines.map(line =>
          line.product.id === product.id
            ? {
                ...line,
                product,
                quantity: line.quantity + 1
              }
            : line
        );
      }

      return [
        ...lines,
        {
          product,
          quantity: 1
        }
      ];
    });

    this.persist();
  }

  change(productId: string, quantity: number): void {
    const newQuantity = Math.floor(quantity);

    this.linesState.update(lines => {
      if (newQuantity <= 0) {
        return lines.filter(
          line => line.product.id !== productId
        );
      }

      return lines.map(line =>
        line.product.id === productId
          ? { ...line, quantity: newQuantity }
          : line
      );
    });

    this.persist();
  }

  remove(productId: string): void {
    this.linesState.update(lines =>
      lines.filter(line => line.product.id !== productId)
    );

    this.persist();
  }

  clear(): void {
    this.linesState.set([]);
    this.persist();
  }
}
