
import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Category, Product } from '../models/shop.models';
import { CartService } from '../services/cart.service';
import { CatalogService } from '../services/catalog.service';

@Component({
  standalone: true,
  selector: 'app-storefront',
  imports: [CommonModule, RouterLink],
  template: `
  <div class="store-shell">
    <div class="topline">
      <span>✦ Le meilleur du marché, sélectionné pour vous</span>
      <span>Livraison à Dakar & environs</span>
    </div>

    <header class="site-header">
      <a class="brand" routerLink="/">
        <span class="brand-mark">s.</span>
        <span>seenjaba<small>LE MARCHÉ FRAIS</small></span>
      </a>

      <nav>
        <a href="#catalogue">Nos produits</a>
        <a href="#engagements">Notre engagement</a>
        <a href="#footer">Contact</a>
      </nav>

      <div class="header-actions">
        <button class="icon-btn" aria-label="Rechercher">⌕</button>

        <a class="cart-link" routerLink="/panier">
          Panier <b>{{ cart.count() }}</b>
        </a>

        <a class="admin-link" routerLink="/admin">
          <span class="admin-desktop-label">Espace pro ↗</span>
          <span class="admin-mobile-label">Pro ↗</span>
        </a>
      </div>
    </header>

    <main>
      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow"><i></i> FRAIS. LOCAL. AUTHENTIQUE.</span>
          <h1>Le goût du bon,<br><em>tout simplement.</em></h1>
          <p>
            Des produits frais et essentiels soigneusement sélectionnés.
            Le marché vient à vous, en quelques clics.
          </p>

          <div class="hero-buttons">
            <a class="btn-primary" href="#catalogue">
              Faire mes courses <span>↗</span>
            </a>
            <a class="text-link" href="#engagements">Découvrir seenjaba</a>
          </div>

          <div class="hero-proof">
            <div class="avatar-stack"><b>A</b><b>M</b><b>F</b></div>
            <span>
              <strong>Le marché en confiance</strong>
              <small>Des produits choisis avec soin</small>
            </span>
          </div>
        </div>

        <div class="hero-visual">
          <div class="hero-photo"></div>
          <div class="fresh-stamp">
            <span>✳</span><strong>100%</strong><small>FRAÎCHEUR</small>
          </div>
          <div class="floating-note">
            <span>🥬</span>
            <div>
              <b>Fraîcheur au quotidien</b>
              <small>Le meilleur de nos marchés</small>
            </div>
          </div>
        </div>
      </section>

      <section class="category-section" id="catalogue">
        <div class="section-heading">
          <div>
            <span class="eyebrow">FAITES VOTRE MARCHÉ</span>
            <h2>Qu’est-ce qu’on vous prépare ?</h2>
          </div>
          <span class="muted">Des essentiels bien choisis, chaque jour.</span>
        </div>

        @if (categoryLoading()) {
          <p>Chargement des catégories...</p>
        } @else if (categoryError()) {
          <p class="category-error">{{ categoryError() }}</p>
        } @else if (categories().length === 0) {
          <p>Aucune catégorie active n'a été trouvée dans le catalogue.</p>
        }

        <div class="category-grid">
          @for (category of categories(); track category.id) {
            <button
              class="category-tile"
              [class.selected]="activeCategory() === category.name"
              (click)="selectCategory(category.name)"
            >
              <span class="category-icon">{{ category.icon }}</span>
              <strong>{{ category.name }}</strong>
              <small>Découvrir →</small>
            </button>
          }

          <button
            class="category-tile all-tile"
            [class.selected]="activeCategory() === 'Tous'"
            (click)="selectCategory('Tous')"
          >
            <span class="category-icon">✳</span>
            <strong>Tout voir</strong>
            <small>Le marché complet →</small>
          </button>
        </div>
      </section>

      <section class="products-section">
        <div class="section-heading">
          <div>
            <span class="eyebrow">LA SÉLECTION seenjaba</span>
            <h2>Les bons produits du moment</h2>
          </div>
          <a class="text-link" href="#catalogue">Voir tout le marché ↗</a>
        </div>

        <div class="product-grid">
          @if (isLoading()) {
            <p>Chargement des produits...</p>
          } @else if (productError()) {
            <p>{{ productError() }}</p>
          } @else if (filteredProducts().length === 0) {
            <p>Aucun produit disponible dans cette catégorie pour le moment.</p>
          } @else {
            @for (product of filteredProducts(); track product.id) {
              <article class="product-card">
                <a
                  class="product-image"
                  [routerLink]="['/produit', product.slug]"
                >
                  <img [src]="product.image" [alt]="product.name">
                  <span class="product-badge">
                    {{ product.badge || 'Sélection' }}
                  </span>
                  <span class="quick-view">Voir le produit ↗</span>
                </a>

                <div class="product-info">
                  <small>{{ product.category }}</small>
                  <h3>{{ product.name }}</h3>
                  <div class="product-bottom">
                    <div>
                      <strong>{{ product.price | number:'1.0-0' }} FCFA</strong>
                      <small>/ {{ product.unit }}</small>
                    </div>
                    <button
                      class="add-btn"
                      (click)="add(product)"
                      aria-label="Ajouter au panier"
                    >+</button>
                  </div>
                </div>
              </article>
            }
          }
        </div>
      </section>

      <section class="promise" id="engagements">
        <div class="promise-icon">✳</div>
        <div>
          <span class="eyebrow">L’ESPRIT seenjaba</span>
          <h2>Bien manger commence par<br><em>bien choisir.</em></h2>
          <p>
            Nous mettons à l’honneur les produits du quotidien,
            la fraîcheur et le plaisir de faire son marché simplement.
          </p>
        </div>
        <div class="promise-points">
          <span>✓ Une sélection attentive</span>
          <span>✓ Des prix affichés clairement</span>
          <span>✓ Une commande simple et rapide</span>
        </div>
      </section>
    </main>

    <footer id="footer">
      <a class="brand footer-brand" routerLink="/">
        <span class="brand-mark">s.</span>
        <span>seenjaba<small>LE MARCHÉ FRAIS</small></span>
      </a>
      <span>Adresse: Mbour Saly, Salon d'or en face clinique Aida</span>
      <span>Téléphone : +221 78 018 83 18</span>
      <span>Le marché frais, à portée de clic.</span>
      <span>© 2026 seenjaba</span>
    </footer>

    @if (toast()) {
      <div class="toast">✓ {{ toast() }}</div>
    }
  </div>
  `
})

