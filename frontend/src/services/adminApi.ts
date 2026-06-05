const ADMIN_API = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:5001/api/admin';

// ── Types ──────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  mfaEnabled: boolean;
  lastLoginAt: string | null;
  roles: Array<{ role: { name: string } }>;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface Booking {
  id: string;
  mongoId: string;
  customerId: string;
  customer: { name: string; email: string };
  roomName: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  pricePerNight: number;
  totalAmount: number;
  status: string;
  cancelReason: string | null;
  confirmedAt: string | null;
  createdAt: string;
}

export interface Customer {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  status: string;
  totalBookings: number;
  totalSpent: number;
  emailVerified: boolean;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  customerId: string;
  customer: { name: string; email: string };
  booking: { roomName: string; checkIn: string; checkOut: string };
  amount: number;
  currency: string;
  status: string;
  gateway: string;
  razorpayPaymentId: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface Refund {
  id: string;
  bookingId: string;
  paymentId: string;
  amount: number;
  type: 'FULL' | 'PARTIAL';
  reason: string;
  status: string;
  adminNotes: string | null;
  booking: { roomName: string; customer: { name: string; email: string } };
  createdAt: string;
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  customerId: string;
  customer: { name: string; email: string };
  assignedToId: string | null;
  resolvedAt: string | null;
  createdAt: string;
  _count?: { notes: number };
}

export interface TicketNote {
  id: string;
  ticketId: string;
  authorId: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
}

export interface CmsPage {
  id: string;
  slug: string;
  title: string;
  type: string;
  status: string;
  content: string;
  authorId: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  overview: {
    totalBookings: number;
    bookingsThisMonth: number;
    bookingChange: number;
    totalRevenue: number;
    revenueThisMonth: number;
    revenueChange: number;
    totalCustomers: number;
    newCustomersThisMonth: number;
    failedPayments: number;
    pendingRefunds: number;
    openTickets: number;
  };
  recentBookings: Booking[];
  recentActivity: Array<{
    id: string;
    action: string;
    resource: string;
    description: string;
    createdAt: string;
    adminUser: { firstName: string; lastName: string; email: string } | null;
  }>;
  charts: {
    revenueByDay: Array<{ date: string; value: number }>;
    bookingsByStatus: Array<{ status: string; count: number }>;
    customerGrowth: Array<{ date: string; value: number }>;
  };
}

// ── Core fetch ─────────────────────────────────────────────────

class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function adminFetch<T>(
  path: string,
  options: RequestInit = {},
  isRetry = false
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_access_token') : null;

  const res = await fetch(`${ADMIN_API}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  // Try refresh on 401
  if (res.status === 401 && !isRetry) {
    const refreshRes = await fetch(`${ADMIN_API}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (refreshRes.ok) {
      const data = await refreshRes.json();
      if (data.data?.accessToken) {
        localStorage.setItem('admin_access_token', data.data.accessToken);
        return adminFetch<T>(path, options, true);
      }
    }
    // Refresh failed — clear token and redirect to login
    localStorage.removeItem('admin_access_token');
    if (typeof window !== 'undefined') window.location.href = '/admin/login';
    throw new ApiError(401, 'UNAUTHORIZED', 'Session expired');
  }

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      res.status,
      body?.error?.code ?? 'UNKNOWN',
      body?.error?.message ?? 'Request failed'
    );
  }

  return body;
}

function get<T>(path: string) { return adminFetch<{ success: boolean; data: T }>(path); }
function post<T>(path: string, body: unknown) { return adminFetch<{ success: boolean; data: T }>(path, { method: 'POST', body: JSON.stringify(body) }); }
function patch<T>(path: string, body: unknown) { return adminFetch<{ success: boolean; data: T }>(path, { method: 'PATCH', body: JSON.stringify(body) }); }
function put<T>(path: string, body: unknown) { return adminFetch<{ success: boolean; data: T }>(path, { method: 'PUT', body: JSON.stringify(body) }); }
function del<T>(path: string) { return adminFetch<{ success: boolean; data: T }>(path, { method: 'DELETE' }); }

// ── Auth ──────────────────────────────────────────────────────

export function adminLogin(body: { email: string; password: string; mfaCode?: string }) {
  return adminFetch<{ success: boolean; data: { accessToken?: string; requiresMfa?: boolean; user?: AdminUser } }>(
    '/auth/login', { method: 'POST', body: JSON.stringify(body) }, true
  );
}
export function adminRefresh() { return post<{ accessToken: string }>('/auth/refresh', {}); }
export function adminLogout() { return post<null>('/auth/logout', {}); }
export function getMe() { return get<AdminUser>('/auth/me'); }

// ── Dashboard ─────────────────────────────────────────────────

export async function getStats() { return (await get<DashboardStats>('/dashboard/stats')).data; }

// ── Bookings ──────────────────────────────────────────────────

export async function getBookings(params?: Record<string, string>) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return (await get<PaginatedResponse<Booking>>(`/bookings${qs}`)).data;
}
export async function getBookingById(id: string) { return (await get<Booking>(`/bookings/${id}`)).data; }
export async function updateBookingStatus(id: string, data: { status: string; reason?: string }) {
  return (await patch<Booking>(`/bookings/${id}/status`, data)).data;
}
export async function cancelBooking(id: string, data: { reason: string }) {
  return (await post<Booking>(`/bookings/${id}/cancel`, data)).data;
}
export async function rescheduleBooking(id: string, data: { checkIn: string; checkOut: string; reason?: string }) {
  return (await post<Booking>(`/bookings/${id}/reschedule`, data)).data;
}

