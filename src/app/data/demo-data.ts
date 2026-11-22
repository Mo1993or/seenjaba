import { Category, Product, OrderSummary } from '../models/shop.models';

export const CATEGORIES: Category[] = [
  {id:'legumes',name:'Légumes',slug:'legumes',icon:'🥬'},
  {id:'poissons',name:'Poissons',slug:'poissons',icon:'🐟'},
  {id:'fruits',name:'Fruits',slug:'fruits',icon:'🍊'},
  {id:'viandes',name:'Viandes',slug:'viandes',icon:'🍗'},
  {id:'cereales',name:'Céréales',slug:'cereales',icon:'🌾'},
  {id:'epicerie',name:'Épicerie',slug:'epicerie',icon:'🛒'}
];

export const PRODUCTS: Product[] = [
  {id:'p1',name:'Tomates fraîches',slug:'tomates-fraiches',description:'Tomates mûries au soleil, sélectionnées avec soin auprès de producteurs locaux.',price:1200,unit:'kg',category:'Légumes',image:'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=900',badge:'Populaire',stock:38},
  {id:'p2',name:'Poisson frais du jour',slug:'poisson-frais',description:'Poisson frais soigneusement préparé. Selon arrivage et disponibilité.',price:3500,unit:'kg',category:'Poissons',image:'https://images.unsplash.com/photo-1510130387422-82bed34b37e5?w=900',badge:'Arrivage',stock:16},
  {id:'p3',name:'Mangues du Sénégal',slug:'mangues-senegal',description:'Mangues parfumées et naturellement sucrées.',price:1800,unit:'kg',category:'Fruits',image:'https://images.unsplash.com/photo-1553279768-865429fa0078?w=900',stock:42},
  {id:'p4',name:'Carottes',slug:'carottes',description:'Carottes croquantes, idéales pour vos plats et salades.',price:900,unit:'kg',category:'Légumes',image:'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=900',stock:25},
  {id:'p5',name:'Poulet fermier',slug:'poulet-fermier',description:'Poulet entier prêt à cuisiner, vendu à la pièce.',price:4500,unit:'pièce',category:'Viandes',image:'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=900',badge:'Qualité',stock:12},
  {id:'p6',name:'Oranges juteuses',slug:'oranges',description:'Oranges fraîches pour faire le plein de vitamines.',price:1500,unit:'kg',category:'Fruits',image:'https://images.unsplash.com/photo-1547514701-42782101795e?w=900',stock:30},
  {id:'p7',name:'Oignons rouges',slug:'oignons-rouges',description:'Un indispensable de la cuisine quotidienne.',price:1100,unit:'kg',category:'Légumes',image:'https://images.unsplash.com/photo-1508747703725-719777637510?w=900',stock:55},
  {id:'p8',name:'Riz brisé parfumé',slug:'riz-brise',description:'Riz de qualité pour accompagner vos recettes préférées.',price:850,unit:'kg',category:'Céréales',image:'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=900',stock:100}
];

export const DEMO_ORDERS: OrderSummary[] = [
  {id:'SNJ-2048',customer:'Aminata Diallo',date:'Aujourd’hui, 10:42',total:12400,status:'pending',items:4},
  {id:'SNJ-2047',customer:'Moussa Ndiaye',date:'Aujourd’hui, 09:18',total:8500,status:'confirmed',items:3},
  {id:'SNJ-2046',customer:'Fatou Sow',date:'Hier, 17:35',total:21300,status:'preparing',items:7},
  {id:'SNJ-2045',customer:'Ibrahima Fall',date:'Hier, 15:12',total:6700,status:'delivered',items:2}
];
