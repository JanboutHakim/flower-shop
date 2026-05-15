import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaBoxOpen,
  FaClipboardList,
  FaDownload,
  FaEye,
  FaImage,
  FaPlus,
  FaSave,
  FaSignOutAlt,
  FaSyncAlt,
  FaTrash,
} from "react-icons/fa";
import { useApp } from "../contexts/AppContext";
import { useAllOrders } from "../hooks/useDatabase";
import { C } from "../constants/theme";
import {
  createCard,
  createProduct,
  createRibbon,
  createWrap,
  deleteCard,
  deleteProduct,
  deleteRibbon,
  deleteWrap,
  getCards,
  getProducts,
  getRibbons,
  getWraps,
  updateOrder,
} from "../lib/supabase";
import { uploadToCloudinary } from "../lib/cloudinary";
import { formatCurrency } from "../constants/options";

const INPUT_STYLE = {
  width: "100%",
  padding: "10px 12px",
  background: C.bg,
  color: C.cream,
  border: `1px solid ${C.border}`,
  borderRadius: 4,
  outline: "none",
};

const PANEL_STYLE = {
  background: C.bgCard,
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  padding: 20,
};

const CATEGORY_OPTIONS = [
  "romantic",
  "graduation",
  "getWell",
  "birthday",
  "wedding",
  "sympathy",
];

const blankProduct = {
  name_en: "",
  name_ar: "",
  category: "romantic",
  price: "",
  icon: "",
  count: "",
  description_en: "",
  description_ar: "",
};

const blankOption = {
  label_en: "",
  label_ar: "",
  color: "#c9956c",
  sort_order: "",
};

