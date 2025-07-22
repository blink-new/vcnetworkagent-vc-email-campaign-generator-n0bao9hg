import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Mail, Users } from "lucide-react"

export function Header() {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">VCNetworkAgent</h1>
              <p className="text-sm text-gray-500">AI-Powered VC Outreach</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
              <Shield className="w-3 h-3 mr-1" />
              CAN-SPAM Compliant
            </Badge>
            <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">
              <Users className="w-3 h-3 mr-1" />
              VC-to-VC Optimized
            </Badge>
            <Button variant="outline" size="sm">
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}