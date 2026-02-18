-- Insert platform categories
INSERT INTO public.platform_categories (id, name, slug, description) VALUES
  ('d47a4319-899d-4bcc-a9ca-87cc762d4712', 'Social Media', 'social-media', 'Social media platforms'),
  ('8bcd3b89-915b-4294-8488-3d1d3f1a026a', 'E-Commerce', 'e-commerce', 'E-commerce platforms');

-- Insert the 4 supported platforms
INSERT INTO public.platforms (id, name, slug, icon_url, description, is_active, platform_category_id) VALUES
  ('fda13184-3c0e-44bd-9b61-168ce420d647', 'Facebook', 'facebook', 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg', 'Facebook Ads & Page Management', true, 'd47a4319-899d-4bcc-a9ca-87cc762d4712'),
  ('b70a04ed-6ff4-499a-806c-dae58ed84de9', 'Instagram', 'instagram', 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png', 'Instagram Ads & Account Management', true, 'd47a4319-899d-4bcc-a9ca-87cc762d4712'),
  ('4f669b5e-0227-40a7-85e2-467acf54290a', 'TikTok', 'tiktok', 'https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg', 'TikTok Ads & Account Management', true, 'd47a4319-899d-4bcc-a9ca-87cc762d4712'),
  ('fa9a6145-65bb-4a44-80f1-13948849004e', 'Shopee', 'shopee', 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee.svg', 'Shopee Seller Center Integration', true, '8bcd3b89-915b-4294-8488-3d1d3f1a026a');