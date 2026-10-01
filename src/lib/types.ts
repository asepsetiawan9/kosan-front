export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  nik?: string;
  wa_number?: string | null;
  wa_opt_in?: boolean;
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
  url?: string;
  media_type?: 'image' | 'video';
  video_thumbnail_path?: string | null;
  video_thumbnail_url?: string | null;
  video_duration?: number | null;
  is_primary: boolean;
  order: number;
}

export interface PropertyMedia {
  id: string;
  property_id: string;
  media_type: 'image' | 'video';
  file_path: string;
  url: string;
  thumbnail_path?: string | null;
  thumbnail_url?: string | null;
  title?: string | null;
  description?: string | null;
  sort_order: number;
  is_featured: boolean;
  created_at?: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  city?: string | null;
  province?: string | null;
  postal_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  google_maps_url?: string | null;
  owner_name: string;
  owner_phone?: string | null;
  owner_email?: string | null;
  managed_by?: string | null;
  total_rooms?: number;
  available_rooms?: number;
  occupied_rooms?: number;
  min_price?: number | null;
  max_price?: number | null;
  media?: PropertyMedia[];
  featured_media?: PropertyMedia[];
  rooms?: Room[];
  facilities?: Facility[];
  created_at?: string;
  updated_at?: string;
}

export interface Room {
  id: string;
  property_id?: string | null;
  property?: Property | {
    id: string;
    name: string;
    city?: string | null;
    address?: string | null;
    google_maps_url?: string | null;
  } | null;
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

export type DocumentType = 'ktp' | 'kk' | 'sim' | 'lainnya';

export interface TenantDocument {
  id: string;
  user_id: string;
  document_type: DocumentType;
  original_filename?: string;
  mime_type?: string;
  file_size?: number;
  is_verified: boolean;
  verified_at?: string | null;
  verified_by?: {
    id: string;
    name: string;
  } | null;
  notes?: string | null;
  stream_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface TenantProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  nik?: string;
  role: string;
  must_change_password: boolean;
  has_active_tenancy: boolean;
  documents?: TenantDocument[];
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
  source?: 'whatsapp' | 'manual_admin' | 'web';
  gateway_provider?: string | null;
  gateway_transaction_id?: string | null;
  proof_url?: string | null;
  proof_mime?: string | null;
  proof_size?: number | null;
  proof_sha256?: string | null;
  claimed_amount?: number | null;
  is_duplicate_suspect?: boolean;
  reject_reason?: string | null;
  wa_message_id?: string | null;
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

export interface WaPaymentVerifyPayload {
  action: 'approve' | 'reject';
  notes?: string;
  reject_reason?: string;
}

export interface WaManualPaymentPayload {
  invoice_id: string;
  amount: number;
  notes?: string;
  auto_approve?: boolean;
  proof_file?: File;
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

export type WaMessageStatus = 'queued' | 'sent' | 'failed' | 'delivered' | 'received' | 'processed' | 'ignored';

export interface WaMessage {
  id: string;
  direction: 'in' | 'out';
  phone: string;
  phone_display: string;
  provider: string;
  provider_message_id?: string | null;
  type: 'text' | 'image' | 'document' | 'other';
  body?: string | null;
  template_key?: string | null;
  status: WaMessageStatus;
  error_message?: string | null;
  attempts: number;
  sent_at?: string | null;
  created_at: string;
  tenant?: {
    id: string;
    name: string;
    email: string;
    room_number?: string | null;
  } | null;
}

export interface WaTemplate {
  id: string;
  key: string;
  title: string;
  body: string;
  is_active: boolean;
  updated_at: string;
}

export interface WaAntiBanStatus {
  hourly_count: number;
  hourly_max: number;
  daily_count: number;
  daily_max: number;
  is_within_business_hours: boolean;
  business_hours: string;
  circuit_breaker_open: boolean;
  consecutive_failures: number;
  circuit_breaker_threshold: number;
  delay_range: string;
  is_sending_allowed: boolean;
}

export interface WaConnectionStatus {
  status: 'connected' | 'disconnected' | 'error';
  provider: string;
  device?: string | null;
  phone?: string | null;
  device_status?: string;
  quota?: string;
  expired?: string | null;
  is_configured: boolean;
  message?: string;
  sent_last_24h: number;
  failed_last_24h: number;
  has_high_failure_rate: boolean;
  webhook_url: string;
  webhook_secret_set: boolean;
  send_delay: {
    min: number;
    max: number;
  };
  antiban?: WaAntiBanStatus;
}

export interface WaTestSendPayload {
  phone: string;
  message?: string;
  template_key?: string;
  template_params?: Record<string, string>;
}

export type WaTriggerType = 'before_due' | 'on_due' | 'after_due';

export interface WaReminderRule {
  id: string;
  name: string;
  trigger_type: WaTriggerType;
  offset_days: number;
  send_time: string;
  template_key: string;
  template_title?: string;
  is_active: boolean;
  logs_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface WaReminderLog {
  id: string;
  invoice_id: string;
  invoice_number?: string;
  period?: string;
  invoice_due_date?: string;
  total_amount?: number;
  remaining_amount?: number;
  tenant_name?: string;
  tenant_phone?: string;
  room_number?: string;
  rule_id: string;
  rule_name?: string;
  template_key?: string;
  sent_for_date: string;
  wa_message_id?: string | null;
  wa_message_status?: WaMessageStatus | null;
  wa_message_body?: string | null;
  created_at: string;
}

export interface WaReminderDryRunItem {
  invoice_id: string;
  invoice_number: string;
  tenant_name: string;
  phone: string;
  rule_name: string;
  template_key: string;
  due_date: string;
  nominal?: string;
  status: 'ready' | 'skipped' | 'sent';
  skip_reason?: 'already_sent' | 'pending_payment' | 'opted_out';
  message?: string;
  preview_body?: string;
}

export interface WaReminderDryRunResult {
  target_date: string;
  dry_run: boolean;
  rules_evaluated: number;
  invoices_checked: number;
  reminders_sent: number;
  skipped: {
    already_sent: number;
    pending_payment: number;
    opted_out: number;
  };
  items: WaReminderDryRunItem[];
}

export interface WaReminderSummary {
  total_rules: number;
  active_rules: number;
  reminders_sent_today: number;
  timezone: string;
}

export interface WaHealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  execution_time_ms: number;
  checks: {
    provider: {
      status: 'ok' | 'error';
      connected: boolean;
      provider: string;
      device?: string | null;
      phone?: string | null;
      quota?: string | null;
      message: string;
    };
    database: {
      status: 'ok' | 'error';
      driver: string;
      latency_ms: number | null;
      message: string;
    };
    queue: {
      status: 'ok' | 'warning' | 'error';
      driver: string;
      pending_jobs: number;
      failed_jobs: number;
      queued_messages: number;
      message: string;
    };
    messages: {
      status: 'ok' | 'warning' | 'error';
      sent_last_24h: number;
      failed_last_24h: number;
      total_last_24h: number;
      failure_rate_percent: number;
      high_failure_alert: boolean;
      message: string;
    };
    scheduler: {
      status: 'ok' | 'warning' | 'error';
      active_rules_count: number;
      active_conversations_count: number;
      last_reminder_run_at?: string | null;
      message: string;
    };
  };
  system: {
    app_env: string;
    app_url: string;
    timezone: string;
    php_version: string;
    laravel_version: string;
  };
}





