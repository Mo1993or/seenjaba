
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CartService } from '../services/cart.service';

@Component({
  standalone: true,
  selector: 'app-cart',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="admin-layout">

      <header class="site-header">
        <a class="brand" routerLink="/">
          <span class="brand-mark">s.</span>
          <span>
            seenjaba
            <small>LE MARCHÉ FRAIS</small>
          </span>
        </a>

        <a routerLink="/">← Continuer mes achats</a>
      </header>

      <main class="cart-page">

        <span class="eyebrow">VOTRE SÉLECTION</span>

        <h1>Mon panier</h1>

        @if (!cart.isEmpty()) {

          <div class="cart-heading">
            <span>
              {{ cart.count() }}
              article(s) dans votre panier
            </span>

            <button
              type="button"
              class="clear-cart"
              (click)="clearCart()">
              Vider le panier
            </button>
          </div>

          <div class="cart-content">

            <div class="cart-list">

              @for (line of cart.lines(); track line.product.id) {

                <div class="cart-row">

                  @if (line.product.image) {
                    <img
                      [src]="line.product.image"
                      [alt]="line.product.name">
                  } @else {
                    <div class="cart-image-placeholder">
                      🛍️
                    </div>
                  }

                  <div class="cart-product">
                    <b>{{ line.product.name }}</b>

                    <small>
                      {{ line.product.price | number:'1.0-0' }}
                      FCFA / {{ line.product.unit }}
                    </small>
                  </div>

                  <div class="quantity">

                    <button
                      type="button"
                      aria-label="Diminuer la quantité"
                      (click)="cart.change(
                        line.product.id,
                        line.quantity - 1
                      )">
                      −
                    </button>

                    <span>{{ line.quantity }}</span>

                    <button
                      type="button"
                      aria-label="Augmenter la quantité"
                      (click)="cart.change(
                        line.product.id,
                        line.quantity + 1
                      )">
                      +
                    </button>

                  </div>

                  <div class="cart-line-total">
                    <b>
                      {{
                        line.product.price * line.quantity
                          | number:'1.0-0'
                      }}
                      FCFA
                    </b>

                    <button
                      type="button"
                      class="remove-product"
                      (click)="cart.remove(line.product.id)">
                      Supprimer
                    </button>
                  </div>

                </div>

              }

            </div>

            <aside class="cart-total">

              <h2>Récapitulatif</h2>

              <div class="summary-line">
                <span>Articles</span>
                <span>{{ cart.count() }}</span>
              </div>

              <div class="summary-line">
                <span>Sous-total</span>
                <strong>
                  {{ cart.total() | number:'1.0-0' }} FCFA
                </strong>
              </div>

              <div class="summary-line">
                <span>Livraison</span>
                <span>À définir</span>
              </div>

              <div class="summary-divider"></div>

              <div class="summary-total">
                <span>Total provisoire</span>
                <strong>
                  {{ cart.total() | number:'1.0-0' }} FCFA
                </strong>
              </div>

              <a class="btn-primary" routerLink="/commande">
  Valider ma commande ↗
</a>

              <small>
                Le montant définitif sera confirmé avant
                l'enregistrement de votre commande.
              </small>

            </aside>

          </div>

        } @else {

          <div class="empty-state">

            <span>🧺</span>

            <h2>Votre panier attend ses premiers produits.</h2>

            <p>
              Découvrez nos produits frais et ajoutez-les
              à votre panier.
            </p>

            <a class="btn-primary" routerLink="/">
              Découvrir le marché
            </a>

          </div>

        }

      </main>

    </div>
  `
})
export class CartComponent {
  readonly cart = inject(CartService);

  clearCart(): void {
    const confirmed = window.confirm(
      'Voulez-vous vraiment vider votre panier ?'
    );

    if (confirmed) {
      this.cart.clear();
    }
  }

  checkout(): void {
    alert(
      'Nous allons maintenant configurer le parcours de commande.'
    );
  }
}
