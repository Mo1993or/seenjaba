-- Catégories de départ (à lancer après schema.sql)
insert into public.categories(name,slug,icon,sort_order) values
('Légumes','legumes','🥬',1),('Poissons','poissons','🐟',2),('Fruits','fruits','🍊',3),
('Viandes','viandes','🍗',4),('Céréales','cereales','🌾',5),('Épicerie','epicerie','🛒',6)
on conflict(slug) do nothing;
