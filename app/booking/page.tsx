"use client"

import type React from "react"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormDescription, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CheckIcon, ChevronLeft, ChevronRight, CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useForm, FormProvider } from "react-hook-form"

const equipment = [
  { id: "1", name: "Flow Cytometer", category: "Cell Analysis" },
  { id: "2", name: "Confocal Microscope", category: "Microscopy" },
  { id: "3", name: "PCR Thermal Cycler", category: "Molecular Biology" },
  { id: "4", name: "Ultra-centrifuge", category: "Separation" },
  { id: "5", name: "Mass Spectrometer", category: "Analysis" },
  { id: "6", name: "HPLC System", category: "Chromatography" },
]

export default function BookingPage() {
  const searchParams = useSearchParams()
  const equipmentId = searchParams.get("equipment")
  const { toast } = useToast()

  const [date, setDate] = useState<Date | undefined>(new Date())
  const [startTime, setStartTime] = useState<string>("09:00")
  const [duration, setDuration] = useState<number>(1)
  const [selectedEquipment, setSelectedEquipment] = useState(equipmentId || "")
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "success" | "error">("idle")

  // Find the equipment details if an ID was provided
  const equipmentDetails = equipment.find((item) => item.id === selectedEquipment)
  const formMethods = useForm()

  // Calculate end time based on start time and duration
  const calculateEndTime = () => {
    if (!startTime) return ""

    const [hours, minutes] = startTime.split(":").map(Number)
    const startDate = new Date()
    startDate.setHours(hours, minutes, 0, 0)

    const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000)
    return `${endDate.getHours().toString().padStart(2, "0")}:${endDate.getMinutes().toString().padStart(2, "0")}`
  }

  const endTime = calculateEndTime()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmissionStatus("success")

      toast({
        title: "Booking Request Submitted",
        description: "Your request has been sent to the instrument administrators for approval.",
      })
    }, 1500)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Book Equipment</h1>

        <div className="mb-8">
          <ol className="flex items-center w-full">
            <li
              className={`flex w-full items-center ${step > 1 ? "text-green-600" : "text-gray-900"} after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:inline-block`}
            >
              <span
                className={`flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0 ${step > 1 ? "bg-green-100" : "bg-gray-100"}`}
              >
                {step > 1 ? <CheckIcon className="w-5 h-5" /> : 1}
              </span>
            </li>
            <li
              className={`flex w-full items-center ${step > 2 ? "text-green-600" : "text-gray-900"} after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:inline-block`}
            >
              <span
                className={`flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0 ${step > 2 ? "bg-green-100" : "bg-gray-100"}`}
              >
                {step > 2 ? <CheckIcon className="w-5 h-5" /> : 2}
              </span>
            </li>
            <li className="flex items-center text-gray-900">
              <span className="flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0 bg-gray-100">
                3
              </span>
            </li>
          </ol>
        </div>
        <FormProvider {...formMethods}>
        <Card>
          <CardHeader>
            <CardTitle>Equipment Booking Request</CardTitle>
            <CardDescription>Fill in the details to request equipment booking</CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <FormLabel>Select Equipment</FormLabel>
                  <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment..." />
                    </SelectTrigger>
                    <SelectContent>
                      {equipment.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} ({item.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Choose the equipment you need for your research.</FormDescription>
                </div>

                <Button onClick={() => setStep(2)} disabled={!selectedEquipment} className="mt-4">
                  Continue
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FormLabel>Select Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <FormLabel>Start Time</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal")}>
                          <Clock className="mr-2 h-4 w-4" />
                          {startTime || "Select start time"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-4">
                        <div className="grid gap-2">
                          <div className="grid grid-cols-2 gap-2">
                            {["09:00", "10:00", "11:00", "12:00"].map((time) => (
                              <Button
                                key={time}
                                variant={startTime === time ? "default" : "outline"}
                                onClick={() => setStartTime(time)}
                                className="text-center"
                              >
                                {time}
                              </Button>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {["13:00", "14:00", "15:00", "16:00"].map((time) => (
                              <Button
                                key={time}
                                variant={startTime === time ? "default" : "outline"}
                                onClick={() => setStartTime(time)}
                                className="text-center"
                              >
                                {time}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <FormLabel>Duration (hours): {duration}</FormLabel>
                    <span className="text-sm text-gray-500">End time: {endTime}</span>
                  </div>
                  <Slider
                    defaultValue={[1]}
                    max={4}
                    min={1}
                    step={0.5}
                    value={[duration]}
                    onValueChange={(value) => setDuration(value[0])}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 hour</span>
                    <span>2 hours</span>
                    <span>3 hours</span>
                    <span>4 hours</span>
                  </div>
                </div>

                <div className="flex justify-between mt-4">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button onClick={() => setStep(3)} disabled={!date || !startTime}>
                    Continue <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FormLabel htmlFor="supervisor">Supervisor/PI Name</FormLabel>
                    <Input id="supervisor" required />
                  </div>
                  <div>
                    <FormLabel htmlFor="department">Department</FormLabel>
                    <Input id="department" required />
                  </div>
                </div>

                <div>
                  <FormLabel htmlFor="purpose">Purpose of Use</FormLabel>
                  <Textarea
                    id="purpose"
                    placeholder="Briefly describe the experiment you plan to conduct..."
                    className="min-h-[100px]"
                    required
                  />
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">Booking Summary</h3>
                  <p>Equipment: {equipmentDetails?.name}</p>
                  <p>Date: {date ? format(date, "PPP") : "Not selected"}</p>
                  <p>
                    Time: {startTime} - {endTime} ({duration} hours)
                  </p>
                </div>

                {submissionStatus === "success" && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckIcon className="h-4 w-4 text-green-600" />
                    <AlertTitle>Success!</AlertTitle>
                    <AlertDescription>
                      Your booking request has been submitted and is awaiting approval from the instrument
                      administrators.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-between mt-4">
                  <Button variant="outline" onClick={() => setStep(2)} disabled={isSubmitting}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting || submissionStatus === "success"}>
                    {isSubmitting ? "Submitting..." : "Submit Booking Request"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
        </FormProvider>
      </div>
    </div>
  )
}
