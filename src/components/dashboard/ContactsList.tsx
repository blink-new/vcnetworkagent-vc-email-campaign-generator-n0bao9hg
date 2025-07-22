import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Input } from "../ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Search, Users, CheckCircle, AlertCircle, ExternalLink } from "lucide-react"
import { VCContact } from '../../types'

interface ContactsListProps {
  contacts: VCContact[]
  onResearchContact: (contact: VCContact) => void
  onResearchAll: () => void
}

export function ContactsList({ contacts, onResearchContact, onResearchAll }: ContactsListProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.firm.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const verifiedCount = contacts.filter(c => c.verified).length
  const unverifiedCount = contacts.length - verifiedCount

  if (contacts.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>VC Contact List ({contacts.length})</span>
            </CardTitle>
            <CardDescription>
              Review and research your VC contacts before generating emails
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
              <CheckCircle className="w-3 h-3 mr-1" />
              {verifiedCount} Verified
            </Badge>
            <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">
              <AlertCircle className="w-3 h-3 mr-1" />
              {unverifiedCount} Pending
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            onClick={onResearchAll}
            disabled={verifiedCount === contacts.length}
            className="ml-4"
          >
            Research All Contacts
          </Button>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Firm</TableHead>
                <TableHead>Focus/Thesis</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-sm text-gray-500">{contact.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{contact.firm}</div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      {contact.focus || contact.thesis ? (
                        <div className="text-sm">
                          {contact.focus && <div className="font-medium">{contact.focus}</div>}
                          {contact.thesis && <div className="text-gray-600">{contact.thesis}</div>}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Not specified</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {contact.verified ? (
                      <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onResearchContact(contact)}
                        disabled={contact.verified}
                      >
                        Research
                      </Button>
                      {contact.linkedin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(contact.linkedin, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredContacts.length === 0 && searchTerm && (
          <div className="text-center py-8 text-gray-500">
            No contacts found matching "{searchTerm}"
          </div>
        )}
      </CardContent>
    </Card>
  )
}