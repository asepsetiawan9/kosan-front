export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'penyewa';
  must_change_password: boolean;
  created_at?: string;
}

export interface Facility {
  id: string;
  name: string;
  icon_identifier?: string;
  category: 'kamar' | 'kamar_mandi' | 'umum';
  created_at?: string;
}

export interface RoomImage {
  id: string;
  image_path: string;
  is_primary: boolean;
  order: number;
}

export interface Room {
  id: string;
  room_number: string;
  name: string;
  type: 'standar' | 'deluxe' | 'vip' | 'paviliun';
  base_price: number;
  description?: string;
  status: 'kosong' | 'dipesan' | 'terisi' | 'maintenance';
  primary_image?: string;
  images?: RoomImage[];
  facilities?: Facility[];
  active_tenancy?: {
    id: string;
    tenant_name: string;
    tenant_phone: string;
    start_date: string;
  } | null;
  created_at?: string;
}

export interface Tenancy {
  id: string;
  room_id: string;
  user_id?: string;
  tenant_name: string;
  tenant_phone: string;
  tenant_email?: string;
  start_date: string;
  end_date?: string;
  billing_due_day: number;
  deposit_amount: number;
  deposit_status: 'ditahan' | 'dikembalikan' | 'dipotong';
  status: 'aktif' | 'selesai' | 'dibatalkan';
  deposit_deduction?: number;
  deduction_reason?: string;
  checkout_date?: string;
  room?: Room;
  invoices?: Invoice[];
  created_at?: string;
}

export interface InvoiceItem {
  id?: string;
  description: string;
  amount: number;
  item_type: 'sewa' | 'deposit' | 'listrik' | 'air' | 'denda' | 'lain_lain';
}

export interface Invoice {
  id: string;
  tenancy_id: string;
  invoice_number: string;
  period: string;
  total_amount: number;
  paid_amount: number;
  status: 'belum_bayar' | 'sebagian_dibayar' | 'menunggu_verifikasi' | 'lunas' | 'terlambat' | 'dibatalkan';
  due_date: string;
  tenancy?: Tenancy;
  items?: InvoiceItem[];
  created_at?: string;
}

export interface Booking {
  id: string;
  room_id: string;
  name: string;
  phone: string;
  email?: string | null;
  requested_move_in: string;
  status: 'menunggu' | 'disetujui' | 'ditolak' | 'dibatalkan';
  rejection_reason?: string | null;
  expires_at: string;
  created_at: string;
  ktp_preview_url?: string | null;
  room?: {
    id: string;
    room_number: string;
    name: string;
    type: string;
    base_price: number;
    status: string;
    primary_image?: string;
  };
}

export type ComplaintCategory = 'fasilitas_rusak' | 'kebersihan' | 'keamanan' | 'lainnya';
export type ComplaintStatus = 'baru' | 'diproses' | 'selesai';

export interface Complaint {
  id: string;
  tenancy_id: string;
  category: ComplaintCategory;
  description: string;
  photo?: string | null;
  photo_url?: string | null;
  status: ComplaintStatus;
  admin_response?: string | null;
  resolved_at?: string | null;
  created_at?: string;
  tenancy?: {
    id: string;
    tenant_name: string;
    tenant_phone: string;
    tenant_email?: string;
    room?: {
      id: string;
      room_number: string;
      name: string;
      type: string;
    } | null;
  };
}

export interface TenantProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  must_change_password: boolean;
  has_active_tenancy: boolean;
  active_tenancy?: {
    id: string;
    start_date?: string;
    end_date?: string;
    billing_due_day: number;
    deposit_amount: number;
    deposit_status: string;
    status: string;
    room?: {
      id: string;
      room_number: string;
      name: string;
      type: string;
      base_price: number;
      facilities?: Facility[];
    } | null;
  } | null;
  stats?: {
    unpaid_invoices_count: number;
    total_unpaid_amount: number;
    pending_complaints_count: number;
  };
  created_at?: string;
}

export type PaymentMethod = 'gateway' | 'manual_transfer';
export type PaymentStatus = 'pending' | 'success' | 'failed';

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  method: PaymentMethod;
  gateway_provider?: string | null;
  gateway_transaction_id?: string | null;
  proof_url?: string | null;
  status: PaymentStatus;
  verified_at?: string | null;
  verified_by?: {
    id: string;
    name: string;
    email: string;
  } | null;
  notes?: string | null;
  created_at?: string;
  invoice?: {
    id: string;
    invoice_number: string;
    period: string;
    total_amount: number;
    paid_amount: number;
    status: string;
    due_date: string;
    tenancy?: {
      id: string;
      tenant_name: string;
      tenant_phone: string;
      tenant_email?: string;
      room?: {
        id: string;
        room_number: string;
        name: string;
        type: string;
      } | null;
    } | null;
  };
}

export type ContractStatus = 'draf' | 'dikirim' | 'ditandatangani';

export interface Contract {
  id: string;
  tenancy_id: string;
  contract_number: string;
  status: ContractStatus;
  signed_at?: string | null;
  is_signed: boolean;
  stream_url: string;
  created_at: string;
  tenancy?: {
    id: string;
    tenant_name: string;
    tenant_phone: string;
    tenant_email?: string;
    start_date: string;
    end_date?: string;
    billing_due_day: number;
    deposit_amount: number;
    deposit_status: string;
    room?: {
      id: string;
      room_number: string;
      type: string;
      price: number;
    } | null;
  };
}

export interface FinancialSummary {
  period: {
    month: number;
    year: number;
    label: string;
  };
  metrics: {
    total_income: number;
    pending_receivables: number;
    occupancy_rate: number;
    total_rooms: number;
    occupied_rooms: number;
  };
  category_breakdown: Array<{
    type: string;
    name: string;
    amount: number;
    percentage: number;
  }>;
  cashflow_trend: Array<{
    month: string;
    short_month: string;
    income: number;
    invoiced: number;
  }>;
  transactions_count: number;
}