// ── Customers ─────────────────────────────────────────────────

export async function getCustomers(params?: Record<string, string>) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return (await get<PaginatedResponse<Customer>>(`/customers${qs}`)).data;
}
export async function getCustomerById(id: string) { return (await get<Customer>(`/customers/${id}`)).data; }
export async function updateCustomerStatus(id: string, data: { status: string; reason?: string }) {
  return (await patch<Customer>(`/customers/${id}/status`, data)).data;
}

// ── Payments ──────────────────────────────────────────────────

export async function getPayments(params?: Record<string, string>) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return (await get<PaginatedResponse<Payment>>(`/payments${qs}`)).data;
}
export async function getPaymentStats() { return (await get<unknown>('/payments/stats')).data; }

// ── Refunds ───────────────────────────────────────────────────

export async function getRefunds(params?: Record<string, string>) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return (await get<PaginatedResponse<Refund>>(`/refunds${qs}`)).data;
}
export async function approveRefund(id: string, data: { adminNotes?: string }) {
  return (await post<Refund>(`/refunds/${id}/approve`, data)).data;
}
export async function rejectRefund(id: string, data: { adminNotes: string }) {
  return (await post<Refund>(`/refunds/${id}/reject`, data)).data;
}
export async function getRefundStats() { return (await get<unknown>('/refunds/stats')).data; }

// ── Tickets ───────────────────────────────────────────────────

export async function getTickets(params?: Record<string, string>) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return (await get<PaginatedResponse<Ticket>>(`/tickets${qs}`)).data;
}
export async function getTicketById(id: string) { return (await get<Ticket & { notes: TicketNote[] }>(`/tickets/${id}`)).data; }
export async function addTicketNote(id: string, data: { content: string; isInternal: boolean }) {
  return (await post<TicketNote>(`/tickets/${id}/notes`, data)).data;
}
export async function updateTicketStatus(id: string, data: { status: string }) {
  return (await patch<Ticket>(`/tickets/${id}/status`, data)).data;
}

// ── CMS ───────────────────────────────────────────────────────

export async function getCmsPages(params?: Record<string, string>) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return (await get<PaginatedResponse<CmsPage>>(`/cms${qs}`)).data;
}
export async function createCmsPage(data: Partial<CmsPage>) { return (await post<CmsPage>('/cms', data)).data; }
export async function updateCmsPage(id: string, data: Partial<CmsPage>) { return (await put<CmsPage>(`/cms/${id}`, data)).data; }
export async function publishCmsPage(id: string) { return (await post<CmsPage>(`/cms/${id}/publish`, {})).data; }
export async function archiveCmsPage(id: string) { return (await post<CmsPage>(`/cms/${id}/archive`, {})).data; }

// ── Analytics ─────────────────────────────────────────────────

export async function getAnalyticsRevenue(params?: Record<string, string>) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return (await get<unknown>(`/analytics/revenue${qs}`)).data;
}
export async function getAnalyticsBookings(params?: Record<string, string>) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return (await get<unknown>(`/analytics/bookings-report${qs}`)).data;
}
export async function exportAnalytics(params: { type: string; format: string; from?: string; to?: string }) {
  const qs = '?' + new URLSearchParams(params as Record<string, string>).toString();
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_access_token') : '';
  const res = await fetch(`${ADMIN_API}/analytics/export${qs}`, {
    credentials: 'include',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `export-${params.type}.${params.format === 'pdf' ? 'txt' : 'csv'}`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Security ──────────────────────────────────────────────────

export async function getSessions() { return (await get<unknown[]>('/security/sessions')).data; }
export async function revokeSession(id: string) { return del<null>(`/security/sessions/${id}`); }
export async function getFailedLogins(params?: Record<string, string>) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return (await get<PaginatedResponse<unknown>>(`/security/failed-logins${qs}`)).data;
}
export async function getSuspiciousActivity() { return (await get<unknown>('/security/suspicious')).data; }
export async function getBlockedIps() { return (await get<unknown[]>('/security/blocked-ips')).data; }
export async function blockIp(data: { ipAddress: string; reason: string; expiresAt?: string }) {
  return (await post<unknown>('/security/block-ip', data)).data;
}
export async function unblockIp(id: string) { return del<null>(`/security/blocked-ips/${id}`); }

// ── Monitoring ────────────────────────────────────────────────

export async function getHealthStatus() { return (await get<unknown>('/monitoring/health')).data; }
export async function getSystemMetrics() { return (await get<unknown>('/monitoring/metrics')).data; }

// ── Notifications ─────────────────────────────────────────────

export async function getNotifications(params?: Record<string, string>) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return (await get<PaginatedResponse<unknown>>(`/notifications${qs}`)).data;
}
export async function getNotificationStats() { return (await get<unknown>('/notifications/stats')).data; }
export async function sendNotification(data: unknown) { return (await post<unknown>('/notifications', data)).data; }

// ── Roles ─────────────────────────────────────────────────────

export async function getRoles() { return (await get<unknown[]>('/roles')).data; }
export async function getAllPermissions() { return (await get<unknown>('/roles/permissions')).data; }
export async function createRole(data: { name: string; description?: string }) { return (await post<unknown>('/roles', data)).data; }
export async function updateRolePermissions(id: string, permissionIds: string[]) { return (await put<unknown>(`/roles/${id}/permissions`, { permissionIds })).data; }