export class StorefrontComponent implements OnInit {
  readonly cart: CartService;

  readonly categories = signal<Category[]>([]);
  readonly products = signal<Product[]>([]);
  readonly activeCategory = signal('Tous');
  readonly toast = signal('');

  readonly isLoading = signal(true);
  readonly categoryLoading = signal(true);

  readonly productError = signal('');
  readonly categoryError = signal('');

  readonly filteredProducts = computed(() => {
    const selected = this.activeCategory();

    if (selected === 'Tous') {
      return this.products();
    }

    return this.products().filter(
      product => product.category === selected
    );
  });

  constructor(
    private readonly catalogService: CatalogService,
    cart: CartService
  ) {
    this.cart = cart;
  }

  ngOnInit(): void {
    void this.loadCatalog();
  }

  private async loadCatalog(): Promise<void> {
    this.isLoading.set(true);
    this.categoryLoading.set(true);

    this.productError.set('');
    this.categoryError.set('');

    const [categoriesResult, productsResult] = await Promise.allSettled([
      this.catalogService.getCategories(),
      this.catalogService.getProducts()
    ]);

    if (categoriesResult.status === 'fulfilled') {
      this.categories.set(categoriesResult.value);

      console.log(
        'Catégories récupérées depuis Supabase :',
        categoriesResult.value
      );
    } else {
      console.error(
        'Erreur chargement catégories :',
        categoriesResult.reason
      );

      this.categoryError.set(
        categoriesResult.reason?.message ??
        'Impossible de récupérer les catégories depuis Supabase.'
      );
    }

    this.categoryLoading.set(false);

    if (productsResult.status === 'fulfilled') {
      this.products.set(productsResult.value);
    } else {
      console.error(
        'Erreur chargement produits :',
        productsResult.reason
      );

      this.productError.set(
        productsResult.reason?.message ??
        'Impossible de charger les produits. Veuillez réessayer.'
      );
    }

    this.isLoading.set(false);
  }

  selectCategory(name: string): void {
    this.activeCategory.set(name);
  }

  add(product: Product): void {
    this.cart.add(product);
    this.toast.set(product.name + ' ajouté au panier');

    setTimeout(() => {
      this.toast.set('');
    }, 2200);
  }
}
