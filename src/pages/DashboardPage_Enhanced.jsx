import React, { useState, useCallback } from "react";
import { useAllOrders, useOrder } from "../hooks/useDatabase";
import { C } from "../constants/theme";
import { updateOrder } from "../lib/supabase";
import { FaDownload, FaCheck, FaTimes } from "react-icons/fa";

function DashboardPage() {
  const { orders, loading, refetch } = useAllOrders();
  const [filter, setFilter] = useState("all"); // all, pending, confirmed, delivered
  const [searchPhone, setSearchPhone] = useState("");

  const filteredOrders = orders.filter((order) => {
    if (filter !== "all" && order.status !== filter) return false;
    if (searchPhone && !order.customer_phone.includes(searchPhone)) return false;
    return true;
  });

  const handleStatusChange = useCallback(async (orderId, newStatus) => {
    try {
      await updateOrder(orderId, { status: newStatus });
      refetch();
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order");
    }
  }, [refetch]);

  const exportToCSV = useCallback(() => {
    const headers = ["ID", "Customer", "Phone", "City", "Total", "Status", "Date"];
    const rows = filteredOrders.map((o) => [
      o.id,
      o.customer_name,
      o.customer_phone,
      o.customer_city,
      `$${o.total.toFixed(2)}`,
      o.status,
      new Date(o.created_at).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  }, [filteredOrders]);

  return (
    <div style={{ padding: 20, background: C.bg, minHeight: "100vh", color: C.cream }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ fontSize: 32, marginBottom: 30, color: C.accent }}>📦 Orders Dashboard</h1>

        {/* Controls */}
        <div
          style={{
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: 20,
            marginBottom: 30,
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr auto",
            gap: 15,
            alignItems: "center",
          }}
        >
          <div>
            <label style={{ fontSize: 12, color: C.secondary, display: "block", marginBottom: 5 }}>
              Filter by Status
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                background: C.bg,
                color: C.cream,
                border: `1px solid ${C.border}`,
                borderRadius: 4,
              }}
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, color: C.secondary, display: "block", marginBottom: 5 }}>
              Search Phone
            </label>
            <input
              type="tel"
              placeholder="Enter phone number"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                background: C.bg,
                color: C.cream,
                border: `1px solid ${C.border}`,
                borderRadius: 4,
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => {
                setFilter("all");
                setSearchPhone("");
              }}
              style={{
                padding: "8px 16px",
                background: C.secondary,
                color: C.bg,
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Reset
            </button>
            <button
              onClick={refetch}
              style={{
                padding: "8px 16px",
                background: C.accent,
                color: C.bg,
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Refresh
            </button>
          </div>

          <button
            onClick={exportToCSV}
            style={{
              padding: "8px 16px",
              background: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <FaDownload /> Export CSV
          </button>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, fontSize: 18 }}>Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, fontSize: 18, color: C.secondary }}>
            No orders found
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: C.bgCard,
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <thead>
                <tr style={{ background: `${C.accent}20`, borderBottom: `2px solid ${C.border}` }}>
                  <th style={{ padding: 12, textAlign: "left" }}>ID</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Customer</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Phone</th>
                  <th style={{ padding: 12, textAlign: "left" }}>City</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Items</th>
                  <th style={{ padding: 12, textAlign: "right" }}>Total</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Status</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Date</th>
                  <th style={{ padding: 12, textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    style={{
                      borderBottom: `1px solid ${C.border}`,
                      ":hover": { background: `${C.accent}10` },
                    }}
                  >
                    <td style={{ padding: 12, fontSize: 12, fontWeight: 600 }}>#{order.id}</td>
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
                      {order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}
                    </td>
                    <td style={{ padding: 12, textAlign: "right", fontSize: 14, fontWeight: 600, color: C.accent }}>
                      ${order.total.toFixed(2)}
                    </td>
                    <td style={{ padding: 12 }}>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        style={{
                          padding: "6px 8px",
                          background: order.status === "delivered" ? "#4CAF5020" : order.status === "pending" ? "#FFC10720" : "#2196F320",
                          color: C.cream,
                          border: `1px solid ${order.status === "delivered" ? "#4CAF50" : order.status === "pending" ? "#FFC107" : "#2196F3"}`,
                          borderRadius: 4,
                          cursor: "pointer",
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td style={{ padding: 12, fontSize: 12 }}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: 12, textAlign: "center" }}>
                      <button
                        onClick={() => alert(JSON.stringify(order, null, 2))}
                        style={{
                          padding: "6px 10px",
                          background: C.accent,
                          color: C.bg,
                          border: "none",
                          borderRadius: 4,
                          cursor: "pointer",
                          fontSize: 12,
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 20,
            marginTop: 40,
          }}
        >
          <StatCard
            title="Total Orders"
            value={orders.length}
            color="#2196F3"
          />
          <StatCard
            title="Pending"
            value={orders.filter((o) => o.status === "pending").length}
            color="#FFC107"
          />
          <StatCard
            title="Delivered"
            value={orders.filter((o) => o.status === "delivered").length}
            color="#4CAF50"
          />
          <StatCard
            title="Total Revenue"
            value={`$${orders.reduce((sum, o) => sum + (o.total || 0), 0).toFixed(2)}`}
            color={C.accent}
          />
        </div>
      </div>
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
      <div style={{ fontSize: 12, color: C.secondary, marginBottom: 10 }}>{title}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

export default DashboardPage;
