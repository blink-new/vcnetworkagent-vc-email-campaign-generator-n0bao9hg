export interface VCContact {
  id: string
  email: string
  name: string
  firm: string
  focus?: string
  thesis?: string
  recent_deals?: string
  linkedin?: string
  verified: boolean
  research_notes?: string
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  variables: string[]
  compliance_checked: boolean
}

export interface Campaign {
  id: string
  name: string
  template_id: string
  contacts: VCContact[]
  status: 'draft' | 'processing' | 'ready' | 'sent'
  created_at: string
  sender_name: string
  sender_firm: string
  sender_email: string
  sender_address?: string
}

export interface EmailDraft {
  id: string
  contact_id: string
  subject: string
  content: string
  personalization_score: number
  compliance_score: number
  warnings: string[]
}

export interface ComplianceCheck {
  has_unsubscribe: boolean
  has_physical_address: boolean
  word_count: number
  link_count: number
  spam_score: number
  warnings: string[]
  passed: boolean
}