function DashboardPage() {
  const { orders, loading, refetch } = useAllOrders();
  const { authUser, logoutDashboard, refetchProducts } = useApp();
  const [activeTab, setActiveTab] = useState("orders");
  const [filter, setFilter] = useState("all");
  const [searchPhone, setSearchPhone] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        if (filter !== "all" && order.status !== filter) return false;
        if (
          searchPhone &&
          !String(order.customer_phone || "").includes(searchPhone)
        ) {
          return false;
        }
        return true;
      }),
    [filter, orders, searchPhone]
  );

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId),
    [orders, selectedOrderId]
  );

  const handleStatusChange = useCallback(
    async (orderId, newStatus) => {
      try {
        await updateOrder(orderId, { status: newStatus });
        await refetch();
      } catch (error) {
        console.error("Error updating order:", error);
        alert(error.message || "Failed to update order");
      }
    },
    [refetch]
  );

  const exportToCSV = useCallback(() => {
    const headers = [
      "ID",
      "Customer",
      "Phone",
      "City",
      "Total",
      "Status",
      "Date",
    ];
    const rows = filteredOrders.map((order) => [
      order.id,
      order.customer_name,
      order.customer_phone,
      order.customer_city,
      formatCurrency(order.total),
      order.status,
      new Date(order.created_at).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredOrders]);

  return (
    <div
      style={{
        padding: 20,
        background: C.bg,
        minHeight: "100vh",
        color: C.cream,
      }}
    >
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <DashboardHeader
          activeTab={activeTab}
          authUser={authUser}
          logoutDashboard={logoutDashboard}
          setActiveTab={setActiveTab}
        />

        {activeTab === "orders" && selectedOrder ? (
          <OrderDetail
            order={selectedOrder}
            onBack={() => setSelectedOrderId(null)}
            onStatusChange={handleStatusChange}
          />
        ) : activeTab === "orders" ? (
          <OrdersList
            exportToCSV={exportToCSV}
            filter={filter}
            filteredOrders={filteredOrders}
            handleStatusChange={handleStatusChange}
            loading={loading}
            orders={orders}
            refetch={refetch}
            searchPhone={searchPhone}
            setFilter={setFilter}
            setSearchPhone={setSearchPhone}
            setSelectedOrderId={setSelectedOrderId}
          />
        ) : (
          <CatalogManager
            categories={CATEGORY_OPTIONS}
            refetchProducts={refetchProducts}
          />
        )}
      </div>
    </div>
  );
}

function DashboardHeader({ activeTab, authUser, logoutDashboard, setActiveTab }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
        marginBottom: 26,
      }}
    >
      <div>
        <h1 style={{ fontSize: 32, marginBottom: 6, color: C.accent }}>
          Orders Dashboard
        </h1>
        <p style={{ color: C.secondary, fontSize: 14 }}>
          Manage orders, products, ribbons, wrapping, and cards.
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {authUser?.email && (
          <span style={{ color: C.secondary, fontSize: 13 }}>
            {authUser.email}
          </span>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <TabButton
            active={activeTab === "orders"}
            icon={<FaBoxOpen />}
            label="Orders"
            onClick={() => setActiveTab("orders")}
          />
          <TabButton
            active={activeTab === "catalog"}
            icon={<FaPlus />}
            label="Catalog"
            onClick={() => setActiveTab("catalog")}
          />
          <button
            type="button"
            onClick={logoutDashboard}
            style={secondaryButtonStyle()}
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 14px",
        background: active ? C.accent : C.bgCard,
        color: active ? C.bg : C.cream,
        border: `1px solid ${active ? C.accent : C.border}`,
        borderRadius: 4,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontWeight: 700,
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function OrdersList({
  exportToCSV,
  filter,
  filteredOrders,
  handleStatusChange,
  loading,
  orders,
  refetch,
  searchPhone,
  setFilter,
  setSearchPhone,
  setSelectedOrderId,
}) {
  return (
    <>
      <div
        style={{
          ...PANEL_STYLE,
          marginBottom: 24,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 15,
          alignItems: "end",
        }}
      >
        <Field label="Filter by status">
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            style={INPUT_STYLE}
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </Field>

        <Field label="Search phone">
          <input
            type="tel"
            placeholder="Enter phone number"
            value={searchPhone}
            onChange={(event) => setSearchPhone(event.target.value)}
            style={INPUT_STYLE}
          />
        </Field>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => {
              setFilter("all");
              setSearchPhone("");
            }}
            style={secondaryButtonStyle()}
          >
            Reset
          </button>
          <button onClick={refetch} style={primaryButtonStyle()}>
            <FaSyncAlt /> Refresh
          </button>
        </div>

        <button onClick={exportToCSV} style={greenButtonStyle()}>
          <FaDownload /> Export CSV
        </button>
      </div>

      {loading ? (
        <EmptyState>Loading orders...</EmptyState>
      ) : filteredOrders.length === 0 ? (
        <EmptyState>No orders found</EmptyState>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              minWidth: 920,
              borderCollapse: "collapse",
              background: C.bgCard,
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <thead>
              <tr
                style={{
                  background: `${C.accent}20`,
                  borderBottom: `2px solid ${C.border}`,
                }}
              >
                <TableHead>ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Items</TableHead>
                <TableHead align="right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead align="center">Actions</TableHead>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: 12, fontSize: 12, fontWeight: 700 }}>
                    #{order.id}
                  </td>
                  <td style={{ padding: 12 }}>{order.customer_name}</td>
                  <td style={{ padding: 12 }}>
                    <a
                      href={`https://wa.me/${order.customer_phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: C.accent, textDecoration: "none" }}
                    >
                      {order.customer_phone}
                    </a>
                  </td>
                  <td style={{ padding: 12 }}>{order.customer_city}</td>
                  <td style={{ padding: 12, fontSize: 12 }}>
                    {order.items?.length || 0} item
                    {order.items?.length !== 1 ? "s" : ""}
                  </td>
                  <td
                    style={{
                      padding: 12,
                      textAlign: "right",
                      fontSize: 14,
                      fontWeight: 700,
                      color: C.accent,
                    }}
                  >
                    {formatCurrency(order.total)}
                  </td>
                  <td style={{ padding: 12 }}>
                    <StatusSelect
                      status={order.status}
                      onChange={(status) => handleStatusChange(order.id, status)}
                    />
                  </td>
                  <td style={{ padding: 12, fontSize: 12 }}>
                    {formatDate(order.created_at)}
                  </td>
                  <td style={{ padding: 12, textAlign: "center" }}>
                    <button
                      onClick={() => setSelectedOrderId(order.id)}
                      style={primaryButtonStyle({ padding: "7px 11px", fontSize: 12 })}
                    >
                      <FaEye /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: 18,
          marginTop: 32,
        }}
      >
        <StatCard title="Total Orders" value={orders.length} color="#2196F3" />
        <StatCard
          title="Pending"
          value={orders.filter((order) => order.status === "pending").length}
          color="#FFC107"
        />
        <StatCard
          title="Delivered"
          value={orders.filter((order) => order.status === "delivered").length}
          color="#4CAF50"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(
            orders
            .reduce((sum, order) => sum + Number(order.total || 0), 0)
          )}
          color={C.accent}
        />
      </div>
    </>
  );
}

function OrderDetail({ order, onBack, onStatusChange }) {
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div>
      <button
        onClick={onBack}
        style={{ ...secondaryButtonStyle(), marginBottom: 18 }}
      >
        <FaArrowLeft /> Back to orders
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
          gap: 20,
          alignItems: "start",
        }}
      >
        <div style={PANEL_STYLE}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 22,
            }}
          >
            <div>
              <div style={{ color: C.secondary, fontSize: 12 }}>Order</div>
              <h2 style={{ color: C.accent, fontSize: 26 }}>#{order.id}</h2>
              <p style={{ color: C.secondary, fontSize: 13 }}>
                Created {formatDateTime(order.created_at)}
              </p>
            </div>
            <StatusSelect
              status={order.status}
              onChange={(status) => onStatusChange(order.id, status)}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 14,
              marginBottom: 24,
            }}
          >
            <Info label="Customer" value={order.customer_name} />
            <Info
              label="Phone"
              value={
                <a
                  href={`https://wa.me/${order.customer_phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: C.accent, textDecoration: "none" }}
                >
                  {order.customer_phone}
                </a>
              }
            />
            <Info label="City" value={order.customer_city} />
            <Info label="Address" value={order.customer_address || "Not provided"} />
            <Info label="Delivery date" value={order.delivery_date || "Not set"} />
            <Info label="Delivery time" value={order.delivery_time || "Not set"} />
            <Info
              label="WhatsApp"
              value={order.whatsapp_sent ? "Marked sent" : "Not marked sent"}
            />
            <Info
              label="Total"
              value={formatCurrency(order.total)}
              highlight
            />
            <Info
              label="Delivery"
              value={
                order.delivery_requested
                  ? formatCurrency(order.delivery_fee || 0)
                  : "No"
              }
            />
            <Info
              label="Payment"
              value={
                order.payment_method === "sham_cash"
                  ? "Sham Cash"
                  : "Cash on delivery"
              }
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, marginBottom: 12, color: C.cream }}>
              Order items
            </h3>
            {items.length === 0 ? (
              <p style={{ color: C.secondary }}>No items stored on this order.</p>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {items.map((item, index) => (
                  <OrderItem item={item} key={`${item.product_id || "item"}-${index}`} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={PANEL_STYLE}>
          <h3 style={{ fontSize: 18, marginBottom: 12, color: C.cream }}>
            Notes
          </h3>
          <p style={{ color: order.notes ? C.cream : C.secondary, lineHeight: 1.7 }}>
            {order.notes || "No customer notes."}
          </p>
          {order.payment_receipt_url && (
            <div style={{ marginTop: 18 }}>
              <h3 style={{ fontSize: 18, marginBottom: 12, color: C.cream }}>
                Payment receipt
              </h3>
              <a
                href={order.payment_receipt_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: C.accent }}
              >
                Open receipt image
              </a>
              <img
                src={order.payment_receipt_url}
                alt="Payment receipt"
                style={{
                  display: "block",
                  width: "100%",
                  marginTop: 12,
                  borderRadius: 6,
                  border: `1px solid ${C.border}`,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OrderItem({ item }) {
  const title = resolveOrderItemName(item.name);

  return (
    <div
      style={{
        border: `1px solid ${C.border}`,
        borderRadius: 6,
        padding: 14,
        background: C.bg,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 10,
        }}
      >
        <div>
          <div style={{ fontWeight: 700, color: C.cream }}>{title}</div>
          <div style={{ color: C.secondary, fontSize: 12 }}>
            Product ID: {item.product_id || "N/A"}
          </div>
        </div>
        <div style={{ textAlign: "right", color: C.accent, fontWeight: 700 }}>
          {formatCurrency(item.subtotal || item.price * item.quantity || 0)}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: 10,
          color: C.secondary,
          fontSize: 13,
        }}
      >
        <span>Qty: {item.quantity || 1}</span>
        <span>Price: {formatCurrency(item.price || 0)}</span>
        <span>Ribbon: {item.ribbon || "None"}</span>
        <span>Wrapping: {item.wrap || "None"}</span>
        <span>Card: {item.card_message || item.cardText || "None"}</span>
      </div>
    </div>
  );
}

function CatalogManager({ categories, refetchProducts }) {
  const [catalog, setCatalog] = useState({
    products: [],
    ribbons: [],
    wraps: [],
    cards: [],
  });
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const loadCatalog = useCallback(async () => {
    try {
      setLoading(true);
      setActionError("");
      const [products, ribbons, wraps, cards] = await Promise.all([
        getProducts(),
        getRibbons(),
        getWraps(),
        getCards(),
      ]);

      setCatalog({ products, ribbons, wraps, cards });
    } catch (err) {
      console.error("Error loading catalog:", err);
      setActionError(err.message || "Failed to load catalog.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const handleDeleted = useCallback(
    async (message) => {
      setActionMessage(message);
      await loadCatalog();
      await refetchProducts();
    },
    [loadCatalog, refetchProducts]
  );

  return (
    <div>
      {actionError && <Notice tone="error">{actionError}</Notice>}
      {actionMessage && <Notice tone="success">{actionMessage}</Notice>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
          gap: 20,
          alignItems: "start",
          marginBottom: 20,
        }}
      >
        <ProductForm
          categories={categories}
          refetchProducts={async () => {
            await refetchProducts();
            await loadCatalog();
          }}
        />
        <div style={{ display: "grid", gap: 20 }}>
          <OptionForm
            kind="ribbon"
            title="Add ribbon"
            helper="Adds a ribbon option to the product customizer."
            includeColor
            createItem={createRibbon}
            onSaved={loadCatalog}
          />
          <OptionForm
            kind="wrap"
            title="Add wrapping"
            helper="Adds a wrapping option to the product customizer."
            createItem={createWrap}
            onSaved={loadCatalog}
          />
          <OptionForm
            kind="card"
            title="Add card"
            helper="Adds a card shape or design to the product customizer."
            createItem={createCard}
            onSaved={loadCatalog}
          />
        </div>
      </div>

      <CatalogLists
        catalog={catalog}
        loading={loading}
        onDeleted={handleDeleted}
        setActionError={setActionError}
      />
    </div>
  );
}

function ProductForm({ categories, refetchProducts }) {
  const [form, setForm] = useState(blankProduct);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const set = useCallback((key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setError("");
      setMessage("");

      if (!form.name_en || !form.name_ar || !form.price || !form.count) {
        setError("Name, price, and flower count are required.");
        return;
      }

      try {
        setSaving(true);
        const image_url = imageFile ? await uploadToCloudinary(imageFile) : null;

        await createProduct({
          name_en: form.name_en.trim(),
          name_ar: form.name_ar.trim(),
          category: form.category,
          price: Number(form.price),
          icon: form.icon.trim() || null,
          count: Number(form.count),
          description_en: form.description_en.trim() || null,
          description_ar: form.description_ar.trim() || null,
          image_url,
        });

        setForm(blankProduct);
        setImageFile(null);
        setMessage("Product added. The image URL was saved in Supabase.");
        await refetchProducts();
      } catch (err) {
        console.error("Error adding product:", err);
        setError(err.message || "Failed to add product.");
      } finally {
        setSaving(false);
      }
    },
    [form, imageFile, refetchProducts]
  );

  return (
    <form onSubmit={handleSubmit} style={PANEL_STYLE}>
      <FormHeader
        title="Add product"
        helper="Upload an image to Cloudinary, then save the new product with that image URL."
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: 14,
        }}
      >
        <Field label="English name">
          <input
            style={INPUT_STYLE}
            value={form.name_en}
            onChange={(event) => set("name_en", event.target.value)}
            required
          />
        </Field>
        <Field label="Arabic name">
          <input
            style={INPUT_STYLE}
            value={form.name_ar}
            onChange={(event) => set("name_ar", event.target.value)}
            required
          />
        </Field>
        <Field label="Category">
          <select
            style={INPUT_STYLE}
            value={form.category}
            onChange={(event) => set("category", event.target.value)}
          >
            {categories.map((category) => (
              <option value={category} key={category}>
                {category}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Price (SYP)">
          <input
            style={INPUT_STYLE}
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(event) => set("price", event.target.value)}
            required
          />
        </Field>
        <Field label="Flower count">
          <input
            style={INPUT_STYLE}
            type="number"
            min="1"
            value={form.count}
            onChange={(event) => set("count", event.target.value)}
            required
          />
        </Field>
        <Field label="Icon">
          <input
            style={INPUT_STYLE}
            value={form.icon}
            onChange={(event) => set("icon", event.target.value)}
            placeholder="Optional"
          />
        </Field>
      </div>

      <div style={{ display: "grid", gap: 14, marginTop: 14 }}>
        <Field label="English description">
          <textarea
            style={{ ...INPUT_STYLE, resize: "vertical", minHeight: 82 }}
            value={form.description_en}
            onChange={(event) => set("description_en", event.target.value)}
          />
        </Field>
        <Field label="Arabic description">
          <textarea
            style={{ ...INPUT_STYLE, resize: "vertical", minHeight: 82 }}
            value={form.description_ar}
            onChange={(event) => set("description_ar", event.target.value)}
          />
        </Field>
        <ImageInput file={imageFile} setFile={setImageFile} />
      </div>

      <SaveArea
        error={error}
        message={message}
        saving={saving}
        label="Save product"
      />
    </form>
  );
}

function OptionForm({ createItem, helper, includeColor = false, kind, onSaved, title }) {
  const [form, setForm] = useState(blankOption);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const set = useCallback((key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setError("");
      setMessage("");

      if (!form.label_en || !form.label_ar) {
        setError("English and Arabic labels are required.");
        return;
      }

      try {
        setSaving(true);
        const image_url = imageFile ? await uploadToCloudinary(imageFile) : null;
        const payload = {
          label_en: form.label_en.trim(),
          label_ar: form.label_ar.trim(),
          image_url,
          sort_order: form.sort_order ? Number(form.sort_order) : 0,
        };

        if (includeColor) {
          payload.color = form.color || "#c9956c";
        }

        await createItem(payload);
        setForm(blankOption);
        setImageFile(null);
        setMessage(`${title} saved. The image URL was stored in Supabase.`);
        await onSaved?.();
      } catch (err) {
        console.error(`Error adding ${kind}:`, err);
        setError(err.message || `Failed to add ${kind}.`);
      } finally {
        setSaving(false);
      }
    },
    [createItem, form, imageFile, includeColor, kind, onSaved, title]
  );

  return (
    <form onSubmit={handleSubmit} style={PANEL_STYLE}>
      <FormHeader title={title} helper={helper} compact />
      <div style={{ display: "grid", gap: 12 }}>
        <Field label="English label">
          <input
            style={INPUT_STYLE}
            value={form.label_en}
            onChange={(event) => set("label_en", event.target.value)}
            required
          />
        </Field>
        <Field label="Arabic label">
          <input
            style={INPUT_STYLE}
            value={form.label_ar}
            onChange={(event) => set("label_ar", event.target.value)}
            required
          />
        </Field>
        <Field label="Sort order">
          <input
            style={INPUT_STYLE}
            type="number"
            min="0"
            value={form.sort_order}
            onChange={(event) => set("sort_order", event.target.value)}
            placeholder="0"
          />
        </Field>
        {includeColor && (
          <Field label="Ribbon color">
            <div style={{ display: "flex", gap: 10 }}>
              <input
                type="color"
                value={form.color}
                onChange={(event) => set("color", event.target.value)}
                style={{
                  width: 48,
                  height: 42,
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                  borderRadius: 4,
                }}
              />
              <input
                style={INPUT_STYLE}
                value={form.color}
                onChange={(event) => set("color", event.target.value)}
              />
            </div>
          </Field>
        )}
        <ImageInput file={imageFile} setFile={setImageFile} />
      </div>

      <SaveArea error={error} message={message} saving={saving} label="Save" />
    </form>
  );
}

function CatalogLists({ catalog, loading, onDeleted, setActionError }) {
  if (loading) {
    return <EmptyState>Loading catalog...</EmptyState>;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
        gap: 20,
      }}
    >
      <DeleteList
        title="Products"
        items={catalog.products}
        getTitle={(item) => item.name_en || item.name_ar || `Product #${item.id}`}
        getSubtitle={(item) => `${item.category || "No category"} - ${formatCurrency(item.price)}`}
        getImage={(item) => item.image_url}
        deleteItem={deleteProduct}
        onDeleted={() => onDeleted("Product deleted.")}
        setActionError={setActionError}
      />
      <DeleteList
        title="Ribbons"
        items={catalog.ribbons}
        getTitle={(item) => item.label_en || item.label_ar || `Ribbon #${item.id}`}
        getSubtitle={(item) => item.color || "No color"}
        getImage={(item) => item.image_url}
        deleteItem={deleteRibbon}
        onDeleted={() => onDeleted("Ribbon deleted.")}
        setActionError={setActionError}
      />
      <DeleteList
        title="Wrapping"
        items={catalog.wraps}
        getTitle={(item) => item.label_en || item.label_ar || `Wrap #${item.id}`}
        getSubtitle={(item) => `Sort order: ${item.sort_order || 0}`}
        getImage={(item) => item.image_url}
        deleteItem={deleteWrap}
        onDeleted={() => onDeleted("Wrapping deleted.")}
        setActionError={setActionError}
      />
      <DeleteList
        title="Cards"
        items={catalog.cards}
        getTitle={(item) => item.label_en || item.label_ar || `Card #${item.id}`}
        getSubtitle={(item) => `Sort order: ${item.sort_order || 0}`}
        getImage={(item) => item.image_url}
        deleteItem={deleteCard}
        onDeleted={() => onDeleted("Card deleted.")}
        setActionError={setActionError}
      />
    </div>
  );
}

function DeleteList({
  deleteItem,
  getImage,
  getSubtitle,
  getTitle,
  items,
  onDeleted,
  setActionError,
  title,
}) {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = useCallback(
    async (item) => {
      const itemTitle = getTitle(item);
      const confirmed = window.confirm(`Delete "${itemTitle}"? This cannot be undone.`);
      if (!confirmed) return;

      try {
        setActionError("");
        setDeletingId(item.id);
        await deleteItem(item.id);
        await onDeleted();
      } catch (err) {
        console.error(`Error deleting ${title}:`, err);
        setActionError(err.message || `Failed to delete ${itemTitle}.`);
      } finally {
        setDeletingId(null);
      }
    },
    [deleteItem, getTitle, onDeleted, setActionError, title]
  );

  return (
    <div style={PANEL_STYLE}>
      <h2
        style={{
          color: C.accent,
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 20,
          marginBottom: 14,
        }}
      >
        <FaClipboardList /> {title}
      </h2>

      {items.length === 0 ? (
        <p style={{ color: C.secondary, fontSize: 13 }}>No items found.</p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                display: "grid",
                gridTemplateColumns: "48px 1fr auto",
                gap: 10,
                alignItems: "center",
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                padding: 10,
              }}
            >
              {getImage(item) ? (
                <img
                  src={getImage(item)}
                  alt={getTitle(item)}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 4,
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 4,
                    background: C.bgEl,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: C.secondary,
                    fontSize: 12,
                  }}
                >
                  #{item.id}
                </div>
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ color: C.cream, fontWeight: 700, wordBreak: "break-word" }}>
                  {getTitle(item)}
                </div>
                <div style={{ color: C.secondary, fontSize: 12, marginTop: 3 }}>
                  {getSubtitle(item)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(item)}
                disabled={deletingId === item.id}
                style={{
                  ...dangerButtonStyle(),
                  opacity: deletingId === item.id ? 0.6 : 1,
                  cursor: deletingId === item.id ? "wait" : "pointer",
                }}
              >
                <FaTrash /> {deletingId === item.id ? "Deleting" : "Delete"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FormHeader({ compact = false, helper, title }) {
  return (
    <div style={{ marginBottom: compact ? 14 : 20 }}>
      <h2 style={{ fontSize: compact ? 18 : 24, marginBottom: 6, color: C.accent }}>
        {title}
      </h2>
      <p style={{ color: C.secondary, fontSize: 13, lineHeight: 1.5 }}>{helper}</p>
    </div>
  );
}

function ImageInput({ file, setFile }) {
  return (
    <Field label="Image">
      <label
        style={{
          ...INPUT_STYLE,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          cursor: "pointer",
          textTransform: "none",
          letterSpacing: 0,
          color: file ? C.cream : C.secondary,
          marginBottom: 0,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FaImage />
          {file ? file.name : "Choose an image"}
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          style={{ display: "none" }}
        />
      </label>
    </Field>
  );
}

function SaveArea({ error, label, message, saving }) {
  return (
    <div style={{ marginTop: 18 }}>
      {error && <Notice tone="error">{error}</Notice>}
      {message && <Notice tone="success">{message}</Notice>}
      <button
        type="submit"
        disabled={saving}
        style={{
          ...primaryButtonStyle({ padding: "11px 16px" }),
          opacity: saving ? 0.65 : 1,
          cursor: saving ? "wait" : "pointer",
        }}
      >
        <FaSave /> {saving ? "Uploading..." : label}
      </button>
    </div>
  );
}

function Notice({ children, tone }) {
  const isError = tone === "error";
  return (
    <div
      style={{
        background: isError ? "#ff6b6b20" : "#4CAF5020",
        border: `1px solid ${isError ? "#ff6b6b" : "#4CAF50"}`,
        color: isError ? "#ff8a8a" : "#9ae19a",
        padding: 10,
        borderRadius: 4,
        marginBottom: 12,
        fontSize: 13,
      }}
    >
      {children}
    </div>
  );
}

function Field({ children, label }) {
  return (
    <div>
      <label
        style={{
          fontSize: 12,
          color: C.secondary,
          display: "block",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function StatusSelect({ onChange, status }) {
  const borderColor =
    status === "delivered"
      ? "#4CAF50"
      : status === "pending"
        ? "#FFC107"
        : status === "cancelled"
          ? "#ff6b6b"
          : "#2196F3";

  return (
    <select
      value={status || "pending"}
      onChange={(event) => onChange(event.target.value)}
      style={{
        padding: "7px 9px",
        background: `${borderColor}20`,
        color: C.cream,
        border: `1px solid ${borderColor}`,
        borderRadius: 4,
        cursor: "pointer",
      }}
    >
      <option value="pending">Pending</option>
      <option value="confirmed">Confirmed</option>
      <option value="delivered">Delivered</option>
      <option value="cancelled">Cancelled</option>
    </select>
  );
}

function Info({ highlight = false, label, value }) {
  return (
    <div
      style={{
        border: `1px solid ${C.border}`,
        borderRadius: 6,
        padding: 12,
        background: C.bg,
      }}
    >
      <div style={{ color: C.secondary, fontSize: 12, marginBottom: 4 }}>
        {label}
      </div>
      <div
        style={{
          color: highlight ? C.accent : C.cream,
          fontWeight: highlight ? 800 : 600,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function TableHead({ align = "left", children }) {
  return <th style={{ padding: 12, textAlign: align }}>{children}</th>;
}

function EmptyState({ children }) {
  return (
    <div style={{ textAlign: "center", padding: 40, fontSize: 18, color: C.secondary }}>
      {children}
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div
      style={{
        background: C.bgCard,
        border: `2px solid ${color}`,
        borderRadius: 8,
        padding: 20,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 12, color: C.secondary, marginBottom: 10 }}>
        {title}
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color }}>{value}</div>
    </div>
  );
}

function primaryButtonStyle(overrides = {}) {
  return {
    padding: "9px 14px",
    background: C.accent,
    color: C.bg,
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontWeight: 800,
    ...overrides,
  };
}

function secondaryButtonStyle(overrides = {}) {
  return {
    padding: "9px 14px",
    background: C.bgCard,
    color: C.cream,
    border: `1px solid ${C.border}`,
    borderRadius: 4,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    ...overrides,
  };
}

function greenButtonStyle(overrides = {}) {
  return {
    padding: "9px 14px",
    background: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontWeight: 800,
    ...overrides,
  };
}

function dangerButtonStyle(overrides = {}) {
  return {
    padding: "8px 11px",
    background: "rgba(255,107,107,.14)",
    color: "#ff8a8a",
    border: "1px solid rgba(255,107,107,.35)",
    borderRadius: 4,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    fontWeight: 800,
    ...overrides,
  };
}

function resolveOrderItemName(name) {
  if (!name) return "Unnamed item";
  if (typeof name === "string") return name;
  return name.en || name.ar || "Unnamed item";
}

function formatDate(value) {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString();
}

function formatDateTime(value) {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
}

export default DashboardPage;
