-- Seed default categories
INSERT INTO categories (name, slug, description, icon, display_order) VALUES
  ('Electronics', 'electronics', 'Phones, laptops, cameras, and other tech gadgets', 'monitor', 1),
  ('Fashion', 'fashion', 'Clothing, shoes, accessories, and jewelry', 'shirt', 2),
  ('Home & Garden', 'home-garden', 'Furniture, decor, kitchen, and outdoor items', 'home', 3),
  ('Sports & Outdoors', 'sports-outdoors', 'Equipment, gear, and fitness accessories', 'dumbbell', 4),
  ('Collectibles', 'collectibles', 'Rare items, antiques, coins, and memorabilia', 'gem', 5),
  ('Vehicles', 'vehicles', 'Cars, motorcycles, boats, and parts', 'car', 6),
  ('Art', 'art', 'Paintings, sculptures, prints, and photography', 'palette', 7),
  ('Books & Media', 'books-media', 'Books, music, movies, and video games', 'book-open', 8),
  ('Toys & Hobbies', 'toys-hobbies', 'Toys, games, models, and hobby supplies', 'gamepad-2', 9),
  ('Other', 'other', 'Everything else', 'package', 10)
ON CONFLICT DO NOTHING;
