# Quick Start Guide

## 1. Install Dependencies

```bash
npm install @supabase/supabase-js
```

(Cloudinary upload is already handled with fetch API, no extra package needed)

---

## 2. Setup Environment Variables

Create `.env.local` in your project root:

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
REACT_APP_CLOUDINARY_CLOUD_NAME=your-cloud-name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=flower_shop
REACT_APP_WHATSAPP_NUMBER=963965578857
```

Get these from:
- **Supabase**: https://supabase.com → Settings > API
- **Cloudinary**: https://cloudinary.com → Dashboard > Settings

---

## 3. Create Database Tables in Supabase

1. Go to Supabase Dashboard
2. Open SQL Editor
3. Copy all SQL from `DATABASE_SETUP.md`
4. Run it

---

## 4. Key Implementation Changes

### Load Products from Database

**In your AppContext:**

```javascript
import { getProducts } from '../lib/supabase';

// On mount:
useEffect(() => {
  getProducts().then(data => setProducts(data));
}, []);
```

### Use Updated CheckoutPage

Replace your CheckoutPage with [CheckoutPage_DB.jsx](src/pages/CheckoutPage_DB.jsx)

### Features:
- ✅ Saves orders to database
- ✅ Stores all order details including customizations
- ✅ Still sends WhatsApp message
- ✅ Shows confirmation after save
- ✅ Handles errors gracefully

---

## 5. Upload Product Images

Use the provided `uploadToCloudinary` function:

```javascript
import { uploadToCloudinary } from '../lib/cloudinary';

const handleImageUpload = async (file) => {
  const imageUrl = await uploadToCloudinary(file);
  // Save imageUrl to your product in database
};
```

---

## 6. Access Orders from Dashboard

```javascript
import { useAllOrders } from '../hooks/useDatabase';

function DashboardPage() {
  const { orders, loading } = useAllOrders();
  
  // orders = [ { id, customer_name, items, total, status, ... }, ... ]
}
```

---

## 7. Search Orders by Customer Phone

```javascript
import { useOrdersByPhone } from '../hooks/useDatabase';

function CustomerOrdersPage({ phone }) {
  const { orders, loading } = useOrdersByPhone(phone);
  
  // Show customer's order history
}
```

---

## Database Schema

| Table | Purpose |
|-------|---------|
| **products** | All flower bouquets (name, price, category, image_url) |
| **themes** | Store UI themes (colors, typography) |
| **orders** | Customer orders with all details & items |
| **customizations** | Individual item customizations (ribbon, wrap, card) |

---

## Security

✅ **Row Level Security (RLS)** enabled:
- Anyone can READ products & themes
- Anyone can INSERT orders
- No direct DELETE permissions for public

For admin dashboard, add authentication:

```javascript
import { supabase } from '../lib/supabase';

// Login
await supabase.auth.signInWithPassword({
  email: 'admin@shop.com',
  password: 'password'
});

// Create policies for authenticated users only
```

---

## Troubleshooting

### "Supabase URL not found"
- Check `.env.local` file exists
- Restart dev server after adding env vars
- Make sure file is `.env.local` (not `.env`)

### "Can't upload to Cloudinary"
- Verify upload preset is "Unsigned"
- Check REACT_APP_CLOUDINARY_CLOUD_NAME matches your account
- Ensure file is valid image format

### "Orders not saving"
- Check RLS policies are enabled
- Verify `orders` table insert policy allows public inserts
- Check browser console for error messages

---

## Next Steps

1. ✅ Set up Supabase & create tables
2. ✅ Add env variables
3. ✅ Install `@supabase/supabase-js`
4. ✅ Replace CheckoutPage with CheckoutPage_DB.jsx
5. ✅ Update AppContext to load products from DB
6. ✅ Create admin dashboard to view orders
7. ✅ Add product upload feature (in dashboard)

