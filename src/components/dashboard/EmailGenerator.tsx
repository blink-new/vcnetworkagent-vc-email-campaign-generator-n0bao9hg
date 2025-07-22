import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Badge } from "../ui/badge"
import { Alert, AlertDescription } from "../ui/alert"
import { Separator } from "../ui/separator"
import { Mail, Wand2, Shield, AlertTriangle, CheckCircle } from "lucide-react"
import { VCContact, EmailDraft, ComplianceCheck } from '../../types'

interface EmailGeneratorProps {
  contacts: VCContact[]
  onEmailsGenerated: (drafts: EmailDraft[]) => void
}

const DEFAULT_TEMPLATE = `Hi {{Name}},

Hope you're doing well. I'm {{SenderName}} from {{SenderFirm}}. We write $1–3M seed and early-stage checks into B2B vertical-AI companies in legacy industries such as healthcare, legal, and fintech, and we currently hold several active board seats.

I'd love to introduce myself, hear more about your {{Focus}} at {{Firm}}, and swap notes on your pipeline.

Would you be open to chatting sometime in the next couple of weeks?

Best,
{{SenderName}}
{{SenderTitle}}
{{SenderFirm}}
{{SenderEmail}}

[Unsubscribe] | {{SenderAddress}}`

export function EmailGenerator({ contacts, onEmailsGenerated }: EmailGeneratorProps) {
  const [senderInfo, setSenderInfo] = useState({
    name: '',
    title: '',
    firm: '',
    email: '',
    address: ''
  })
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE)
  const [subject, setSubject] = useState('Quick VC networking chat?')
  const [isGenerating, setIsGenerating] = useState(false)
  const [complianceCheck, setComplianceCheck] = useState<ComplianceCheck | null>(null)

  const verifiedContacts = contacts.filter(c => c.verified)

  const checkCompliance = (content: string): ComplianceCheck => {
    const hasUnsubscribe = content.toLowerCase().includes('unsubscribe')
    const hasPhysicalAddress = content.includes('{{SenderAddress}}') || senderInfo.address.length > 0
    const wordCount = content.split(/\s+/).length
    const linkCount = (content.match(/https?:\/\/[^\s]+/g) || []).length
    
    const warnings: string[] = []
    if (!hasUnsubscribe) warnings.push('Missing unsubscribe link')
    if (!hasPhysicalAddress) warnings.push('Missing physical address')
    if (wordCount > 125) warnings.push(`Email too long (${wordCount} words, recommended: 50-125)`)
    if (linkCount > 2) warnings.push(`Too many links (${linkCount}, recommended: 1-2)`)
    
    const spamScore = warnings.length * 25
    const passed = warnings.length === 0

    return {
      has_unsubscribe: hasUnsubscribe,
      has_physical_address: hasPhysicalAddress,
      word_count: wordCount,
      link_count: linkCount,
      spam_score: spamScore,
      warnings,
      passed
    }
  }

  const generateEmails = async () => {
    if (verifiedContacts.length === 0) {
      alert('Please verify at least one contact before generating emails')
      return
    }

    if (!senderInfo.name || !senderInfo.firm || !senderInfo.email) {
      alert('Please fill in all sender information')
      return
    }

    setIsGenerating(true)

    try {
      const drafts: EmailDraft[] = verifiedContacts.map((contact, index) => {
        let personalizedContent = template
          .replace(/{{Name}}/g, contact.name)
          .replace(/{{Firm}}/g, contact.firm)
          .replace(/{{Focus}}/g, contact.focus || contact.thesis || 'investment focus')
          .replace(/{{SenderName}}/g, senderInfo.name)
          .replace(/{{SenderTitle}}/g, senderInfo.title)
          .replace(/{{SenderFirm}}/g, senderInfo.firm)
          .replace(/{{SenderEmail}}/g, senderInfo.email)
          .replace(/{{SenderAddress}}/g, senderInfo.address)

        // Add personalization based on research
        if (contact.research_notes) {
          personalizedContent = personalizedContent.replace(
            'and swap notes on your pipeline.',
            `and swap notes on your pipeline, especially given your ${contact.research_notes}.`
          )
        }

        const compliance = checkCompliance(personalizedContent)
        const personalizationScore = Math.min(100, 
          (contact.focus ? 25 : 0) + 
          (contact.thesis ? 25 : 0) + 
          (contact.research_notes ? 30 : 0) + 
          20 // base score
        )

        return {
          id: `draft_${index + 1}`,
          contact_id: contact.id,
          subject: subject.replace(/{{Name}}/g, contact.name).replace(/{{Firm}}/g, contact.firm),
          content: personalizedContent,
          personalization_score: personalizationScore,
          compliance_score: compliance.passed ? 100 : Math.max(0, 100 - compliance.warnings.length * 25),
          warnings: compliance.warnings
        }
      })

      onEmailsGenerated(drafts)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleTemplateChange = (value: string) => {
    setTemplate(value)
    setComplianceCheck(checkCompliance(value))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail className="w-5 h-5" />
          <span>Email Generator</span>
        </CardTitle>
        <CardDescription>
          Configure sender information and email template to generate personalized outreach emails
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sender Information */}
        <div>
          <h3 className="text-lg font-medium mb-4">Sender Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sender-name">Your Name *</Label>
              <Input
                id="sender-name"
                value={senderInfo.name}
                onChange={(e) => setSenderInfo(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Mahira Patel"
              />
            </div>
            <div>
              <Label htmlFor="sender-title">Your Title</Label>
              <Input
                id="sender-title"
                value={senderInfo.title}
                onChange={(e) => setSenderInfo(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Partner"
              />
            </div>
            <div>
              <Label htmlFor="sender-firm">Your Firm *</Label>
              <Input
                id="sender-firm"
                value={senderInfo.firm}
                onChange={(e) => setSenderInfo(prev => ({ ...prev, firm: e.target.value }))}
                placeholder="e.g., Inertia Ventures"
              />
            </div>
            <div>
              <Label htmlFor="sender-email">Your Email *</Label>
              <Input
                id="sender-email"
                type="email"
                value={senderInfo.email}
                onChange={(e) => setSenderInfo(prev => ({ ...prev, email: e.target.value }))}
                placeholder="e.g., mahira@inertia.vc"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="sender-address">Physical Address (CAN-SPAM Compliance)</Label>
              <Input
                id="sender-address"
                value={senderInfo.address}
                onChange={(e) => setSenderInfo(prev => ({ ...prev, address: e.target.value }))}
                placeholder="e.g., 123 Main St, San Francisco, CA 94105"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Email Template */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Email Template</h3>
            <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">
              50-125 words recommended
            </Badge>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="email-subject">Subject Line</Label>
              <Input
                id="email-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Quick VC networking chat?"
              />
            </div>
            
            <div>
              <Label htmlFor="email-template">Email Content</Label>
              <Textarea
                id="email-template"
                value={template}
                onChange={(e) => handleTemplateChange(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
              <div className="text-xs text-gray-500 mt-2">
                Available variables: {{Name}}, {{Firm}}, {{Focus}}, {{SenderName}}, {{SenderTitle}}, {{SenderFirm}}, {{SenderEmail}}, {{SenderAddress}}
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Check */}
        {complianceCheck && (
          <Alert className={complianceCheck.passed ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}>
            {complianceCheck.passed ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            )}
            <AlertDescription>
              <div className="space-y-2">
                <div className="flex items-center space-x-4 text-sm">
                  <span>Words: {complianceCheck.word_count}</span>
                  <span>Links: {complianceCheck.link_count}</span>
                  <span>Spam Score: {complianceCheck.spam_score}%</span>
                </div>
                {complianceCheck.warnings.length > 0 && (
                  <div>
                    <div className="font-medium text-amber-800 mb-1">Compliance Issues:</div>
                    <ul className="list-disc list-inside text-sm text-amber-700">
                      {complianceCheck.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Generate Button */}
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-600">
            Ready to generate emails for {verifiedContacts.length} verified contacts
          </div>
          <Button 
            onClick={generateEmails}
            disabled={isGenerating || verifiedContacts.length === 0}
            className="flex items-center space-x-2"
          >
            <Wand2 className="w-4 h-4" />
            <span>{isGenerating ? 'Generating...' : 'Generate Emails'}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}