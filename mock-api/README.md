# Buzzly Mock API Server

Mock API server สำหรับ Facebook Graph API และ Shopee Open Platform พร้อมข้อมูลจำลอง 2 ร้านค้า

## Quick Start

```bash
# Install dependencies
npm install

# Start mock server (port 3001)
npm start
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/facebook/:tenant/insights` | FB campaign performance |
| GET | `/facebook/:tenant/leads` | FB lead form data |
| GET | `/shopee/:tenant/orders/list` | Shopee order list |
| GET | `/shopee/:tenant/marketing/shop_performance` | Shopee marketing metrics |
| GET | `/health` | Health check |

`:tenant` = `shop-a` (high volume) หรือ `shop-b` (niche)

## Seed to Supabase

```bash
SUPABASE_URL=https://xxx.supabase.co \
SUPABASE_KEY=eyJ... \
TEAM_ID=your-workspace-uuid \
npm run seed -- shop-a
```

## Tenant Profiles

- **Shop A**: High volume, high spend, moderate CTR/ROAS
- **Shop B**: Niche skincare, low volume, high conversion & ROAS
