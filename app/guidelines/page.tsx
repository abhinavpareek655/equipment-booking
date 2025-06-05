import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, FileText, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function GuidelinesPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Equipment Usage Guidelines</h1>

      <Tabs defaultValue="sop" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sop">SOP</TabsTrigger>
          <TabsTrigger value="booking">Booking Rules</TabsTrigger>
          <TabsTrigger value="usage">Usage Protocol</TabsTrigger>
          <TabsTrigger value="faq">FAQs</TabsTrigger>
        </TabsList>

        <TabsContent value="sop">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Standard Operating Procedure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Purpose</h3>
                <p>
                  To ensure systematic, fair, and efficient use of research equipment procured under the DBT BUILDER
                  project, this SOP provides a structured process for booking, usage, and maintenance, specifically for
                  research scholars.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Scope</h3>
                <p>
                  This SOP applies to all research scholars, faculty, and technical staff utilizing equipment funded by
                  the DBT BUILDER project in the School of Life Sciences, Central University of Rajasthan.
                </p>
              </div>

              <Alert className="my-4">
                <Info className="h-4 w-4" />
                <AlertTitle>Important Note</AlertTitle>
                <AlertDescription>
                  In alignment with the project objectives, 40% of the facility's functional hours will be reserved for
                  the Principal Investigator (PI) to conduct the experiments specified in the project proposal. As a
                  result, the facility will be accessible to users other than the CURAJ-EBS PI and project staff only
                  three days per week.
                </AlertDescription>
              </Alert>

              <div>
                <h3 className="text-lg font-medium mb-2">Equipment Booking Workflow</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>User Registration</li>
                  <li>Equipment Selection</li>
                  <li>Booking Request Submission</li>
                  <li>Payment of Fee (if required)</li>
                  <li>Approval (Lab Manager/ PI)</li>
                  <li>Confirmation/Notification</li>
                  <li>Equipment Usage (Check-In/Out)</li>
                  <li>Log Entry/Feedback</li>
                  <li>Reporting</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="booking">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="mr-2 h-5 w-5" />
                Booking Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Booking Request and Approval</h3>
                <p>
                  All potential users must submit a booking request for equipment use in advance through the designated
                  online booking system or physical logbook, specifying:
                </p>
                <ol className="list-decimal pl-5 space-y-1 mt-2">
                  <li>Name, department, and contact details</li>
                  <li>Supervisor's name</li>
                  <li>Equipment required</li>
                  <li>Date and time slot requested</li>
                  <li>Purpose and brief description of the experiment</li>
                </ol>
                <p className="mt-2">
                  The Lab Incharge or designated staff (Project JRF) will review booking requests and with the
                  consultation with the respective PI, grant approval based on equipment availability and priority.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Cancellation Policy</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Users must cancel bookings at least 24 hours in advance to allow reallocation of time slots.</li>
                  <li>
                    If the user failed to use an equipment on the scheduled time, he/she will be allowed to use the
                    facility only after 4 weeks.
                  </li>
                </ul>
              </div>

              <Alert variant="destructive" className="my-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Failure to comply with this SOP may result in suspension of booking privileges or other disciplinary
                  action.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="mr-2 h-5 w-5" />
                Usage Protocol
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Pre-Use Requirements</h3>
                <p>Users must:</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>
                    Have a prior experience operating with the equipment. If not the user first need to request the
                    Project Staff for a training session of the given equipment. Then only they will be allowed to use
                    the equipments.
                  </li>
                  <li>
                    Discuss their experimental protocols with the technical staff or Lab Incharge before the first use.
                  </li>
                  <li>
                    Bring all necessary consumables and personal protective equipment (PPE) required for their
                    experiment.
                  </li>
                  <li>Arrive at least 30–45 minutes before the scheduled slot for preparation.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">During Equipment Use</h3>
                <p>Users must:</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>Operate the equipment as per the standard operating guidelines provided for each instrument.</li>
                  <li>Remain present throughout the experiment unless otherwise permitted.</li>
                  <li>Handle equipment and accessories with care to prevent damage.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Post-Use Protocol</h3>
                <p>After completion:</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>Clean the equipment and surrounding workspace.</li>
                  <li>Remove all personal materials, consumables, and waste.</li>
                  <li>Enter usage details and any observed issues in the equipment logbook.</li>
                  <li>Inform the Lab Incharge of completion and report any malfunctions or damages immediately.</li>
                </ul>
              </div>

              <Alert className="my-4">
                <Info className="h-4 w-4" />
                <AlertTitle>Note</AlertTitle>
                <AlertDescription>
                  Users are responsible for any damage caused during their session and may be liable for repair or
                  replacement.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="mr-2 h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">How far in advance can I book equipment?</h3>
                  <p className="text-gray-600">
                    Bookings can be made up to 4 weeks in advance, but not less than 48 hours before the intended use.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium">What happens if I miss my booking?</h3>
                  <p className="text-gray-600">
                    If you fail to use the equipment during your scheduled time without prior cancellation, you will be
                    restricted from booking any equipment for 4 weeks.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium">How do I get trained on equipment I haven't used before?</h3>
                  <p className="text-gray-600">
                    Contact the Project Staff to request a training session. Periodic formal training programs are also
                    organized by the project staff for research scholars.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium">Who has priority for equipment booking?</h3>
                  <p className="text-gray-600">
                    The Principal Investigator (PI) has priority for 40% of the facility's functional hours to conduct
                    experiments specified in the project proposal.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium">Are there any usage fees?</h3>
                  <p className="text-gray-600">
                    Usage fees may apply for certain equipment or for users outside the School of Life Sciences. Check
                    with the Lab Incharge for specific details.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium">What if the equipment malfunctions during my session?</h3>
                  <p className="text-gray-600">
                    Report the issue immediately to the Lab Incharge or Technical Staff. Do not attempt to fix the
                    equipment yourself.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
