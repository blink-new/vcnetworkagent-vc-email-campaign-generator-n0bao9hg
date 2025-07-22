import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Textarea } from "../ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Alert, AlertDescription } from "../ui/alert"
import { FileText, Download, Send, AlertTriangle, CheckCircle, Edit3 } from "lucide-react"
import { EmailDraft, VCContact } from '../../types'

interface EmailDraftsProps {
  drafts: EmailDraft[]
  contacts: VCContact[]
  onExport: (drafts: EmailDraft[]) => void
}

export function EmailDrafts({ drafts, contacts, onExport }: EmailDraftsProps) {
  const [selectedDraft, setSelectedDraft] = useState<EmailDraft | null>(null)
  const [editedContent, setEditedContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  if (drafts.length === 0) {
    return null
  }

  const getContact = (contactId: string) => contacts.find(c => c.id === contactId)
  
  const averagePersonalization = Math.round(
    drafts.reduce((sum, draft) => sum + draft.personalization_score, 0) / drafts.length
  )
  
  const averageCompliance = Math.round(
    drafts.reduce((sum, draft) => sum + draft.compliance_score, 0) / drafts.length
  )

  const highQualityDrafts = drafts.filter(d => d.personalization_score >= 70 && d.compliance_score >= 80)
  const needsReviewDrafts = drafts.filter(d => d.personalization_score < 70 || d.compliance_score < 80)

  const handleEdit = (draft: EmailDraft) => {
    setSelectedDraft(draft)
    setEditedContent(draft.content)
    setIsEditing(true)
  }

  const saveEdit = () => {
    if (selectedDraft) {
      selectedDraft.content = editedContent
      setIsEditing(false)
      setSelectedDraft(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Generated Email Drafts ({drafts.length})</span>
            </CardTitle>
            <CardDescription>
              Review and edit your personalized email drafts before sending
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">
              {averagePersonalization}% Personalization
            </Badge>
            <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
              {averageCompliance}% Compliance
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-900">{highQualityDrafts.length}</div>
                <div className="text-sm text-green-700">Ready to Send</div>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <div>
                <div className="text-2xl font-bold text-amber-900">{needsReviewDrafts.length}</div>
                <div className="text-sm text-amber-700">Needs Review</div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Send className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-900">{drafts.length}</div>
                <div className="text-sm text-blue-700">Total Drafts</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Drafts ({drafts.length})</TabsTrigger>
            <TabsTrigger value="ready">Ready ({highQualityDrafts.length})</TabsTrigger>
            <TabsTrigger value="review">Needs Review ({needsReviewDrafts.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <DraftsList 
              drafts={drafts} 
              contacts={contacts} 
              onEdit={handleEdit}
            />
          </TabsContent>
          
          <TabsContent value="ready" className="space-y-4">
            <DraftsList 
              drafts={highQualityDrafts} 
              contacts={contacts} 
              onEdit={handleEdit}
            />
          </TabsContent>
          
          <TabsContent value="review" className="space-y-4">
            <DraftsList 
              drafts={needsReviewDrafts} 
              contacts={contacts} 
              onEdit={handleEdit}
            />
          </TabsContent>
        </Tabs>

        {/* Export Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="text-sm text-gray-600">
            Export drafts for your email service provider (ESP)
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => onExport(drafts)}>
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
            <Button onClick={() => onExport(highQualityDrafts)}>
              <Send className="w-4 h-4 mr-2" />
              Export Ready ({highQualityDrafts.length})
            </Button>
          </div>
        </div>

        {/* Edit Modal */}
        {isEditing && selectedDraft && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">
                Edit Email for {getContact(selectedDraft.contact_id)?.name}
              </h3>
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={15}
                className="mb-4"
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={saveEdit}>
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function DraftsList({ 
  drafts, 
  contacts, 
  onEdit 
}: { 
  drafts: EmailDraft[]
  contacts: VCContact[]
  onEdit: (draft: EmailDraft) => void 
}) {
  const getContact = (contactId: string) => contacts.find(c => c.id === contactId)

  return (
    <div className="space-y-4">
      {drafts.map((draft) => {
        const contact = getContact(draft.contact_id)
        if (!contact) return null

        return (
          <div key={draft.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium">{contact.name} - {contact.firm}</h4>
                <p className="text-sm text-gray-500">{contact.email}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant="outline" 
                  className={`${
                    draft.personalization_score >= 70 
                      ? 'text-green-700 border-green-200 bg-green-50'
                      : 'text-amber-700 border-amber-200 bg-amber-50'
                  }`}
                >
                  {draft.personalization_score}% Personal
                </Badge>
                <Badge 
                  variant="outline" 
                  className={`${
                    draft.compliance_score >= 80 
                      ? 'text-green-700 border-green-200 bg-green-50'
                      : 'text-red-700 border-red-200 bg-red-50'
                  }`}
                >
                  {draft.compliance_score}% Compliant
                </Badge>
                <Button variant="outline" size="sm" onClick={() => onEdit(draft)}>
                  <Edit3 className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              </div>
            </div>

            <div className="bg-gray-50 rounded p-3 mb-3">
              <div className="text-sm font-medium text-gray-700 mb-1">Subject:</div>
              <div className="text-sm">{draft.subject}</div>
            </div>

            <div className="bg-gray-50 rounded p-3">
              <div className="text-sm font-medium text-gray-700 mb-2">Email Content:</div>
              <div className="text-sm whitespace-pre-wrap font-mono">{draft.content}</div>
            </div>

            {draft.warnings.length > 0 && (
              <Alert className="mt-3 border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription>
                  <div className="text-amber-800">
                    <div className="font-medium mb-1">Issues to address:</div>
                    <ul className="list-disc list-inside text-sm">
                      {draft.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )
      })}
    </div>
  )
}