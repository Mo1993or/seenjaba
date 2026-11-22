
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Product } from '../models/shop.models';
import { CartService } from '../services/cart.service';
import { CatalogService } from '../services/catalog.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="detail-layout">

      <header class="site-header">
        <a class="brand" routerLink="/">
          <span class="brand-mark">s.</span>
          <span>
            seenjaba
            <small>LE MARCHÉ FRAIS</small>
          </span>
        </a>

        <a class="back-link" routerLink="/">
          ← Retour au marché
        </a>
      </header>

      @if (isLoading()) {
        <main class="empty-state">
          <p>Chargement du produit...</p>
        </main>
      } @else if (product()) {

        <main class="detail-page">

          <div class="product-image">
            <img
              [src]="product()!.image"
              [alt]="product()!.name"
            />

            @if (product()!.badge) {
              <span class="product-badge">
                {{ product()!.badge }}
              </span>
            }
          </div>

          <section class="product-info">

            <span class="eyebrow">
              {{ product()!.category }}
            </span>

            <h1>{{ product()!.name }}</h1>

            <p class="description">
              {{ product()!.description }}
            </p>

            <div class="price-block">
              <strong>
                {{ product()!.price | number:'1.0-0' }} FCFA
              </strong>
              <span>/ {{ product()!.unit }}</span>
            </div>

            <div class="stock-info">
              @if (product()!.stock > 0) {
                <span class="stock-dot"></span>
                <span>Disponible</span>
              } @else {
                <span class="out-stock">
                  Stock non renseigné
                </span>
              }
            </div>

            <div class="separator"></div>

            <label class="quantity-label">Quantité</label>

            <div class="quantity-selector">
              <button
                type="button"
                (click)="decrease()"
                [disabled]="quantity() <= 1">
                −
              </button>

              <span>{{ quantity() }}</span>

              <button
                type="button"
                (click)="increase()">
                +
              </button>
            </div>

            <div class="total-line">
              <span>Total</span>
              <strong>
                {{ product()!.price * quantity() | number:'1.0-0' }}
                FCFA
              </strong>
            </div>

            <button
              type="button"
              class="btn-primary"
              (click)="add()">
              {{ productAdded() ? '✓ Ajouté au panier' : 'Ajouter au panier ↗' }}
            </button>

            @if (productAdded()) {
              <div class="success-message">
                ✓ {{ quantity() }} article(s) ajouté(s) au panier.
              </div>
            }

            <div class="delivery-info">
              <span>🛍️</span>
              <div>
                <strong>Commande simple et rapide</strong>
                <small>Payez à la livraison.</small>
              </div>
            </div>

          </section>
        </main>

      } @else {
        <main class="empty-state">
          <div class="empty-icon">🛒</div>
          <h2>Produit introuvable</h2>
          <p>{{ errorMessage() }}</p>
          <a class="btn-primary" routerLink="/">
            Retour à la boutique
          </a>
        </main>
      }

    </div>
  `,

  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: #faf9f6;
      color: #183d32;
    }

    * {
      box-sizing: border-box;
    }

    .site-header {
      height: 82px;
      padding: 0 7%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: white;
      border-bottom: 1px solid #eeeee9;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 11px;
      text-decoration: none;
      color: #183d32;
      font-size: 21px;
      font-weight: 800;
    }

    .brand-mark {
      width: 42px;
      height: 42px;
      display: grid;
      place-items: center;
      border-radius: 13px;
      background: #f56624;
      color: white;
      font-size: 25px;
    }

    .brand small {
      display: block;
      margin-top: 3px;
      font-size: 9px;
      letter-spacing: 2px;
    }

    .back-link {
      color: #52645b;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
    }

    .detail-page {
      width: min(1100px, 88%);
      margin: 65px auto;
      display: grid;
      grid-template-columns: 1.1fr .9fr;
      gap: 75px;
      align-items: center;
    }

    .product-image {
      position: relative;
      overflow: hidden;
      border-radius: 24px;
      background: #f0eee8;
      aspect-ratio: 1;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: cover;
    }

    .product-badge {
      position: absolute;
      top: 20px;
      left: 20px;
      padding: 9px 15px;
      background: #f56624;
      color: white;
      border-radius: 30px;
      font-size: 12px;
      font-weight: 700;
    }

    .eyebrow {
      display: inline-block;
      margin-bottom: 15px;
      color: #f56624;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }

    h1 {
      margin: 0 0 18px;
      font-size: clamp(30px, 4vw, 43px);
      line-height: 1.15;
    }

    .description {
      color: #778078;
      font-size: 15px;
      line-height: 1.8;
      margin-bottom: 25px;
    }

    .price-block {
      display: flex;
      align-items: baseline;
      gap: 9px;
      margin-bottom: 17px;
    }

    .price-block strong {
      font-size: 29px;
    }

    .price-block span {
      color: #89918a;
      font-size: 14px;
    }

    .stock-info {
      display: flex;
      align-items: center;
      gap: 9px;
      font-size: 13px;
      color: #587267;
    }

    .stock-dot {
      width: 8px;
      height: 8px;
      background: #28a46b;
      border-radius: 50%;
    }

    .out-stock {
      color: #b27b27;
      font-weight: 600;
    }

    .separator {
      height: 1px;
      background: #e9e9e2;
      margin: 28px 0;
    }

    .quantity-label {
      display: block;
      margin-bottom: 12px;
      font-size: 13px;
      font-weight: 700;
    }

    .quantity-selector {
      width: 145px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border: 1px solid #e4e6df;
      border-radius: 12px;
      background: white;
    }

    .quantity-selector button {
      width: 45px;
      height: 100%;
      border: none;
      background: transparent;
      color: #183d32;
      font-size: 22px;
      cursor: pointer;
    }

    .quantity-selector button:disabled {
      opacity: .3;
      cursor: not-allowed;
    }

    .quantity-selector span {
      font-weight: 700;
    }

    .total-line {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 25px 0 18px;
      font-size: 14px;
      color: #778078;
    }

    .total-line strong {
      color: #183d32;
      font-size: 20px;
    }

    .btn-primary {
      width: 100%;
      min-height: 54px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: 13px;
      background: #f56624;
      color: white;
      font-size: 14px;
      font-weight: 800;
      cursor: pointer;
      text-decoration: none;
    }

    .btn-primary:hover {
      background: #df5418;
    }

    .success-message {
      margin-top: 13px;
      padding: 12px;
      border-radius: 10px;
      background: #eaf6ef;
      color: #23764b;
      font-size: 13px;
    }

    .delivery-info {
      display: flex;
      align-items: center;
      gap: 13px;
      margin-top: 28px;
      padding: 17px;
      border: 1px solid #e9e9e2;
      border-radius: 13px;
      background: white;
    }

    .delivery-info > span {
      font-size: 23px;
    }

    .delivery-info strong,
    .delivery-info small {
      display: block;
    }

    .delivery-info strong {
      font-size: 13px;
      margin-bottom: 5px;
    }

    .delivery-info small {
      color: #89918a;
      font-size: 12px;
    }

    .empty-state {
      min-height: 65vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 30px;
    }

    .empty-icon {
      font-size: 45px;
    }

    .empty-state p {
      color: #778078;
      margin-bottom: 25px;
    }

    .empty-state .btn-primary {
      width: auto;
      padding: 0 25px;
    }

    @media (max-width: 768px) {
      .site-header {
        height: 70px;
        padding: 0 5%;
      }

      .brand {
        font-size: 18px;
      }

      .back-link {
        font-size: 12px;
      }

      .detail-page {
        width: 90%;
        margin: 25px auto 45px;
        grid-template-columns: 1fr;
        gap: 28px;
      }

      .product-image {
        aspect-ratio: 1 / .85;
        border-radius: 18px;
      }

      h1 {
        font-size: 30px;
      }

      .price-block strong {
        font-size: 25px;
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly cart = inject(CartService);
  private readonly catalogService = inject(CatalogService);

  readonly product = signal<Product | null>(null);
  readonly quantity = signal(1);
  readonly productAdded = signal(false);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    void this.loadProduct();
  }

  private async loadProduct(): Promise<void> {
    this.isLoading.set(true);

    const slug = this.route.snapshot.paramMap.get('slug');

    if (!slug) {
      this.errorMessage.set('Identifiant du produit manquant.');
      this.isLoading.set(false);
      return;
    }

    try {
      const products = await this.catalogService.getProducts();

      const foundProduct = products.find(
        item => item.slug === slug
      );

      this.product.set(foundProduct ?? null);

      if (!foundProduct) {
        this.errorMessage.set('Ce produit ne figure pas dans le catalogue.');
      }
    } catch (error) {
      console.error('Erreur chargement produit :', error);

      this.errorMessage.set(
        'Impossible de charger le produit depuis la boutique.'
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  increase(): void {
    this.quantity.update(value => value + 1);
    this.productAdded.set(false);
  }

  decrease(): void {
    if (this.quantity() > 1) {
      this.quantity.update(value => value - 1);
      this.productAdded.set(false);
    }
  }

  add(): void {
    const currentProduct = this.product();

    if (!currentProduct) return;

    for (let i = 0; i < this.quantity(); i++) {
      this.cart.add(currentProduct);
    }

    this.productAdded.set(true);
  }
}
