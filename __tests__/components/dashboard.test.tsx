/**
 * Tests for components/dashboard.tsx — Dashboard component
 */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

// Mock next/link
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

// Mock recharts to avoid canvas/SVG issues in jsdom
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Area: () => null,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}));

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

import Dashboard from "@/components/dashboard";

beforeEach(() => {
  jest.clearAllMocks();
  Object.keys(store).forEach((k) => delete store[k]);
});

describe("Dashboard", () => {
  test("renders dashboard heading", async () => {
    // API calls will fail → fallback data used
    mockFetch.mockRejectedValue(new Error("Network error"));

    render(<Dashboard />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(
      screen.getByText(/Welcome back! Here's what's happening/)
    ).toBeInTheDocument();
  });

  test("shows loading state then resolves to demo data on API failure", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    render(<Dashboard />);

    // Should eventually show "Demo data" badge
    await waitFor(() => {
      expect(screen.getByText("Demo data")).toBeInTheDocument();
    });
  });

  test("renders KPI cards with fallback data when API fails", async () => {
    mockFetch.mockRejectedValue(new Error("offline"));

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Demo data")).toBeInTheDocument();
    });

    // Fallback KPIs should be rendered
    expect(screen.getByText("Orders Today")).toBeInTheDocument();
    expect(screen.getByText("Deliveries")).toBeInTheDocument();
    expect(screen.getByText("Sales Today")).toBeInTheDocument();
  });

  test("renders live data badge when API succeeds", async () => {
    // Mock all 4 API calls the dashboard makes
    mockFetch
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => [{ id: 1, status: "delivered", total: 5000 }] }) // orders
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => [{ product_id: 1, on_hand: 50 }] }) // inventory
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => [{ id: 1, name: "Widget" }] }) // products
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ receivables_total: 1000, payables_total: 500 }) }); // debt summary

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Live data")).toBeInTheDocument();
    });
  });

  test("renders Back to Home link", async () => {
    mockFetch.mockRejectedValue(new Error("offline"));

    render(<Dashboard />);

    const link = screen.getByText("Back to Home");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/");
  });

  test("renders chart sections", async () => {
    mockFetch.mockRejectedValue(new Error("offline"));

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Demo data")).toBeInTheDocument();
    });

    expect(screen.getByText("Sales Trend")).toBeInTheDocument();
    expect(screen.getByText("Inventory Health")).toBeInTheDocument();
  });
});
