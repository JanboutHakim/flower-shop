import { createClient } from '@supabase/supabase-js';
import { DASHBOARD_ADMIN_EMAILS, SUPABASE_KEY, SUPABASE_URL } from './env';

const DASHBOARD_ADMIN_EMAIL_LIST = DASHBOARD_ADMIN_EMAILS
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    'Missing Supabase environment variables. Check your .env.local file.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true,
  },
});

// ============= AUTH =============
export function isDashboardUserAllowed(user) {
  if (!user) return false;
  if (DASHBOARD_ADMIN_EMAIL_LIST.length === 0) return true;
  return DASHBOARD_ADMIN_EMAIL_LIST.includes(String(user.email || '').toLowerCase());
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Error loading auth session:', error);
    return null;
  }

  return data.session;
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}

export async function signInToDashboard(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    throw error;
  }

  if (!isDashboardUserAllowed(data.user)) {
    await supabase.auth.signOut();
    throw new Error('This account is not allowed to access the dashboard.');
  }

  return data;
}

export async function signOutDashboard() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

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

export async function getRibbons() {
  const { data, error } = await supabase
    .from('ribbons')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching ribbons:', error);
    return [];
  }
  return data;
}

export async function deleteRibbon(id) {
  const { error } = await supabase
    .from('ribbons')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting ribbon:', error);
    throw error;
  }
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

export async function getWraps() {
  const { data, error } = await supabase
    .from('wraps')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching wraps:', error);
    return [];
  }
  return data;
}

export async function deleteWrap(id) {
  const { error } = await supabase
    .from('wraps')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting wrap:', error);
    throw error;
  }
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

export async function getCards() {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching cards:', error);
    return [];
  }
  return data;
}

export async function deleteCard(id) {
  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting card:', error);
    throw error;
  }
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

  if (!data?.length) {
    throw new Error(
      'Order was not updated. Check Supabase RLS UPDATE policy for the orders table.'
    );
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
