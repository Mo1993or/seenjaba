
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Category, Product, OrderStatus } from '../models/shop.models';

import { CatalogService } from '../services/catalog.service';
import { ProductAdminService } from '../services/product-admin.service';
import { AdminAuthService } from '../services/admin-auth.service';
import {
  OrderAdminService,
  AdminOrder
} from '../services/order.service';

@Component({
  standalone: true,
  selector: 'app-admin',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="dashboard">
    <aside class="sidebar">
      <a class="brand side-brand" routerLink="/">
        <span class="brand-mark">s.</span>
        <span>seenjaba<small>ADMINISTRATION</small></span>
      </a>

      <div class="side-label">MENU PRINCIPAL</div>

      <button class="side-item" [class.active]="tab() === 'overview'"
        (click)="tab.set('overview')">
        ▦ <span>Vue d’ensemble</span>
      </button>

      <button class="side-item" [class.active]="tab() === 'orders'"
        (click)="tab.set('orders')">
        ▤ <span>Commandes</span>
        @if (pendingOrdersCount() > 0) {
          <b class="side-count">{{ pendingOrdersCount() }}</b>
        }
      </button>

      <button class="side-item" [class.active]="tab() === 'products'"
        (click)="tab.set('products')">
        ◇ <span>Produits</span>
      </button>

      <button class="side-item" [class.active]="tab() === 'categories'"
        (click)="tab.set('categories')">
        ▧ <span>Catégories</span>
      </button>

      <button class="side-item" [class.active]="tab() === 'stock'"
        (click)="tab.set('stock')">
        ▥ <span>Stocks</span>
      </button>

      <div class="side-label side-bottom-label">CONFIGURATION</div>

      <button class="side-item" [class.active]="tab() === 'settings'"
        (click)="tab.set('settings')">
        ⚙ <span>Paramètres</span>
      </button>

      <button
        type="button"
        class="side-item logout-item"
        [disabled]="logoutLoading()"
        (click)="logout()">
        <span>↪</span>
        <span>{{ logoutLoading() ? 'Déconnexion...' : 'Déconnexion' }}</span>
      </button>

      <div class="sidebar-profile">
        <div class="profile-avatar">A</div>
        <div>
          <b>Administrateur</b>
          <small>Compte boutique</small>
        </div>
        <span>⌄</span>
      </div>
    </aside>

    <main class="dashboard-main">
      <header class="dash-header">
        <div>
          <span class="eyebrow">ESPACE DE GESTION</span>
          <h1>{{ pageTitle() }}</h1>
        </div>

        <div class="dash-actions">
          <a class="view-store" routerLink="/">↗ Voir la boutique</a>
          <div class="profile-avatar">A</div>
        </div>
      </header>

      @if (tab() === 'overview') {
        <div class="welcome-row">
          <div>
            <h2>Bonjour 👋</h2>
            <p>Voici ce qui se passe sur votre boutique aujourd’hui.</p>
          </div>
          <span class="date-chip">● Aujourd’hui</span>
        </div>

        <div class="stat-grid">
          <article class="stat-card">
            <span>Montant des commandes</span>
            <strong>{{ totalOrdersAmount() | number:'1.0-0' }} <small>FCFA</small></strong>
            <em class="neutral">Toutes les commandes enregistrées</em>
            <i>↗</i>
          </article>

          <article class="stat-card">
            <span>Commandes</span>
            <strong>{{ orders().length }}</strong>
            <em class="neutral">Commandes enregistrées</em>
            <i>▤</i>
          </article>

          <article class="stat-card">
            <span>Produits actifs</span>
            <strong>{{ activeProductsCount() }}</strong>
            <em class="neutral">Catalogue en ligne</em>
            <i>◇</i>
          </article>

          <article class="stat-card">
            <span>À traiter</span>
            <strong>{{ pendingOrdersCount() }}</strong>
            <em class="warning">● En attente de validation</em>
            <i>◷</i>
          </article>
        </div>

        <div class="dashboard-grid">
          <section class="panel orders-panel">
            <div class="panel-heading">
              <div>
                <h3>Commandes récentes</h3>
                <p>Suivez les dernières commandes clients</p>
              </div>
              <button class="subtle-btn" (click)="tab.set('orders')">
                Tout voir →
              </button>
            </div>

            @if (orderLoading()) {
              <div class="admin-message">Chargement des commandes...</div>
            } @else if (orderError()) {
              <div class="admin-error">{{ orderError() }}</div>
            } @else if (orders().length === 0) {
              <div class="admin-message">Aucune commande pour le moment.</div>
            } @else {
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>COMMANDE</th>
                      <th>CLIENT</th>
                      <th>DATE</th>
                      <th>MONTANT</th>
                      <th>STATUT</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (order of orders().slice(0, 5); track order.id) {
                      <tr>
                        <td><b>{{ order.order_number }}</b></td>
                        <td>{{ order.customer_name }}</td>
                        <td>{{ order.created_at | date:'dd/MM/yyyy HH:mm' }}</td>
                        <td><b>{{ order.total | number:'1.0-0' }} F</b></td>
                        <td>
                          <span class="status" [class]="order.status">
                            {{ statusLabel(order.status) }}
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </section>

          <section class="panel low-stock">
            <div class="panel-heading">
              <div>
                <h3>Stock à surveiller</h3>
                <p>Produits bientôt épuisés</p>
              </div>
              <span class="alert-dot">!</span>
            </div>

            @for (p of lowStock(); track p.id) {
              <div class="stock-row">
                @if (p.image) {
                  <img [src]="p.image" [alt]="p.name">
                }
                <div>
                  <b>{{ p.name }}</b>
                  <small>{{ p.stock }} unités restantes</small>
                </div>
                <span class="stock-warning">Faible</span>
              </div>
            }

            @if (lowStock().length === 0) {
              <p class="admin-message">Aucun stock faible à signaler.</p>
            }

            <button class="subtle-btn" (click)="tab.set('stock')">
              Gérer les stocks →
            </button>
          </section>
        </div>

      } @else if (tab() === 'orders') {
        <section class="panel full-panel">
          <div class="panel-heading">
            <div>
              <h3>Toutes les commandes</h3>
              <p>Validez et suivez les commandes de vos clients.</p>
            </div>

            <button class="subtle-btn" (click)="loadOrders()"
              [disabled]="orderLoading()">
              ↻ Actualiser
            </button>
          </div>

          @if (orderError()) {
            <div class="admin-error">{{ orderError() }}</div>
          }

          @if (orderLoading()) {
            <div class="admin-message">Chargement des commandes...</div>
          } @else if (orders().length === 0) {
            <div class="admin-empty">
              <h3>Aucune commande</h3>
              <p>Les nouvelles commandes apparaîtront ici.</p>
            </div>
          } @else {
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>RÉFÉRENCE</th>
                    <th>CLIENT</th>
                    <th>DATE</th>
                    <th>ARTICLES</th>
                    <th>TOTAL</th>
                    <th>PAIEMENT</th>
                    <th>STATUT</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  @for (order of orders(); track order.id) {
                    <tr>
                      <td><b>{{ order.order_number }}</b></td>
                      <td>
                        <b>{{ order.customer_name }}</b>
                        <small class="table-subtext">{{ order.customer_phone }}</small>
                      </td>
                      <td>{{ order.created_at | date:'dd/MM/yyyy HH:mm' }}</td>
                      <td>{{ getItemsCount(order) }}</td>
                      <td><b>{{ order.total | number:'1.0-0' }} F</b></td>
                      <td>
                        <span class="status"
                          [class.delivered]="order.payment_status === 'paid'"
                          [class.pending]="order.payment_status === 'pending'">
                          {{ paymentStatusLabel(order.payment_status) }}
                        </span>
                      </td>
                      <td>
                        <span class="status" [class]="order.status">
                          {{ statusLabel(order.status) }}
                        </span>
                      </td>
                      <td>
                        <div class="order-actions">
                          <button class="action-btn"
                            (click)="openOrderDetails(order)">
                            Détails
                          </button>

                          @if (nextStatus(order.status); as next) {
                            <button class="action-btn"
                              [disabled]="orderActionLoading() === order.id"
                              (click)="advance(order)">
                              {{ orderActionLoading() === order.id
                                ? 'Mise à jour...'
                                : nextStatusLabel(next) }}
                            </button>
                          }
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </section>

        @if (selectedOrder()) {
          <div class="modal-backdrop" (click)="closeOrderDetails()">
            <section class="product-modal order-modal"
              (click)="$event.stopPropagation()">

              <div class="modal-heading">
                <div>
                  <span class="eyebrow">DÉTAILS DE LA COMMANDE</span>
                  <h2>{{ selectedOrder()?.order_number }}</h2>
                  <p>
                    Créée le
                    {{ selectedOrder()?.created_at | date:'dd/MM/yyyy à HH:mm' }}
                  </p>
                </div>
                <button type="button" class="modal-close"
                  (click)="closeOrderDetails()">×</button>
              </div>

              <div class="order-detail-section">
                <h3>Informations client</h3>
                <p><b>Nom :</b> {{ selectedOrder()?.customer_name }}</p>
                <p><b>Téléphone :</b> {{ selectedOrder()?.customer_phone }}</p>
                <p><b>Adresse :</b> {{ selectedOrder()?.delivery_address }}</p>
                @if (selectedOrder()?.delivery_area) {
                  <p><b>Zone :</b> {{ selectedOrder()?.delivery_area }}</p>
                }
                @if (selectedOrder()?.delivery_note) {
                  <p><b>Instructions :</b> {{ selectedOrder()?.delivery_note }}</p>
                }
              </div>

              <div class="order-detail-section">
                <h3>Articles commandés</h3>

                @for (item of selectedOrder()?.order_items ?? []; track item.id) {
                  <div class="order-detail-item">
                    <div>
                      <b>{{ item.product_name }}</b>
                      <small>
                        {{ item.quantity }} ×
                        {{ item.unit_price | number:'1.0-0' }} FCFA
                      </small>
                    </div>
                    <strong>{{ item.total | number:'1.0-0' }} FCFA</strong>
                  </div>
                }
              </div>

              <div class="order-detail-section">
                <h3>Récapitulatif</h3>
                <p>
                  <span>Sous-total</span>
                  <b>{{ selectedOrder()?.subtotal | number:'1.0-0' }} FCFA</b>
                </p>
                <p>
                  <span>Livraison</span>
                  <b>{{ selectedOrder()?.delivery_fee | number:'1.0-0' }} FCFA</b>
                </p>
                <p class="order-detail-total">
                  <span>Total</span>
                  <b>{{ selectedOrder()?.total | number:'1.0-0' }} FCFA</b>
                </p>
                <p>
                  <span>Paiement</span>
                  <b>À la livraison</b>
                </p>
                <p>
                  <span>État du paiement</span>
                  <b>{{ paymentStatusLabel(selectedOrder()!.payment_status) }}</b>
                </p>
                <p>
                  <span>Statut de commande</span>
                  <b>{{ statusLabel(selectedOrder()!.status) }}</b>
                </p>
              </div>

              <div class="modal-actions">
                <button type="button" class="cancel-btn"
                  (click)="closeOrderDetails()">
                  Fermer
                </button>

                @if (selectedOrder(); as order) {
                  @if (nextStatus(order.status); as next) {
                    <button type="button" class="btn-primary"
                      [disabled]="orderActionLoading() === order.id"
                      (click)="advance(order)">
                      {{ orderActionLoading() === order.id
                        ? 'Mise à jour...'
                        : nextStatusLabel(next) }}
                    </button>
                  }
                }
              </div>
            </section>
          </div>
        }

      } @else if (tab() === 'products') {
        <section class="panel full-panel">
          <div class="panel-heading">
            <div>
              <h3>Catalogue produits</h3>
              <p>Gérez vos produits, prix et disponibilités.</p>
            </div>

            <button class="btn-primary compact"
              (click)="openProductForm()">
              + Ajouter un produit
            </button>
          </div>

          @if (productError()) {
            <div class="admin-error">{{ productError() }}</div>
          }

          @if (productLoading()) {
            <div class="admin-message">Chargement des produits...</div>
          } @else if (products().length === 0) {
            <div class="admin-empty">
              <div class="empty-icon">◇</div>
              <h3>Aucun produit pour le moment</h3>
              <p>Commencez par ajouter votre premier produit au catalogue.</p>
              <button class="btn-primary compact" (click)="openProductForm()">
                + Ajouter un produit
              </button>
            </div>
          } @else {
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>PRODUIT</th>
                    <th>CATÉGORIE</th>
                    <th>PRIX</th>
                    <th>STOCK</th>
                    <th>VISIBILITÉ</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  @for (p of products(); track p.id) {
                    <tr>
                      <td>
                        <div class="product-cell">
                          @if (p.image) {
                            <img [src]="p.image" [alt]="p.name">
                          } @else {
                            <div class="product-placeholder">◇</div>
                          }
                          <b>{{ p.name }}</b>
                        </div>
                      </td>

                      <td>{{ p.category }}</td>

                      <td>
                        <b>{{ p.price | number:'1.0-0' }} FCFA</b>
                        / {{ p.unit }}
                      </td>

                      <td>{{ p.stock }}</td>

                      <td>
                        <span class="status"
                          [class.delivered]="isProductActive(p)"
                          [class.pending]="!isProductActive(p)">
                          {{ isProductActive(p) ? 'En ligne' : 'Désactivé' }}
                        </span>
                      </td>

                      <td>
                        <div class="product-actions">
                          <button class="action-btn"
                            [disabled]="productActionLoading() === p.id"
                            (click)="editProduct(p)">
                            Modifier
                          </button>

                          <button class="action-btn"
                            [disabled]="productActionLoading() === p.id"
                            (click)="toggleProduct(p)">
                            {{ isProductActive(p) ? 'Désactiver' : 'Activer' }}
                          </button>

                          <button class="action-btn danger-btn"
                            [disabled]="productActionLoading() === p.id"
                            (click)="deleteProduct(p)">
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </section>

        @if (showProductForm()) {
          <div class="modal-backdrop" (click)="closeProductForm()">
            <section class="product-modal"
              (click)="$event.stopPropagation()">

              <div class="modal-heading">
                <div>
                  <span class="eyebrow">
                    {{ editingProductId() ? 'MODIFICATION' : 'NOUVEAU PRODUIT' }}
                  </span>

                  <h2>
                    {{ editingProductId() ? 'Modifier le produit' : 'Ajouter un produit' }}
                  </h2>

                  <p>Renseignez les informations de votre produit.</p>
                </div>

                <button type="button" class="modal-close"
                  (click)="closeProductForm()">×</button>
              </div>

              @if (formError()) {
                <div class="admin-error">{{ formError() }}</div>
              }

              <form (ngSubmit)="saveProduct()">
                <div class="form-group">
                  <label for="product-name">Nom du produit *</label>
                  <input id="product-name" name="name"
                    [(ngModel)]="form.name"
                    placeholder="Ex : Mangues du Sénégal"
                    required>
                </div>

                <div class="form-group">
                  <label for="product-description">Description</label>
                  <textarea id="product-description"
                    name="description"
                    [(ngModel)]="form.description"
                    rows="3"
                    placeholder="Décrivez votre produit...">
                  </textarea>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="product-price">Prix (FCFA) *</label>
                    <input id="product-price" name="price"
                      type="number" min="1"
                      [(ngModel)]="form.price"
                      required>
                  </div>

                  <div class="form-group">
                    <label for="product-unit">Unité *</label>
                    <select id="product-unit" name="unit"
                      [(ngModel)]="form.unit" required>
                      <option value="kg">Kilogramme (kg)</option>
                      <option value="g">Gramme (g)</option>
                      <option value="pièce">Pièce</option>
                      <option value="lot">Lot</option>
                      <option value="sac">Sac</option>
                      <option value="litre">Litre</option>
                      <option value="bouteille">Bouteille</option>
                      <option value="paquet">Paquet</option>
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label for="product-category">Catégorie *</label>
                  <select id="product-category" name="categoryId"
                    [(ngModel)]="form.categoryId" required>
                    <option value="">Choisir une catégorie</option>
                    @for (category of categories(); track category.id) {
                      <option [value]="category.id">
                        {{ category.name }}
                      </option>
                    }
                  </select>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="product-stock">Stock *</label>
                    <input id="product-stock" name="stock"
                      type="number" min="0"
                      [(ngModel)]="form.stock" required>
                  </div>

                  <div class="form-group">
                    <label for="product-threshold">Seuil d'alerte *</label>
                    <input id="product-threshold" name="threshold"
                      type="number" min="0"
                      [(ngModel)]="form.lowStockThreshold" required>
                  </div>
                </div>

                <div class="form-group">
                  <label for="product-images">
                    {{ editingProductId() ? 'Ajouter des photos supplémentaires' : 'Photos du produit' }}
                  </label>

                  <input id="product-images" type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    (change)="onImagesSelected($event)">

                  <small class="field-hint">
                    JPG, PNG ou WEBP · 5 Mo maximum par image.
                  </small>

                  @if (selectedImages().length > 0) {
                    <div class="selected-files">
                      <b>{{ selectedImages().length }} image(s) sélectionnée(s)</b>

                      @for (file of selectedImages(); track file.name + $index) {
                        <span>{{ file.name }}</span>
                      }

                      <button type="button" class="remove-files"
                        (click)="clearImages()">
                        Retirer les images sélectionnées
                      </button>
                    </div>
                  }
                </div>

                <label class="active-checkbox">
                  <input type="checkbox" name="isActive"
                    [(ngModel)]="form.isActive">

                  <span>
                    <b>Publier le produit</b>
                    <small>Le produit sera visible dans la boutique.</small>
                  </span>
                </label>

                <div class="modal-actions">
                  <button type="button" class="cancel-btn"
                    [disabled]="savingProduct()"
                    (click)="closeProductForm()">
                    Annuler
                  </button>

                  <button type="submit" class="btn-primary"
                    [disabled]="savingProduct() || categories().length === 0">
                    {{
                      savingProduct()
                        ? 'Enregistrement...'
                        : editingProductId()
                          ? 'Enregistrer les modifications'
                          : 'Enregistrer le produit'
                    }}
                  </button>
                </div>
              </form>
            </section>
          </div>
        }

      } @else if (tab() === 'categories') {
        <section class="panel full-panel">
          <div class="panel-heading">
            <div>
              <h3>Catégories</h3>
              <p>Organisez votre marché par familles de produits.</p>
            </div>

            <button class="btn-primary compact"
              (click)="openCategoryForm()">
              + Nouvelle catégorie
            </button>
          </div>

          @if (categoryError()) {
            <div class="admin-error">{{ categoryError() }}</div>
          }

          @if (categoryLoading()) {
            <div class="admin-message">Chargement des catégories...</div>
          } @else {
            <div class="category-admin-grid"
              (click)="closeCategoryMenu()">

              @for (c of categories(); track c.id) {
                <div class="category-admin-card">
                  <span>{{ c.icon }}</span>

                  <div class="category-card-info">
                    <b>{{ c.name }}</b>
                    <small>Catégorie du catalogue</small>
                  </div>

                  <div class="category-menu-wrapper"
                    (click)="$event.stopPropagation()">

                    <button type="button"
                      class="category-menu-trigger"
                      [class.menu-active]="categoryMenuId() === c.id"
                      [disabled]="deletingCategoryId() === c.id"
                      aria-label="Options de la catégorie"
                      title="Options"
                      (click)="toggleCategoryMenu(c.id)">
                      ⋯
                    </button>

                    @if (categoryMenuId() === c.id) {
                      <div class="category-dropdown">
                        <button type="button"
                          class="category-dropdown-item"
                          (click)="editCategoryFromMenu(c)">
                          <span>✎</span>
                          Modifier
                        </button>

                        <button type="button"
                          class="category-dropdown-item delete-item"
                          [disabled]="deletingCategoryId() === c.id"
                          (click)="deleteCategory(c)">
                          <span>⌫</span>
                          {{ deletingCategoryId() === c.id ? 'Suppression...' : 'Supprimer' }}
                        </button>
                      </div>
                    }
                  </div>
                </div>
              } @empty {
                <div class="admin-empty">
                  <h3>Aucune catégorie</h3>
                  <p>Ajoutez votre première catégorie.</p>
                </div>
              }
            </div>
          }
        </section>

        @if (showCategoryForm()) {
          <div class="modal-backdrop" (click)="closeCategoryForm()">
            <section class="product-modal"
              (click)="$event.stopPropagation()">

              <div class="modal-heading">
                <div>
                  <span class="eyebrow">
                    {{ editingCategoryId() ? 'MODIFICATION' : 'NOUVELLE CATÉGORIE' }}
                  </span>

                  <h2>
                    {{ editingCategoryId() ? 'Modifier la catégorie' : 'Ajouter une catégorie' }}
                  </h2>

                  <p>Renseignez les informations de la catégorie.</p>
                </div>

                <button type="button" class="modal-close"
                  (click)="closeCategoryForm()">×</button>
              </div>

              @if (categoryError()) {
                <div class="admin-error">{{ categoryError() }}</div>
              }

              <form (ngSubmit)="saveCategory()">
                <div class="form-group">
                  <label for="category-name">Nom de la catégorie *</label>
                  <input id="category-name"
                    name="categoryName"
                    [(ngModel)]="categoryForm.name"
                    placeholder="Ex : Fruits de saison"
                    required>
                </div>

                <div class="form-group">
                  <label for="category-order">Ordre d'affichage</label>
                  <input id="category-order"
                    name="categoryOrder"
                    type="number"
                    min="0"
                    [(ngModel)]="categoryForm.sortOrder">
                </div>

                <label class="active-checkbox">
                  <input type="checkbox"
                    name="categoryActive"
                    [(ngModel)]="categoryForm.isActive">

                  <span>
                    <b>Catégorie active</b>
                    <small>Les clients pourront voir cette catégorie.</small>
                  </span>
                </label>

                <div class="modal-actions">
                  <button type="button" class="cancel-btn"
                    [disabled]="savingCategory()"
                    (click)="closeCategoryForm()">
                    Annuler
                  </button>

                  <button type="submit" class="btn-primary"
                    [disabled]="savingCategory()">
                    {{
                      savingCategory()
                        ? 'Enregistrement...'
                        : editingCategoryId()
                          ? 'Enregistrer les modifications'
                          : 'Créer la catégorie'
                    }}
                  </button>
                </div>
              </form>
            </section>
          </div>
        }

      } @else if (tab() === 'stock') {
        <section class="panel full-panel">
          <div class="panel-heading">
            <div>
              <h3>Gestion des stocks</h3>
              <p>Suivez les quantités disponibles.</p>
            </div>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>PRODUIT</th>
                  <th>STOCK DISPONIBLE</th>
                  <th>ÉTAT</th>
                </tr>
              </thead>

              <tbody>
                @for (p of products(); track p.id) {
                  <tr>
                    <td>{{ p.name }}</td>
                    <td>{{ p.stock }}</td>
                    <td>
                      <span class="status"
                        [class.pending]="p.stock < 20"
                        [class.delivered]="p.stock >= 20">
                        {{ p.stock < 20 ? 'Stock faible' : 'Disponible' }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>

      } @else {
        <section class="panel full-panel">
          <h3>Paramètres de la boutique</h3>
          <p>
            Les informations de la boutique, la livraison, les paiements
            et les accès administrateurs seront configurés ici.
          </p>
        </section>
      }

      @if (noticeText()) {
        <div class="toast">{{ noticeText() }}</div>
      }

      <footer class="dash-footer">
        seenjaba Admin · Gestion de la boutique
      </footer>
    </main>
  </div>
  `,
  styles: [`
    .admin-error {
      padding: 13px 16px;
      margin: 15px 0;
      border-radius: 10px;
      background: #fff0ed;
      color: #bd3d2b;
      font-size: 13px;
      line-height: 1.5;
    }

    .admin-message {
      padding: 35px;
      text-align: center;
      color: #87918a;
    }

    .admin-empty {
      padding: 55px 20px;
      text-align: center;
      color: #87918a;
    }

    .empty-icon {
      font-size: 38px;
      color: #f56624;
      margin-bottom: 12px;
    }

    .admin-empty h3 {
      color: #2A55D8;
      margin-bottom: 8px;
    }

    .admin-empty p {
      margin-bottom: 22px;
      font-size: 13px;
    }

    .product-placeholder {
      width: 48px;
      height: 48px;
      display: grid;
      place-items: center;
      border-radius: 9px;
      background: #f3f3ee;
      color: #87918a;
    }

    .product-actions,
    .order-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .order-actions {
      min-width: 150px;
    }

    .table-subtext {
      display: block;
      margin-top: 4px;
      color: #87918a;
      font-size: 11px;
    }

    .danger-btn {
      color: #bd3d2b !important;
      border-color: #f2d4ce !important;
    }

    .product-actions button:disabled,
    .order-actions button:disabled {
      opacity: .5;
      cursor: not-allowed;
    }

    .category-admin-card {
      position: relative;
    }

    .category-card-info {
      flex: 1;
      min-width: 0;
    }

    .category-menu-wrapper {
      position: relative;
      flex-shrink: 0;
    }

    .category-menu-trigger {
      display: grid;
      place-items: center;
      width: 36px;
      height: 36px;
      border: 1px solid #e9ece6;
      border-radius: 9px;
      background: #fff;
      color: #2A55D8;
      font-size: 25px;
      line-height: 1;
      cursor: pointer;
      transition: background .2s, border-color .2s;
    }

    .category-menu-trigger:hover,
    .category-menu-trigger.menu-active {
      background: #f5f6f1;
      border-color: #dce3da;
    }

    .category-menu-trigger:disabled {
      opacity: .5;
      cursor: not-allowed;
    }

    .category-dropdown {
      position: absolute;
      z-index: 50;
      top: calc(100% + 7px);
      right: 0;
      width: 165px;
      padding: 6px;
      background: #fff;
      border: 1px solid #e9ece6;
      border-radius: 11px;
      box-shadow: 0 10px 30px rgba(23, 61, 50, .13);
      animation: categoryMenuIn .15s ease-out;
    }

    @keyframes categoryMenuIn {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .category-dropdown-item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 10px;
      border: 0;
      border-radius: 7px;
      background: transparent;
      color: #2A55D8;
      text-align: left;
      font: inherit;
      font-size: 12px;
      cursor: pointer;
    }

    .category-dropdown-item:hover {
      background: #f5f6f1;
    }

    .category-dropdown-item span {
      width: 17px;
      font-size: 16px;
      text-align: center;
    }

    .category-dropdown-item.delete-item {
      color: #bd3d2b;
    }

    .category-dropdown-item.delete-item:hover {
      background: #fff0ed;
    }

    .category-dropdown-item:disabled {
      opacity: .5;
      cursor: not-allowed;
    }

    .logout-item {
      margin-top: 12px;
      color: #bd3d2b !important;
    }

    .logout-item:hover {
      background: #fff0ed !important;
    }

    .logout-item:disabled {
      opacity: .5;
      cursor: not-allowed;
    }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: rgba(15, 30, 24, .58);
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
      overflow-y: auto;
    }

    .product-modal {
      width: min(100%, 620px);
      max-height: calc(100vh - 40px);
      overflow-y: auto;
      box-sizing: border-box;
      padding: 30px;
      background: #fff;
      border-radius: 18px;
      box-shadow: 0 20px 70px rgba(0,0,0,.2);
      color: #2A55D8;
    }

    .order-modal {
      width: min(100%, 650px);
    }

    .modal-heading {
      display: flex;
      justify-content: space-between;
      gap: 15px;
      margin-bottom: 25px;
    }

    .modal-heading h2 {
      margin: 8px 0;
      font-size: 25px;
    }

    .modal-heading p {
      margin: 0;
      color: #87918a;
      font-size: 13px;
    }

    .modal-close {
      width: 36px;
      height: 36px;
      flex-shrink: 0;
      border: 0;
      border-radius: 50%;
      background: #f4f4ef;
      color: #2A55D8;
      font-size: 24px;
      cursor: pointer;
    }

    .form-group {
      margin-bottom: 17px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-size: 12px;
      font-weight: 700;
      color: #2A55D8;
    }

    .form-group input,
    .form-group textarea,
    .form-group select {
      display: block;
      width: 100%;
      min-height: 46px;
      box-sizing: border-box;
      padding: 11px 13px;
      border: 1px solid #e4e8e2;
      border-radius: 9px;
      outline: none;
      background: #fdfdfb;
      color: #2A55D8;
      font: inherit;
      font-size: 13px;
    }

    .form-group textarea {
      resize: vertical;
    }

    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
      border-color: #f56624;
      box-shadow: 0 0 0 3px rgba(245,102,36,.08);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }

    .field-hint {
      display: block;
      margin-top: 7px;
      color: #89918c;
      font-size: 11px;
    }

    .selected-files {
      display: flex;
      flex-direction: column;
      gap: 7px;
      margin-top: 12px;
      padding: 12px;
      border-radius: 9px;
      background: #f7f8f4;
      font-size: 11px;
      overflow-wrap: anywhere;
    }

    .selected-files b {
      color: #2A55D8;
      margin-bottom: 3px;
    }

    .selected-files span {
      color: #707b74;
    }

    .remove-files {
      align-self: flex-start;
      border: 0;
      padding: 5px 0;
      background: transparent;
      color: #bd3d2b;
      font-weight: 700;
      cursor: pointer;
    }

    .active-checkbox {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 14px;
      margin: 20px 0;
      border: 1px solid #e9ece6;
      border-radius: 10px;
      cursor: pointer;
    }

    .active-checkbox input {
      margin-top: 3px;
      accent-color: #f56624;
    }

    .active-checkbox span {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .active-checkbox b {
      font-size: 12px;
    }

    .active-checkbox small {
      color: #89918c;
      font-size: 11px;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 25px;
    }

    .modal-actions button {
      min-height: 44px;
      padding: 0 18px;
      border-radius: 9px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
    }

    .cancel-btn {
      border: 1px solid #e4e8e2;
      background: white;
      color: #2A55D8;
    }

    .modal-actions button:disabled {
      opacity: .55;
      cursor: not-allowed;
    }

    .order-detail-section {
      padding: 17px 0;
      border-top: 1px solid #edf0ea;
    }

    .order-detail-section h3 {
      margin: 0 0 13px;
      color: #2A55D8;
      font-size: 14px;
    }

    .order-detail-section p {
      display: flex;
      justify-content: space-between;
      gap: 15px;
      margin: 9px 0;
      color: #78847c;
      font-size: 12px;
      line-height: 1.5;
    }

    .order-detail-section p b {
      color: #2A55D8;
      text-align: right;
      overflow-wrap: anywhere;
    }

    .order-detail-item {
      display: flex;
      justify-content: space-between;
      gap: 15px;
      padding: 10px 0;
      border-bottom: 1px solid #f0f1ed;
      font-size: 12px;
    }

    .order-detail-item div {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .order-detail-item b,
    .order-detail-item strong {
      color: #2A55D8;
    }

    .order-detail-item small {
      color: #87918a;
    }

    .order-detail-total {
      padding-top: 10px;
      border-top: 1px solid #e9ece6;
      font-size: 14px !important;
    }

    @media(max-width: 600px) {
      .product-modal {
        padding: 22px 17px;
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: 0;
      }

      .modal-actions {
        flex-direction: column-reverse;
      }

      .modal-actions button {
        width: 100%;
      }
    }
  `]
})

export class AdminComponent implements OnInit {
  private readonly catalogService = inject(CatalogService);
  private readonly productAdminService = inject(ProductAdminService);
  private readonly orderAdminService = inject(OrderAdminService);
  private readonly adminAuthService = inject(AdminAuthService);
  private readonly router = inject(Router);

  tab = signal('overview');
  noticeText = signal('');
  logoutLoading = signal(false);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);

  orders = signal<AdminOrder[]>([]);
  orderLoading = signal(false);
  orderError = signal('');
  orderActionLoading = signal<string | null>(null);
  selectedOrder = signal<AdminOrder | null>(null);

  productLoading = signal(false);
  productError = signal('');

  showProductForm = signal(false);
  savingProduct = signal(false);
  formError = signal('');
  selectedImages = signal<File[]>([]);
  editingProductId = signal<string | null>(null);
  productActionLoading = signal<string | null>(null);

  categoryLoading = signal(false);
  showCategoryForm = signal(false);
  savingCategory = signal(false);
  categoryError = signal('');
  editingCategoryId = signal<string | null>(null);

  categoryMenuId = signal<string | null>(null);
  deletingCategoryId = signal<string | null>(null);

  categoryForm = {
    name: '',
    sortOrder: 0,
    isActive: true
  };

  activeProductsCount = computed(() =>
    this.products().filter(product => this.isProductActive(product)).length
  );

  lowStock = computed(() =>
    this.products().filter(
      product => product.stock < 20 && this.isProductActive(product)
    )
  );

  pendingOrdersCount = computed(() =>
    this.orders().filter(order => order.status === 'pending').length
  );

  totalOrdersAmount = computed(() =>
    this.orders().reduce(
      (total, order) => total + Number(order.total || 0),
      0
    )
  );

  form = this.createEmptyForm();

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
    this.loadOrders();
  }

  private createEmptyForm() {
    return {
      name: '',
      description: '',
      price: 0,
      unit: 'kg',
      categoryId: '',
      stock: 0,
      lowStockThreshold: 5,
      isActive: true
    };
  }

  isProductActive(product: Product): boolean {
    return (product as Product & { isActive?: boolean }).isActive !== false;
  }

  pageTitle(): string {
    return ({
      overview: 'Vue d’ensemble',
      orders: 'Gestion des commandes',
      products: 'Gestion des produits',
      categories: 'Catégories',
      stock: 'Gestion des stocks',
      settings: 'Paramètres'
    } as Record<string, string>)[this.tab()] ?? 'Administration';
  }

  // DÉCONNEXION

  async logout(): Promise<void> {
    if (this.logoutLoading()) return;

    this.logoutLoading.set(true);

    try {
      await this.adminAuthService.signOut();

      this.selectedOrder.set(null);
      this.showProductForm.set(false);
      this.showCategoryForm.set(false);

      await this.router.navigateByUrl('/admin/connexion', {
        replaceUrl: true
      });

    } catch (error) {
      console.error('Erreur déconnexion :', error);

      this.notice(
        error instanceof Error
          ? error.message
          : 'Impossible de vous déconnecter.'
      );
    } finally {
      this.logoutLoading.set(false);
    }
  }

  // CHARGEMENT DES DONNÉES

  async loadCategories(): Promise<void> {
    this.categoryLoading.set(true);
    this.categoryError.set('');

    try {
      this.categories.set(
        await this.catalogService.getAllCategories()
      );
    } catch (error: any) {
      console.error('Erreur chargement catégories :', error);

      this.categoryError.set(
        error?.message ?? 'Impossible de charger les catégories.'
      );
    } finally {
      this.categoryLoading.set(false);
    }
  }

  async loadProducts(): Promise<void> {
    this.productLoading.set(true);
    this.productError.set('');

    try {
      this.products.set(
        await this.catalogService.getAllProducts()
      );
    } catch (error) {
      console.error('Erreur chargement produits :', error);

      this.productError.set(
        error instanceof Error
          ? error.message
          : 'Impossible de charger les produits.'
      );
    } finally {
      this.productLoading.set(false);
    }
  }

  async loadOrders(): Promise<void> {
    this.orderLoading.set(true);
    this.orderError.set('');

    try {
      this.orders.set(
        await this.orderAdminService.getAllOrders()
      );
    } catch (error) {
      console.error('Erreur chargement commandes :', error);

      this.orderError.set(
        error instanceof Error
          ? error.message
          : 'Impossible de charger les commandes.'
      );
    } finally {
      this.orderLoading.set(false);
    }
  }

  // PRODUITS

  openProductForm(): void {
    this.formError.set('');
    this.editingProductId.set(null);
    this.resetForm();
    this.showProductForm.set(true);
  }

  editProduct(product: Product): void {
    this.formError.set('');
    this.editingProductId.set(product.id);

    this.form = {
      name: product.name,
      description: product.description,
      price: product.price,
      unit: product.unit,
      categoryId:
        this.categories().find(category =>
          category.name === product.category
        )?.id ?? '',
      stock: product.stock,
      lowStockThreshold: 5,
      isActive: this.isProductActive(product)
    };

    this.selectedImages.set([]);
    this.showProductForm.set(true);
  }

  closeProductForm(): void {
    if (this.savingProduct()) return;

    this.showProductForm.set(false);
    this.formError.set('');
    this.editingProductId.set(null);
    this.resetForm();
  }

  resetForm(): void {
    this.form = this.createEmptyForm();
    this.selectedImages.set([]);

    const input = document.getElementById(
      'product-images'
    ) as HTMLInputElement | null;

    if (input) input.value = '';
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        this.formError.set(
          `Format non autorisé : ${file.name}. Utilisez JPG, PNG ou WEBP.`
        );

        input.value = '';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.formError.set(
          `L'image ${file.name} dépasse la limite de 5 Mo.`
        );

        input.value = '';
        return;
      }
    }

    this.formError.set('');
    this.selectedImages.set(files);
  }

  clearImages(): void {
    this.selectedImages.set([]);

    const input = document.getElementById(
      'product-images'
    ) as HTMLInputElement | null;

    if (input) input.value = '';
  }

  async saveProduct(): Promise<void> {
    if (this.savingProduct()) return;

    this.formError.set('');

    if (!this.form.name.trim()) {
      this.formError.set('Le nom du produit est obligatoire.');
      return;
    }

    if (!this.form.categoryId) {
      this.formError.set('Veuillez sélectionner une catégorie.');
      return;
    }

    if (!this.form.price || this.form.price <= 0) {
      this.formError.set('Le prix doit être supérieur à zéro.');
      return;
    }

    if (
      this.form.stock < 0 ||
      this.form.lowStockThreshold < 0
    ) {
      this.formError.set(
        'Les quantités ne peuvent pas être négatives.'
      );
      return;
    }

    this.savingProduct.set(true);

    try {
      const input = {
        name: this.form.name,
        description: this.form.description,
        price: Number(this.form.price),
        unit: this.form.unit,
        categoryId: this.form.categoryId,
        stock: Number(this.form.stock),
        lowStockThreshold: Number(this.form.lowStockThreshold),
        isActive: this.form.isActive,
        images: this.selectedImages()
      };

      const productId = this.editingProductId();

      if (productId) {
        await this.productAdminService.updateProduct({
          ...input,
          productId
        });

        this.notice('Produit modifié avec succès !');
      } else {
        await this.productAdminService.createProduct(input);

        this.notice('Produit ajouté avec succès !');
      }

      this.showProductForm.set(false);
      this.editingProductId.set(null);
      this.resetForm();

      await this.loadProducts();

    } catch (error: any) {
      console.error('ERREUR SUPABASE PRODUIT :', error);

      const details = [
        error?.message,
        error?.details,
        error?.hint,
        error?.code
      ].filter(Boolean);

      this.formError.set(
        details.length > 0
          ? details.join(' | ')
          : JSON.stringify(error)
      );
    } finally {
      this.savingProduct.set(false);
    }
  }

  async toggleProduct(product: Product): Promise<void> {
    if (this.productActionLoading()) return;

    const newStatus = !this.isProductActive(product);

    this.productActionLoading.set(product.id);

    try {
      await this.productAdminService.setProductActive(
        product.id,
        newStatus
      );

      await this.loadProducts();

      this.notice(
        newStatus
          ? 'Produit activé et visible dans la boutique.'
          : 'Produit désactivé et masqué de la boutique.'
      );

    } catch (error: any) {
      console.error('Erreur changement visibilité :', error);

      this.notice(
        error?.message ??
        'Impossible de modifier la visibilité du produit.'
      );
    } finally {
      this.productActionLoading.set(null);
    }
  }

  async deleteProduct(product: Product): Promise<void> {
    if (this.productActionLoading()) return;

    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer "${product.name}" ?\n\nCette opération est définitive. Si le produit est déjà utilisé dans une commande, la base de données peut empêcher sa suppression.`
    );

    if (!confirmed) return;

    this.productActionLoading.set(product.id);

    try {
      await this.productAdminService.deleteProduct(product.id);

      await this.loadProducts();

      this.notice('Produit supprimé avec succès.');

    } catch (error: any) {
      console.error('Erreur suppression produit :', error);

      this.notice(
        error?.message ??
        'Impossible de supprimer ce produit. Il est peut-être lié à une commande.'
      );
    } finally {
      this.productActionLoading.set(null);
    }
  }

  // CATÉGORIES

  toggleCategoryMenu(categoryId: string): void {
    this.categoryMenuId.update(current =>
      current === categoryId ? null : categoryId
    );
  }

  closeCategoryMenu(): void {
    this.categoryMenuId.set(null);
  }

  editCategoryFromMenu(category: Category): void {
    this.closeCategoryMenu();
    this.editCategory(category);
  }

  openCategoryForm(): void {
    this.closeCategoryMenu();
    this.editingCategoryId.set(null);
    this.categoryError.set('');

    this.categoryForm = {
      name: '',
      sortOrder: this.categories().length + 1,
      isActive: true
    };

    this.showCategoryForm.set(true);
  }

  editCategory(category: Category): void {
    this.closeCategoryMenu();
    this.editingCategoryId.set(category.id);
    this.categoryError.set('');

    this.categoryForm = {
      name: category.name,
      sortOrder: 0,
      isActive: true
    };

    this.showCategoryForm.set(true);
  }

  closeCategoryForm(): void {
    if (this.savingCategory()) return;

    this.showCategoryForm.set(false);
    this.editingCategoryId.set(null);
    this.categoryError.set('');
  }

  async saveCategory(): Promise<void> {
    if (this.savingCategory()) return;

    this.categoryError.set('');

    if (!this.categoryForm.name.trim()) {
      this.categoryError.set(
        'Le nom de la catégorie est obligatoire.'
      );
      return;
    }

    this.savingCategory.set(true);

    try {
      const input = {
        name: this.categoryForm.name.trim(),
        sortOrder: Number(this.categoryForm.sortOrder),
        isActive: this.categoryForm.isActive
      };

      const categoryId = this.editingCategoryId();

      if (categoryId) {
        await this.catalogService.updateCategory({
          ...input,
          categoryId
        });

        this.notice('Catégorie modifiée avec succès.');
      } else {
        await this.catalogService.createCategory(input);

        this.notice('Catégorie créée avec succès.');
      }

      this.showCategoryForm.set(false);
      this.editingCategoryId.set(null);

      await this.loadCategories();

    } catch (error: any) {
      console.error('Erreur catégorie :', error);

      this.categoryError.set(
        error?.message ?? 'Impossible d’enregistrer la catégorie.'
      );
    } finally {
      this.savingCategory.set(false);
    }
  }

  async deleteCategory(category: Category): Promise<void> {
    if (this.deletingCategoryId()) return;

    this.closeCategoryMenu();

    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer la catégorie "${category.name}" ?\n\nCette opération est définitive.`
    );

    if (!confirmed) return;

    this.deletingCategoryId.set(category.id);
    this.categoryError.set('');

    try {
      await this.catalogService.deleteCategory(category.id);

      await this.loadCategories();

      this.notice('Catégorie supprimée avec succès.');

    } catch (error: any) {
      console.error('Erreur suppression catégorie :', error);

      this.categoryError.set(
        error?.code === '23503'
          ? 'Cette catégorie contient encore des produits. Supprimez ou réaffectez d’abord ces produits.'
          : error?.message ?? 'Impossible de supprimer cette catégorie.'
      );
    } finally {
      this.deletingCategoryId.set(null);
    }
  }

  // COMMANDES

  statusLabel(status: OrderStatus): string {
    return ({
      pending: 'À valider',
      confirmed: 'Validée',
      preparing: 'En préparation',
      ready: 'Prête',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    } as Record<OrderStatus, string>)[status] ?? status;
  }

  paymentStatusLabel(status: string): string {
    return ({
      pending: 'À encaisser',
      paid: 'Payé',
      failed: 'Échec',
      refunded: 'Remboursé'
    } as Record<string, string>)[status] ?? status;
  }

  getItemsCount(order: AdminOrder): number {
    return (order.order_items ?? []).reduce(
      (total, item) => total + Number(item.quantity || 0),
      0
    );
  }

  nextStatus(status: OrderStatus): OrderStatus | null {
    const transitions: Partial<Record<OrderStatus, OrderStatus>> = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'ready',
      ready: 'shipped',
      shipped: 'delivered'
    };

    return transitions[status] ?? null;
  }

  nextStatusLabel(status: OrderStatus): string {
    return ({
      confirmed: 'Valider',
      preparing: 'Préparer',
      ready: 'Marquer prête',
      shipped: 'Expédier',
      delivered: 'Marquer livrée'
    } as Record<OrderStatus, string>)[status] ?? 'Continuer';
  }

  async advance(order: AdminOrder): Promise<void> {
    if (this.orderActionLoading()) return;

    const next = this.nextStatus(order.status);

    if (!next) return;

    this.orderActionLoading.set(order.id);
    this.orderError.set('');

    try {
      await this.orderAdminService.updateOrderStatus(
        order.id,
        next
      );

      await this.loadOrders();

      if (this.selectedOrder()?.id === order.id) {
        const updated = this.orders().find(
          item => item.id === order.id
        );

        this.selectedOrder.set(updated ?? null);
      }

      this.notice(
        `Commande ${order.order_number} : ${this.statusLabel(next).toLowerCase()}.`
      );

    } catch (error: any) {
      console.error('Erreur mise à jour commande :', error);

      this.orderError.set(
        error?.message ??
        'Impossible de modifier le statut de la commande.'
      );
    } finally {
      this.orderActionLoading.set(null);
    }
  }

  openOrderDetails(order: AdminOrder): void {
    this.selectedOrder.set(order);
  }

  closeOrderDetails(): void {
    this.selectedOrder.set(null);
  }

  // NOTIFICATIONS

  notice(message: string): void {
    this.noticeText.set(message);

    setTimeout(() => {
      this.noticeText.set('');
    }, 3000);
  }
}
