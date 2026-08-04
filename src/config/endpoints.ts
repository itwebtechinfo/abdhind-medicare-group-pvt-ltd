/** Single source of truth for backend endpoint paths, grouped by domain. */
export const API_ENDPOINTS = {
  auth: {
    login: "/api/v1/auth/login",
    refresh: "/api/v1/auth/refresh",
    logout: "/api/v1/auth/logout",
    me: "/api/v1/auth/me",
  },
  users: {
    /** GET: list users. POST: create a user. */
    list: "/api/v1/users",
    /** GET: user detail. PATCH: partial update. */
    detail: (id: string) => `/api/v1/users/${id}`,
    deactivate: (id: string) => `/api/v1/users/${id}/deactivate`,
    activate: (id: string) => `/api/v1/users/${id}/activate`,
  },
  patients: {
    /** GET: list patients. POST: create a patient. */
    list: "/api/v1/patients",
    /** GET: patient + their appointment history. PATCH: partial update. */
    detail: (id: string) => `/api/v1/patients/${id}`,
    /** POST: public, unauthenticated — sends a WhatsApp OTP for self-signup. */
    signupOtpRequest: "/api/v1/patients/signup/otp/request",
    /** POST: public, unauthenticated — creates the patient's account + login in one call. */
    signup: "/api/v1/patients/signup",
  },
  me: {
    /** GET: authenticated patient's own record + appointment history. `patient` is null if never booked. */
    patient: "/api/v1/me/patient",
  },
  departments: {
    /** GET: list departments. POST: create a department. */
    list: "/api/v1/departments",
  },
  doctors: {
    /** GET: list doctors. POST: create a doctor. */
    list: "/api/v1/doctors",
    /** GET: doctor detail. PATCH: partial update. */
    detail: (id: string) => `/api/v1/doctors/${id}`,
    leaves: (id: string) => `/api/v1/doctors/${id}/leaves`,
    leave: (id: string, leaveId: string) => `/api/v1/doctors/${id}/leaves/${leaveId}`,
    slots: (id: string) => `/api/v1/doctors/${id}/slots`,
    generateSlots: (id: string) => `/api/v1/doctors/${id}/slots/generate`,
  },
  appointments: {
    /** GET: list (filters: status, date, doctor_id, no_show). POST: staff books on patient's behalf. */
    list: "/api/v1/appointments",
    detail: (id: string) => `/api/v1/appointments/${id}`,
    complete: (id: string) => `/api/v1/appointments/${id}/complete`,
    cancel: (id: string) => `/api/v1/appointments/${id}/cancel`,
    auditLog: (id: string) => `/api/v1/appointments/${id}/audit-log`,
    followUp: (id: string) => `/api/v1/appointments/${id}/follow-up`,
    dispense: (id: string) => `/api/v1/appointments/${id}/dispense`,
    labOrders: (id: string) => `/api/v1/appointments/${id}/lab-orders`,
  },
  public: {
    doctors: "/api/v1/public/doctors",
    slots: (doctorId: string) => `/api/v1/public/doctors/${doctorId}/slots`,
    otpRequest: "/api/v1/appointments/public/otp/request",
    book: "/api/v1/appointments/public",
  },
  /** Root-level, not under /api/v1. */
  doctorQuick: {
    pending: "/doctor/pending",
    approve: "/doctor/approve",
    exitHumanMode: "/doctor/exit-human-mode",
  },
  dashboard: {
    today: "/api/v1/dashboard/today",
  },
  medicines: {
    /** GET: list. POST: create. */
    list: "/api/v1/medicines",
    /** PATCH: partial update. */
    detail: (id: string) => `/api/v1/medicines/${id}`,
  },
  labTests: {
    /** GET: list. POST: create. */
    list: "/api/v1/lab-tests",
    /** PATCH: partial update. */
    detail: (id: string) => `/api/v1/lab-tests/${id}`,
  },
  labOrders: {
    /** POST: multipart/form-data, fields "result_text"/"result_file". Sets status to COMPLETED. */
    result: (orderId: string) => `/api/v1/lab-orders/${orderId}/result`,
  },
  reports: {
    noShowRate: "/api/v1/reports/no-show-rate",
    doctorLoad: "/api/v1/reports/doctor-load",
    followUpConversion: "/api/v1/reports/follow-up-conversion",
  },
  feedback: {
    list: "/api/v1/feedback",
  },
  uploads: {
    /** GET, public — subFolder/fileName from a stored "uploads/<subFolder>/<fileName>" path. */
    file: (subFolder: string, fileName: string) => `/api/v1/uploads/${subFolder}/${fileName}`,
  },
  whatsapp: {
    /** GET: chat list (query: unread_only, human_mode, search, tag, limit, offset). */
    conversations: "/api/v1/whatsapp/conversations",
    /** GET: chat history (query: before, limit). */
    messages: (phone: string) => `/api/v1/whatsapp/conversations/${encodeURIComponent(phone)}/messages`,
    /** POST: multipart/form-data — send a reply (text and/or file). */
    send: (phone: string) => `/api/v1/whatsapp/conversations/${encodeURIComponent(phone)}/send`,
    /** POST: no body — flips delivered inbound messages to read. */
    read: (phone: string) => `/api/v1/whatsapp/conversations/${encodeURIComponent(phone)}/read`,
    /** POST: no body — assign conversation to caller, disable bot. */
    takeover: (phone: string) => `/api/v1/whatsapp/conversations/${encodeURIComponent(phone)}/takeover`,
    /** POST: no body — re-enable bot for the conversation. */
    release: (phone: string) => `/api/v1/whatsapp/conversations/${encodeURIComponent(phone)}/release`,
    /** POST: { text } — add a staff-only internal note. */
    note: (phone: string) => `/api/v1/whatsapp/conversations/${encodeURIComponent(phone)}/note`,
    /** PUT: { tags: string[] } — replaces the full tag set. */
    tags: (phone: string) => `/api/v1/whatsapp/conversations/${encodeURIComponent(phone)}/tags`,
    /** POST: no body — resend a failed outbound message. */
    retry: (phone: string, messageId: string) =>
      `/api/v1/whatsapp/conversations/${encodeURIComponent(phone)}/messages/${messageId}/retry`,
    /** GET: query `q` (required), `limit` — search within a chat. */
    search: (phone: string) => `/api/v1/whatsapp/conversations/${encodeURIComponent(phone)}/messages/search`,
    /** GET: staff action trail for a conversation. */
    auditLog: (phone: string) => `/api/v1/whatsapp/conversations/${encodeURIComponent(phone)}/audit-log`,
    /** GET: plain-text transcript download. */
    export: (phone: string) => `/api/v1/whatsapp/conversations/${encodeURIComponent(phone)}/export`,
    /** GET: local template cache (query: status). POST not here — see templatesSync. */
    templates: "/api/v1/whatsapp/templates",
    /** POST: no body, admin/system_admin only — refresh templates from Meta. */
    templatesSync: "/api/v1/whatsapp/templates/sync",
    /** POST: create a bulk (or scheduled) template broadcast job, admin/system_admin only.
     *  GET (same URL): list broadcast jobs, newest first. */
    broadcast: "/api/v1/whatsapp/broadcast",
    /** POST: dry-run recipient resolution — count + sample only, no job created. */
    broadcastPreview: "/api/v1/whatsapp/broadcast/preview",
    /** GET: broadcast job status (poll while status is "scheduled"/"pending"/"running"). */
    broadcastJob: (jobId: string) => `/api/v1/whatsapp/broadcast/${jobId}`,
    /** POST: multipart/form-data, admin/system_admin only — submit a new template to Meta for approval.
     *  GET (same URL): list submitted template requests, newest first. */
    templateRequests: "/api/v1/whatsapp/templates/requests",
    /** GET: poll a single template request's approval status. */
    templateRequest: (requestId: string) => `/api/v1/whatsapp/templates/requests/${requestId}`,
    /** POST: no body — re-submit a SUBMIT_FAILED request using its stored fields. */
    templateRequestRetry: (requestId: string) => `/api/v1/whatsapp/templates/requests/${requestId}/retry`,
    /** GET: boolean-only WhatsApp env var status, admin/system_admin only. */
    configStatus: "/api/v1/whatsapp/config-status",
    /** GET: query `since` (epoch ms) — counts of unseen approvals/rejections/completions. */
    activitySummary: "/api/v1/whatsapp/activity-summary",
    /** GET: module-level (conversation_id: null) activity feed, newest first, capped at 30. */
    globalAuditLog: "/api/v1/whatsapp/audit-log",
  },
} as const;
