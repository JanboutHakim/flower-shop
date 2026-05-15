import { useEffect, useState, useCallback } from 'react';
import {
  getProducts,
  getProductsByCategory,
  createOrder,
  updateOrder,
  getAllOrders,
  getOrdersByPhone,
} from '../lib/supabase';

/**
 * Hook to load products from database
 */
export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return { products, loading, error, refetch: loadProducts };
}

/**
 * Hook to load products by category
 */
export function useProductsByCategory(category) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProductsByCategory(category);
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    if (!category) return;
    loadProducts();
  }, [category, loadProducts]);

  return { products, loading, error, refetch: loadProducts };
}

/**
 * Hook to create and manage orders
 */
export function useOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createNewOrder = useCallback(async (orderData) => {
    try {
      setLoading(true);
      setError(null);
      const order = await createOrder(orderData);
      return order;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateExistingOrder = useCallback(async (orderId, updates) => {
    try {
      setLoading(true);
      setError(null);
      const order = await updateOrder(orderId, updates);
      return order;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createOrder: createNewOrder,
    updateOrder: updateExistingOrder,
    loading,
    error,
  };
}

/**
 * Hook to fetch orders by phone number
 */
export function useOrdersByPhone(phone) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getOrdersByPhone(phone);
      setOrders(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  }, [phone]);

  useEffect(() => {
    if (!phone) {
      setOrders([]);
      setLoading(false);
      return;
    }
    loadOrders();
  }, [phone, loadOrders]);

  return { orders, loading, error, refetch: loadOrders };
}

/**
 * Hook to fetch all orders (for dashboard)
 */
export function useAllOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllOrders();
      setOrders(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return { orders, loading, error, refetch: loadOrders };
}
