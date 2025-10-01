"use client"

import { useState } from "react"
import { AdminNavigation } from "@/components/admin/admin-navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, FileText, User } from "lucide-react"

export default function AdminKYC() {
  const [selectedApplication, setSelectedApplication] = useState<any>(null)

  const kycApplications = [
    {
      id: 1,
      name: "Sara Mohamed",
      email: "sara.mohamed@email.com",
      phone: "+201087654321",
      submittedAt: "2024-03-15 14:30",
      status: "pending",
      documents: {
        nationalId: "https://example.com/id1.jpg",
        selfie: "https://example.com/selfie1.jpg",
        addressProof: "https://example.com/address1.jpg",
      },
      personalInfo: {
        fullName: "Sara Mohamed Ali",
        dateOfBirth: "1995-08-20",
        address: "123 Tahrir Square, Cairo, Egypt",
        nationalId: "29508201234567",
      },
    },
    {
      id: 2,
      name: "Omar Ali",
      email: "omar.ali@email.com",
      phone: "+201098765432",
      submittedAt: "2024-03-14 09:15",
      status: "pending",
      documents: {
        nationalId: "https://example.com/id2.jpg",
        selfie: "https://example.com/selfie2.jpg",
        addressProof: "https://example.com/address2.jpg",
      },
      personalInfo: {
        fullName: "Omar Ali Hassan",
        dateOfBirth: "1988-12-10",
        address: "456 Zamalek Street, Giza, Egypt",
        nationalId: "28812101234567",
      },
    },
  ]

  const handleApprove = (id: number) => {
    console.log("Approving KYC for user:", id)
    // Implementation for KYC approval
  }

  const handleReject = (id: number) => {
    console.log("Rejecting KYC for user:", id)
    // Implementation for KYC rejection
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavigation />

      <div className="md:ml-64">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">KYC Management</h1>
                <p className="text-muted-foreground">Review and approve user verification documents</p>
              </div>
              <Badge variant="outline">
                <Clock className="w-3 h-3 mr-1" />
                {kycApplications.length} Pending
              </Badge>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Applications List */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {kycApplications.map((application) => (
                    <div
                      key={application.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedApplication?.id === application.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedApplication(application)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{application.name}</h3>
                            <p className="text-sm text-muted-foreground">{application.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">{application.submittedAt}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Application Details */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedApplication ? `Review: ${selectedApplication.name}` : "Select Application"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedApplication ? (
                  <div className="space-y-6">
                    {/* Personal Information */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Full Name</p>
                          <p className="font-medium">{selectedApplication.personalInfo.fullName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Date of Birth</p>
                          <p className="font-medium">{selectedApplication.personalInfo.dateOfBirth}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">National ID</p>
                          <p className="font-medium">{selectedApplication.personalInfo.nationalId}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Phone</p>
                          <p className="font-medium">{selectedApplication.phone}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-muted-foreground">Address</p>
                          <p className="font-medium">{selectedApplication.personalInfo.address}</p>
                        </div>
                      </div>
                    </div>

                    {/* Documents */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Submitted Documents
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <span className="text-sm font-medium">National ID</span>
                          <Button variant="outline" size="sm">
                            View Document
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <span className="text-sm font-medium">Selfie Photo</span>
                          <Button variant="outline" size="sm">
                            View Document
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <span className="text-sm font-medium">Address Proof</span>
                          <Button variant="outline" size="sm">
                            View Document
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t">
                      <Button onClick={() => handleApprove(selectedApplication.id)} className="flex-1">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve KYC
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleReject(selectedApplication.id)}
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject KYC
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a KYC application to review</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
