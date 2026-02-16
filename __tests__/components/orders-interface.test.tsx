/**
 * Tests for components/orders/orders-interface.tsx — OrdersInterface component
 */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock localStorage
const store: Record<string, string> = {};
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, val: string) => { store[key] = val; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(),
    length: 0,
    key: jest.fn(),
  },
});

// Mock sub-components with complex dependencies
jest.mock("@/components/orders/order-wizard", () => ({
  OrderWizard: ({ onClose }: any) => (
    <div data-testid="order-wizard">
      <button onClick={onClose}>Close Wizard</button>
    </div>
  ),
}));

jest.mock("@/components/orders/order-detail", () => ({
  OrderDetail: ({ order, onClose }: any) => (
    <div data-testid="order-detail">
      Order {order?.id}
      <button onClick={onClose}>Close Detail</button>
    </div>
  ),
}));

import { OrdersInterface } from "@/components/orders/orders-interface";

beforeEach(() => {
  jest.clearAllMocks();
  Object.keys(store).forEach((k) => delete store[k]);
});

describe("OrdersInterface", () => {
  test("renders orders heading", async () => {
    mockFetch.mockRejectedValue(new Error("offline"));

    render(<OrdersInterface />);

    expect(screen.getByText("Orders")).toBeInTheDocument();
  });

  test("renders search input", async () => {
    mockFetch.mockRejectedValue(new Error("offline"));

    render(<OrdersInterface />);

    const search = screen.getByPlaceholderText(/Search orders/i);
    expect(search).toBeInTheDocument();
  });

  test("renders new order button", async () => {
    mockFetch.mockRejectedValue(new Error("offline"));

    render(<OrdersInterface />);

    expect(screen.getByText(/New Order/i)).toBeInTheDocument();
  });

  test("shows fallback orders when API fails", async () => {
    mockFetch.mockRejectedValue(new Error("offline"));

    render(<OrdersInterface />);

    await waitFor(() => {
      // Fallback orders include "Adebayo Johnson"
      expect(screen.getByText("Adebayo Johnson")).toBeInTheDocument();
    });
  });

  test("shows demo data badge when using fallback", async () => {
    mockFetch.mockRejectedValue(new Error("offline"));

    render(<OrdersInterface />);

    await waitFor(() => {
      expect(screen.getByText("Demo data")).toBeInTheDocument();
    });
  });

  test("renders table headers", async () => {
    mockFetch.mockRejectedValue(new Error("offline"));

    render(<OrdersInterface />);

    await waitFor(() => {
      expect(screen.getByText("Adebayo Johnson")).toBeInTheDocument();
    });

    expect(screen.getByText("Order")).toBeInTheDocument();
    expect(screen.getByText("Customer")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Total")).toBeInTheDocument();
  });

  test("renders status badges for orders", async () => {
    mockFetch.mockRejectedValue(new Error("offline"));

    render(<OrdersInterface />);

    await waitFor(() => {
      // Fallback data includes various statuses
      expect(screen.getByText("Fraud Hold")).toBeInTheDocument();
    });
  });
});
