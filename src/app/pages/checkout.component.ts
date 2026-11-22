
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { CartService } from '../services/cart.service';
import { OrderService, CreatedOrder } from '../services/order.service';

@Component({
  standalone: true,
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="checkout-layout">

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

      <main class="checkout-page">

        @if (successOrder()) {

          <div class="success-card">
            <div class="success-icon">✓</div>

            <span class="eyebrow">COMMANDE ENREGISTRÉE</span>

            <h1>Merci pour votre commande !</h1>

            <p>
              Votre commande a bien été enregistrée.
              Notre équipe pourra maintenant la traiter.
            </p>

            <div class="order-number">
              <small>Votre numéro de commande</small>
              <strong>{{ successOrder()?.order_number }}</strong>
            </div>

            <div class="success-total">
              Total :
              <strong>
                {{ successOrder()?.total | number:'1.0-0' }} FCFA
              </strong>
            </div>

            <p class="payment-reminder">
              Paiement à la livraison.
            </p>

            <a class="btn-primary" routerLink="/">
              Retour à l'accueil
            </a>
          </div>

        } @else {

          <span class="eyebrow">DERNIÈRE ÉTAPE</span>
          <h1>Finaliser ma commande</h1>

          <p class="checkout-intro">
            Renseignez vos coordonnées pour recevoir votre commande.
            Aucun compte client n'est nécessaire.
          </p>

          @if (cart.isEmpty()) {

            <div class="empty-state">
              <span>🧺</span>
              <h2>Votre panier est vide</h2>
              <a class="btn-primary" routerLink="/">
                Découvrir le marché
              </a>
            </div>

          } @else {

            <div class="checkout-grid">

              <section class="checkout-form-card">

                <h2>Vos coordonnées</h2>

                <p class="section-description">
                  Ces informations nous permettront de vous livrer.
                </p>

                @if (error()) {
                  <div class="form-error">
                    {{ error() }}
                  </div>
                }

                <form (ngSubmit)="submit()">

                  <div class="form-group">
                    <label for="customer-name">Nom complet *</label>
                    <input
                      id="customer-name"
                      name="customerName"
                      type="text"
                      [(ngModel)]="form.customerName"
                      placeholder="Ex : Amadou Ndiaye"
                      autocomplete="name"
                      required>
                  </div>

                  <div class="form-group">
                    <label for="customer-phone">Téléphone *</label>
                    <input
                      id="customer-phone"
                      name="customerPhone"
                      type="tel"
                      [(ngModel)]="form.customerPhone"
                      placeholder="Ex : 77 123 45 67"
                      autocomplete="tel"
                      required>
                  </div>

                  <div class="form-group">
                    <label for="delivery-area">Quartier / Zone</label>
                    <input
                      id="delivery-area"
                      name="deliveryArea"
                      type="text"
                      [(ngModel)]="form.deliveryArea"
                      placeholder="Ex : Liberté 6">
                  </div>

                  <div class="form-group">
                    <label for="customer-address">
                      Adresse de livraison *
                    </label>
                    <textarea
                      id="customer-address"
                      name="customerAddress"
                      [(ngModel)]="form.customerAddress"
                      rows="3"
                      placeholder="Rue, numéro, repère..."
                      autocomplete="street-address"
                      required>
                    </textarea>
                  </div>

                  <div class="form-group">
                    <label for="customer-note">
                      Instructions complémentaires
                    </label>
                    <textarea
                      id="customer-note"
                      name="customerNote"
                      [(ngModel)]="form.customerNote"
                      rows="2"
                      placeholder="Précisions pour retrouver votre adresse...">
                    </textarea>
                  </div>

                  <div class="payment-section">
                    <h3>Mode de paiement</h3>

                    <label class="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash_on_delivery"
                        [(ngModel)]="form.paymentMethod">

                      <span>
                        <b>Paiement à la livraison</b>
                        <small>
                          Vous payez à la réception de votre commande.
                        </small>
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    class="btn-primary submit-button"
                    [disabled]="submitting()">

                    {{ submitting()
                      ? 'Enregistrement de la commande...'
                      : 'Confirmer ma commande ↗' }}

                  </button>

                  <small class="secure-note">
                    Le prix et la disponibilité des produits
                    seront vérifiés au moment de la commande.
                  </small>

                </form>
              </section>

              <aside class="checkout-summary">

                <h2>Votre commande</h2>

                @for (line of cart.lines(); track line.product.id) {

                  <div class="summary-product">

                    @if (line.product.image) {
                      <img
                        [src]="line.product.image"
                        [alt]="line.product.name">
                    } @else {
                      <div class="summary-placeholder">🛍️</div>
                    }

                    <div class="summary-product-info">
                      <b>{{ line.product.name }}</b>
                      <small>
                        {{ line.quantity }} ×
                        {{ line.product.price | number:'1.0-0' }} FCFA
                      </small>
                    </div>

                    <strong>
                      {{
                        line.product.price * line.quantity
                          | number:'1.0-0'
                      }} F
                    </strong>

                  </div>
                }

                <div class="summary-divider"></div>

                <div class="summary-line">
                  <span>Nombre d'articles</span>
                  <strong>{{ cart.count() }}</strong>
                </div>

                <div class="summary-line">
                  <span>Sous-total estimé</span>
                  <strong>
                    {{ cart.total() | number:'1.0-0' }} FCFA
                  </strong>
                </div>

                <div class="summary-line">
                  <span>Livraison</span>
                  <span>À confirmer</span>
                </div>

                <div class="summary-divider"></div>

                <div class="summary-total">
                  <span>Total estimé</span>
                  <strong>
                    {{ cart.total() | number:'1.0-0' }} FCFA
                  </strong>
                </div>

                <p class="summary-info">
                  Les montants définitifs sont recalculés
                  par le serveur lors de la validation.
                  Les frais de livraison seront confirmés séparément.
                </p>

              </aside>

            </div>
          }
        }

      </main>
    </div>
  `,
  styles: [`
    .checkout-page {
      max-width: 1100px;
      margin: 0 auto;
      padding: 55px 24px 80px;
    }

    .checkout-page h1 {
      margin: 10px 0;
      color: #2A55D8;
      font-size: 34px;
    }

    .checkout-intro,
    .section-description {
      color: #87918a;
      font-size: 14px;
      line-height: 1.6;
    }

    .checkout-grid {
      display: grid;
      grid-template-columns: 1.3fr .9fr;
      gap: 25px;
      margin-top: 35px;
      align-items: start;
    }

    .checkout-form-card,
    .checkout-summary {
      padding: 28px;
      border: 1px solid #e9ece6;
      border-radius: 15px;
      background: #fff;
    }

    .checkout-form-card h2,
    .checkout-summary h2 {
      margin: 0 0 8px;
      color: #2A55D8;
      font-size: 20px;
    }

    .section-description {
      margin-bottom: 25px;
    }

    .form-group {
      margin-bottom: 19px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: #2A55D8;
      font-size: 12px;
      font-weight: 700;
    }

    .form-group input,
    .form-group textarea {
      width: 100%;
      box-sizing: border-box;
      padding: 13px;
      border: 1px solid #e4e8e2;
      border-radius: 9px;
      outline: none;
      background: #fdfdfb;
      color: #2A55D8;
      font: inherit;
      font-size: 13px;
    }

    .form-group input:focus,
    .form-group textarea:focus {
      border-color: #f56624;
      box-shadow: 0 0 0 3px rgba(245,102,36,.08);
    }

    .form-group textarea {
      resize: vertical;
    }

    .payment-section {
      margin: 27px 0;
    }

    .payment-section h3 {
      margin-bottom: 13px;
      color: #2A55D8;
      font-size: 15px;
    }

    .payment-option {
      display: flex;
      gap: 12px;
      padding: 16px;
      border: 1px solid #f56624;
      border-radius: 10px;
      background: #fffaf7;
      cursor: pointer;
    }

    .payment-option input {
      accent-color: #f56624;
    }

    .payment-option span {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .payment-option b {
      color: #2A55D8;
      font-size: 13px;
    }

    .payment-option small {
      color: #87918a;
      font-size: 11px;
    }

    .submit-button {
      width: 100%;
      min-height: 50px;
      border: 0;
      cursor: pointer;
    }

    .submit-button:disabled {
      opacity: .6;
      cursor: not-allowed;
    }

    .secure-note {
      display: block;
      margin-top: 14px;
      color: #87918a;
      font-size: 11px;
      text-align: center;
      line-height: 1.5;
    }

    .form-error {
      padding: 12px;
      margin-bottom: 18px;
      border-radius: 9px;
      background: #fff0ed;
      color: #bd3d2b;
      font-size: 12px;
      line-height: 1.5;
    }

    .summary-product {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 15px 0;
      border-bottom: 1px solid #f0f1ed;
    }

    .summary-product img,
    .summary-placeholder {
      width: 48px;
      height: 48px;
      flex-shrink: 0;
      border-radius: 9px;
      object-fit: cover;
      background: #f3f3ee;
    }

    .summary-placeholder {
      display: grid;
      place-items: center;
    }

    .summary-product-info {
      display: flex;
      flex: 1;
      min-width: 0;
      flex-direction: column;
      gap: 5px;
    }

    .summary-product-info b {
      overflow: hidden;
      color: #2A55D8;
      font-size: 12px;
      text-overflow: ellipsis;
    }

    .summary-product-info small {
      color: #87918a;
      font-size: 11px;
    }

    .summary-product strong {
      color: #2A55D8;
      font-size: 12px;
      white-space: nowrap;
    }

    .summary-divider {
      height: 1px;
      margin: 18px 0;
      background: #e9ece6;
    }

    .summary-line,
    .summary-total {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      margin: 14px 0;
      color: #87918a;
      font-size: 13px;
    }

    .summary-line strong {
      color: #2A55D8;
    }

    .summary-total {
      color: #2A55D8;
      font-weight: 700;
    }

    .summary-total strong {
      font-size: 19px;
    }

    .summary-info {
      margin-top: 18px;
      color: #87918a;
      font-size: 11px;
      line-height: 1.6;
    }

    .success-card {
      max-width: 560px;
      margin: 55px auto;
      padding: 40px 25px;
      border: 1px solid #e9ece6;
      border-radius: 16px;
      background: white;
      text-align: center;
    }

    .success-icon {
      display: grid;
      place-items: center;
      width: 65px;
      height: 65px;
      margin: 0 auto 22px;
      border-radius: 50%;
      background: #e8f4ec;
      color: #2A55D8;
      font-size: 32px;
    }

    .success-card h1 {
      font-size: 27px;
    }

    .success-card > p {
      color: #87918a;
      font-size: 14px;
      line-height: 1.6;
    }

    .order-number {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin: 28px 0 18px;
      padding: 20px;
      border-radius: 10px;
      background: #f7f8f4;
    }

    .order-number small {
      color: #87918a;
    }

    .order-number strong {
      color: #2A55D8;
      font-size: 23px;
      letter-spacing: 1px;
    }

    .success-total {
      margin: 20px 0;
      color: #2A55D8;
    }

    .success-total strong {
      font-size: 19px;
    }

    .payment-reminder {
      margin-bottom: 25px;
    }

    @media(max-width: 800px) {
      .checkout-grid {
        grid-template-columns: 1fr;
      }
    }

    @media(max-width: 500px) {
      .checkout-page {
        padding: 35px 16px 55px;
      }

      .checkout-page h1 {
        font-size: 27px;
      }

      .checkout-form-card,
      .checkout-summary {
        padding: 20px 16px;
      }
    }
  `]
})
export class CheckoutComponent {
  readonly cart = inject(CartService);
  private readonly orderService = inject(OrderService);

  submitting = signal(false);
  error = signal('');
  successOrder = signal<CreatedOrder | null>(null);

  form = {
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    deliveryArea: '',
    customerNote: '',
    paymentMethod: 'cash_on_delivery'
  };

  async submit(): Promise<void> {
    this.error.set('');

    if (this.submitting()) return;

    if (!this.form.customerName.trim()) {
      this.error.set('Veuillez renseigner votre nom complet.');
      return;
    }

    if (!this.form.customerPhone.trim()) {
      this.error.set('Veuillez renseigner votre numéro de téléphone.');
      return;
    }

    if (!/^[0-9+\s()-]{8,20}$/.test(this.form.customerPhone.trim())) {
      this.error.set('Veuillez saisir un numéro de téléphone valide.');
      return;
    }

    if (!this.form.customerAddress.trim()) {
      this.error.set('Veuillez renseigner votre adresse de livraison.');
      return;
    }

    const lines = this.cart.lines();

    if (lines.length === 0) {
      this.error.set('Votre panier est vide.');
      return;
    }

    this.submitting.set(true);

    try {
      const order = await this.orderService.createCustomerOrder({
        customerName: this.form.customerName.trim(),
        customerPhone: this.form.customerPhone.trim(),
        deliveryAddress: this.form.customerAddress.trim(),
        deliveryArea: this.form.deliveryArea.trim(),
        deliveryNote: this.form.customerNote.trim(),
        items: lines.map(line => ({
          productId: line.product.id,
          quantity: line.quantity
        }))
      });

      this.cart.clear();
      this.successOrder.set(order);

    } catch (error: unknown) {
      const message = error instanceof Error
        ? error.message
        : 'Une erreur est survenue pendant la création de la commande.';

      this.error.set(message);

    } finally {
      this.submitting.set(false);
    }
  }
}
