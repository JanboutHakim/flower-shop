import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    'Missing Supabase environment variables. Check your .env.local file.'
  );
}

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
// ============= PRODUCTS =============
export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data;
}

export async function getProductsByCategory(category) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data;
}

export async function getProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }
  return data;
}

export async function createProduct(productData) {
  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select();
  
  if (error) {
    console.error('Error creating product:', error);
    throw error;
  }
  return data[0];
}

export async function updateProduct(id, updates) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select();
  
  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }
  return data[0];
}

export async function deleteProduct(id) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

// ============= PRODUCT OPTIONS =============
export async function createRibbon(ribbonData) {
  const { data, error } = await supabase
    .from('ribbons')
    .insert([ribbonData])
    .select();

  if (error) {
    console.error('Error creating ribbon:', error);
    throw error;
  }
  return data[0];
}

export async function createWrap(wrapData) {
  const { data, error } = await supabase
    .from('wraps')
    .insert([wrapData])
    .select();

  if (error) {
    console.error('Error creating wrap:', error);
    throw error;
  }
  return data[0];
}

export async function createCard(cardData) {
  const { data, error } = await supabase
    .from('cards')
    .insert([cardData])
    .select();

  if (error) {
    console.error('Error creating card:', error);
    throw error;
  }
  return data[0];
}

// ============= THEMES =============
export async function getThemes() {
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching themes:', error);
    return [];
  }
  return data;
}

export async function getThemeById(id) {
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching theme:', error);
    return null;
  }
  return data;
}

export async function createTheme(themeData) {
  const { data, error } = await supabase
    .from('themes')
    .insert([themeData])
    .select();
  
  if (error) {
    console.error('Error creating theme:', error);
    throw error;
  }
  return data[0];
}

// ============= ORDERS =============
export async function createOrder(orderData) {
  const { data, error } = await supabase
    .from('orders')
    .insert([orderData])
    .select();
  
  if (error) {
    console.error('Error creating order:', error);
    throw error;
  }
  return data[0];
}

export async function getOrderById(id) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching order:', error);
    return null;
  }
  return data;
}

export async function getOrdersByPhone(phone) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('customer_phone', phone)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
  return data;
}

export async function updateOrder(id, updates) {
  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select();
  
  if (error) {
    console.error('Error updating order:', error);
    throw error;
  }
  return data[0];
}

export async function getAllOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching all orders:', error);
    return [];
  }
  return data;
}

// ============= CUSTOMIZATIONS =============
export async function createCustomization(customizationData) {
  const { data, error } = await supabase
    .from('customizations')
    .insert([customizationData])
    .select();
  
  if (error) {
    console.error('Error creating customization:', error);
    throw error;
  }
  return data[0];
}

export async function getCustomizationsByOrderId(orderId) {
  const { data, error } = await supabase
    .from('customizations')
    .select('*')
    .eq('order_id', orderId);
  
  if (error) {
    console.error('Error fetching customizations:', error);
    return [];
  }
  return data;
}
