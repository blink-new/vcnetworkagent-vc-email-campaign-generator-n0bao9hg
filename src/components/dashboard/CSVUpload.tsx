import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Alert, AlertDescription } from "../ui/alert"
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react"
import Papa from 'papaparse'
import { VCContact } from '../../types'

interface CSVUploadProps {
  onContactsUploaded: (contacts: VCContact[]) => void
}

export function CSVUpload({ onContactsUploaded }: CSVUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | 'warning' | null
    message: string
  }>({ type: null, message: '' })

  const processCSV = useCallback((file: File) => {
    setIsProcessing(true)
    setUploadStatus({ type: null, message: '' })

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const contacts: VCContact[] = results.data.map((row: any, index: number) => ({
            id: `contact_${index + 1}`,
            email: row.email || row.Email || '',
            name: row.name || row.Name || row['First Name'] + ' ' + row['Last Name'] || '',
            firm: row.firm || row.Firm || row.Company || '',
            focus: row.focus || row.Focus || row['Investment Focus'] || '',
            thesis: row.thesis || row.Thesis || row['Investment Thesis'] || '',
            recent_deals: row.recent_deals || row['Recent Deals'] || '',
            linkedin: row.linkedin || row.LinkedIn || row['LinkedIn URL'] || '',
            verified: false,
            research_notes: ''
          })).filter(contact => contact.email && contact.name)

          if (contacts.length === 0) {
            setUploadStatus({
              type: 'error',
              message: 'No valid contacts found. Please ensure your CSV has email and name columns.'
            })
          } else {
            const duplicates = contacts.length - new Set(contacts.map(c => c.email)).size
            setUploadStatus({
              type: duplicates > 0 ? 'warning' : 'success',
              message: `Successfully loaded ${contacts.length} contacts${duplicates > 0 ? ` (${duplicates} duplicates detected)` : ''}`
            })
            onContactsUploaded(contacts)
          }
        } catch (error) {
          setUploadStatus({
            type: 'error',
            message: 'Error processing CSV file. Please check the format and try again.'
          })
        } finally {
          setIsProcessing(false)
        }
      },
      error: (error) => {
        setUploadStatus({
          type: 'error',
          message: `CSV parsing error: ${error.message}`
        })
        setIsProcessing(false)
      }
    })
  }, [onContactsUploaded])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    const csvFile = files.find(file => file.type === 'text/csv' || file.name.endsWith('.csv'))
    
    if (csvFile) {
      processCSV(csvFile)
    } else {
      setUploadStatus({
        type: 'error',
        message: 'Please upload a CSV file'
      })
    }
  }, [processCSV])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processCSV(file)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="w-5 h-5" />
          <span>Upload VC Contact List</span>
        </CardTitle>
        <CardDescription>
          Upload a CSV file with VC contacts. Required columns: Email, Name, Firm. 
          Optional: Focus, Thesis, Recent Deals, LinkedIn
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
        >
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">
              Drop your CSV file here
            </p>
            <p className="text-sm text-gray-500">
              or click to browse files
            </p>
          </div>
          
          <div className="mt-4">
            <Label htmlFor="csv-upload" className="cursor-pointer">
              <Input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isProcessing}
              />
              <Button 
                variant="outline" 
                disabled={isProcessing}
                className="mt-2"
              >
                {isProcessing ? 'Processing...' : 'Choose File'}
              </Button>
            </Label>
          </div>
        </div>

        {uploadStatus.type && (
          <Alert className={`mt-4 ${
            uploadStatus.type === 'success' ? 'border-green-200 bg-green-50' :
            uploadStatus.type === 'warning' ? 'border-amber-200 bg-amber-50' :
            'border-red-200 bg-red-50'
          }`}>
            {uploadStatus.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-600" />
            )}
            <AlertDescription className={
              uploadStatus.type === 'success' ? 'text-green-800' :
              uploadStatus.type === 'warning' ? 'text-amber-800' :
              'text-red-800'
            }>
              {uploadStatus.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-4 text-xs text-gray-500">
          <p className="font-medium mb-1">CSV Format Example:</p>
          <code className="bg-gray-100 p-2 rounded text-xs block">
            Email,Name,Firm,Focus<br/>
            john@acme.vc,John Smith,Acme Ventures,B2B SaaS<br/>
            jane@beta.com,Jane Doe,Beta Capital,Healthcare AI
          </code>
        </div>
      </CardContent>
    </Card>
  )
}