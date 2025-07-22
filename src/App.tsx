import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { CSVUpload } from '@/components/dashboard/CSVUpload'
import { ContactsList } from '@/components/dashboard/ContactsList'
import { EmailGenerator } from '@/components/dashboard/EmailGenerator'
import { EmailDrafts } from '@/components/dashboard/EmailDrafts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/hooks/use-toast'
import { blink } from '@/blink/client'
import { VCContact, EmailDraft } from '@/types'
import { Loader2, Brain, Shield, TrendingUp, Users } from 'lucide-react'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [contacts, setContacts] = useState<VCContact[]>([])
  const [emailDrafts, setEmailDrafts] = useState<EmailDraft[]>([])
  const [isResearching, setIsResearching] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const handleContactsUploaded = (uploadedContacts: VCContact[]) => {
    setContacts(uploadedContacts)
    setEmailDrafts([]) // Clear previous drafts
    toast({
      title: "Contacts uploaded successfully",
      description: `${uploadedContacts.length} contacts loaded. Ready for research and verification.`,
    })
  }

  const simulateVCResearch = async (contact: VCContact): Promise<VCContact> => {
    // Simulate AI research with realistic data
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
    
    const focusAreas = [
      'B2B SaaS and enterprise software',
      'Healthcare AI and digital health',
      'Fintech and financial services',
      'Climate tech and sustainability',
      'Developer tools and infrastructure',
      'Consumer marketplaces',
      'Vertical AI solutions',
      'Cybersecurity and data privacy'
    ]
    
    const theses = [
      'AI-first companies transforming traditional industries',
      'Vertical software solutions with embedded fintech',
      'Infrastructure for the next generation of developers',
      'Consumer brands built for Gen Z',
      'B2B marketplaces in underserved verticals'
    ]

    const recentDeals = [
      'recent investment in AI-powered legal tech',
      'Series A in healthcare automation platform',
      'seed round in developer productivity tools',
      'investment in climate data analytics',
      'funding round in B2B marketplace'
    ]

    return {
      ...contact,
      focus: contact.focus || focusAreas[Math.floor(Math.random() * focusAreas.length)],
      thesis: contact.thesis || theses[Math.floor(Math.random() * theses.length)],
      research_notes: recentDeals[Math.floor(Math.random() * recentDeals.length)],
      verified: true
    }
  }

  const handleResearchContact = async (contact: VCContact) => {
    setIsResearching(true)
    try {
      const researchedContact = await simulateVCResearch(contact)
      setContacts(prev => prev.map(c => 
        c.id === contact.id ? researchedContact : c
      ))
      toast({
        title: "Research completed",
        description: `Updated information for ${contact.name}`,
      })
    } catch (error) {
      toast({
        title: "Research failed",
        description: "Unable to research contact. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsResearching(false)
    }
  }

  const handleResearchAll = async () => {
    const unverifiedContacts = contacts.filter(c => !c.verified)
    if (unverifiedContacts.length === 0) return

    setIsResearching(true)
    try {
      const researchPromises = unverifiedContacts.map(contact => simulateVCResearch(contact))
      const researchedContacts = await Promise.all(researchPromises)
      
      setContacts(prev => prev.map(contact => {
        const researched = researchedContacts.find(r => r.id === contact.id)
        return researched || contact
      }))
      
      toast({
        title: "Bulk research completed",
        description: `Researched ${unverifiedContacts.length} contacts successfully`,
      })
    } catch (error) {
      toast({
        title: "Bulk research failed",
        description: "Some contacts could not be researched. Please try individual research.",
        variant: "destructive"
      })
    } finally {
      setIsResearching(false)
    }
  }

  const handleEmailsGenerated = (drafts: EmailDraft[]) => {
    setEmailDrafts(drafts)
    toast({
      title: "Emails generated successfully",
      description: `${drafts.length} personalized emails ready for review`,
    })
  }

  const handleExportDrafts = (drafts: EmailDraft[]) => {
    // Create CSV export
    const csvData = drafts.map(draft => {
      const contact = contacts.find(c => c.id === draft.contact_id)
      return {
        'Recipient Email': contact?.email || '',
        'Recipient Name': contact?.name || '',
        'Firm': contact?.firm || '',
        'Subject': draft.subject,
        'Email Content': draft.content.replace(/\n/g, '\\n'),
        'Personalization Score': draft.personalization_score,
        'Compliance Score': draft.compliance_score
      }
    })

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vc-email-campaign-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Export successful",
      description: `${drafts.length} email drafts exported to CSV`,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading VCNetworkAgent...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-lg mx-auto mb-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <CardTitle>Welcome to VCNetworkAgent</CardTitle>
            <CardDescription>
              AI-powered personalized VC-to-VC email campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => blink.auth.login()} 
              className="w-full"
            >
              Sign In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const verifiedCount = contacts.filter(c => c.verified).length
  const totalContacts = contacts.length

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.email}
          </h1>
          <p className="text-gray-600">
            Generate compliant, personalized VC-to-VC outreach emails that maximize reply rates
          </p>
        </div>

        {/* Stats Overview */}
        {totalContacts > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold">{totalContacts}</div>
                    <div className="text-sm text-gray-500">Total Contacts</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold">{verifiedCount}</div>
                    <div className="text-sm text-gray-500">Researched</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                  <div>
                    <div className="text-2xl font-bold">{emailDrafts.length}</div>
                    <div className="text-sm text-gray-500">Email Drafts</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold">100%</div>
                    <div className="text-sm text-gray-500">Compliant</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Research Progress */}
        {isResearching && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Brain className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI is researching VC contacts and verifying information...</span>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="space-y-8">
          {/* Step 1: Upload Contacts */}
          <CSVUpload onContactsUploaded={handleContactsUploaded} />

          {/* Step 2: Review and Research Contacts */}
          {contacts.length > 0 && (
            <ContactsList 
              contacts={contacts}
              onResearchContact={handleResearchContact}
              onResearchAll={handleResearchAll}
            />
          )}

          {/* Step 3: Generate Emails */}
          {verifiedCount > 0 && (
            <EmailGenerator 
              contacts={contacts}
              onEmailsGenerated={handleEmailsGenerated}
            />
          )}

          {/* Step 4: Review and Export Drafts */}
          {emailDrafts.length > 0 && (
            <EmailDrafts 
              drafts={emailDrafts}
              contacts={contacts}
              onExport={handleExportDrafts}
            />
          )}
        </div>

        {/* Best Practices Footer */}
        <div className="mt-12 bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">📧 VC Outreach Best Practices</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Sending Strategy</h4>
              <ul className="space-y-1">
                <li>• Start with 50-100 emails/day, ramp up gradually</li>
                <li>• Warm up your domain for 1-2 weeks</li>
                <li>• Target 5-10% reply rate for VC outreach</li>
                <li>• Monitor spam complaints (&lt;0.1%)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Compliance</h4>
              <ul className="space-y-1">
                <li>• Always include unsubscribe link</li>
                <li>• Add physical address (CAN-SPAM)</li>
                <li>• Keep emails 50-125 words</li>
                <li>• Use clear, non-misleading subject lines</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Toaster />
    </div>
  )
}

export default App