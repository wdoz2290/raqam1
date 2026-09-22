-- ==============================================================================
-- 1. MAHSULOTLAR (PRODUCTS) JADVALINI YARATISH
-- ==============================================================================
DROP TABLE IF EXISTS public.products;

CREATE TABLE public.products (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    number TEXT NOT NULL,
    operator TEXT NOT NULL,
    series TEXT NOT NULL,
    category TEXT NOT NULL,
    tier TEXT NOT NULL,
    raw TEXT NOT NULL,
    price NUMERIC NOT NULL,
    price_usd NUMERIC NOT NULL,
    desc_uz TEXT NOT NULL,
    desc_ru TEXT NOT NULL,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 2. ROW LEVEL SECURITY (RLS) SIYOSATLARINI SOZLASH
-- ==============================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public products are viewable by everyone."
ON public.products FOR SELECT
USING ( true );

CREATE POLICY "Users can insert products"
ON public.products FOR INSERT
WITH CHECK ( auth.role() = 'authenticated' );

CREATE POLICY "Users can update products"
ON public.products FOR UPDATE
USING ( auth.role() = 'authenticated' );

CREATE POLICY "Users can delete products"
ON public.products FOR DELETE
USING ( auth.role() = 'authenticated' );

-- ==============================================================================
-- 3. STORAGE (RASMLAR UCHUN BUCKET) YARATISH VA RLS SOZLASH
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product_images', 'product_images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product_images' );

CREATE POLICY "Admin Insert Access"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'product_images' AND auth.role() = 'authenticated' );

CREATE POLICY "Admin Update Access"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'product_images' AND auth.role() = 'authenticated' );

CREATE POLICY "Admin Delete Access"
ON storage.objects FOR DELETE
USING ( bucket_id = 'product_images' AND auth.role() = 'authenticated' );

-- ==============================================================================
-- 4. BOSHQA SOZLAMALAR
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $body
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$body language 'plpgsql';

CREATE TRIGGER update_products_modtime
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- ==============================================================================
-- 5. TEST UCHUN BOSHlang'ich MA'LUMOTLARNI QO'SHISH
-- ==============================================================================
INSERT INTO public.products (id, number, operator, series, category, tier, raw, price, price_usd, desc_uz, desc_ru, is_featured, is_active)
VALUES 
('rq-01', '+998 90 777 77 77', 'Beeline', '90 Seriya', 'VIP', 'Super VIP', '907777777', 2500000, 200, 'O''zbekistonning eng nufuzli 7-talik monolit yetti seriyasi. Davlat arbobi darajasi.', 'Самая престижная монолитная серия из семёрок. Уровень государственного деятеля.', true, true),
('rq-02', '+998 91 555 55 55', 'Ucell', '91 Seriya', 'VIP', 'Super VIP', '915555555', 2200000, 175, 'Beshlik monolit beshlar seriyasi. Yangi qadoqda, to''liq toza birinchi qo''l.', 'Монолитная серия пятёрок. В новой упаковке, полностью чистый первый владелец.', true, true);
