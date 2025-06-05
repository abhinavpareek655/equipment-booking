"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, EyeOff, Eye } from "lucide-react"

type FormState = {
  email: string
  name: string
  department: string
  role: string
  password: string
  showPassword: boolean
  confirmPassword: string
  supervisor?: string
}

type Errors = Partial<Record<keyof FormState, string>>

const initialState: FormState = {
  email: "",
  name: "",
  department: "",
  role: "",
  password: "",
  showPassword: false,
  confirmPassword: "",
  supervisor: "",
}

const departments = [
  "Biochemistry",
  "Molecular Biology",
  "Microbiology",
  "Genetics",
  "Biotechnology",
]

const roles = [
  "Faculty",
  "Researcher",
  "PhD Scholar",
  "MSc Student",
  "Technical Staff",
]

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(initialState)
  const [errors, setErrors] = useState<Errors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [department, setDepartment] = useState("")
  const [role, setRole] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // add this ref for toggling password visibility
  const passwordInputRef = useRef<HTMLInputElement>(null)

  const validateField = (name: keyof FormState, value: string | boolean | undefined): string | null => {
    switch (name) {
      case "email":
        if (!value) return "Email is required"
        // Regex: one or more non-space/non-@ chars, then @curaj.ac.in (case-insensitive)
        const emailPattern = /^[^\s@]+@curaj\.ac\.in$/i
        if (!emailPattern.test(value as string)) {
          return "Please use a valid university email address (@curaj.ac.in)"
        }
        return null

      case "name":
        if (!value) return "Name is required"
        return null

      case "department":
        if (!value) return "Department is required"
        return null

      case "role":
        if (!value) return "Role is required"
        return null

      case "password":
        if (!value || typeof value !== "string") return "Password is required"
        if ((value as string).length < 8) return "Password must be at least 8 characters long"
        return null

      case "confirmPassword":
        if (!value) return "Please confirm your password"
        if (value !== form.password) return "Passwords do not match"
        return null

      default:
        return null
    }
  }

  const validateForm = () : Errors => {
    const newErrors: Errors = {}
    Object.keys(form).forEach((key) => {
      const error = validateField(key as keyof FormState, form[key as keyof FormState])
      if (error) newErrors[key as keyof FormState] = error
    })
    return newErrors
  }

  const handleChange = (name: keyof FormState, value: string | boolean | undefined) => {
    setForm((prev) => ({
      ...prev,
      [name] : value,
    }))

    // Real-time validation for touched fields
    if (touchedFields.has(name)) {
      const error = validateField(name, value)
      setErrors((prev) => ({
        ...prev,
        [name]: error || undefined,
      }))
    }
  }

  const handleBlur = (name: keyof FormState) => {
    setTouchedFields((prev) => new Set(prev).add(name))
    const error = validateField(name, form[name])
    setErrors((prev) => ({
      ...prev,
      [name]: error || undefined,
    }))
  }

  const getPasswordStrength = () => {
    const password = form.password
    if (!password) return { strength: 0, label: "No password" }

    let strength = 0
    if (password.length >= 8) strength += 25
    if (/[a-z]/.test(password)) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/\d/.test(password)) strength += 25
    if (/[@$!%*?&#^()_\-+=[\]{};':"\\|,.<>/?]/.test(password)) strength += 25

    if (strength <= 25) return { strength, label: "Weak", color: "bg-red-500" }
    if (strength <= 50) return { strength, label: "Fair", color: "bg-orange-500" }
    if (strength <= 75) return { strength, label: "Good", color: "bg-yellow-500" }
    return { strength, label: "Strong", color: "bg-green-500" }
  }

  const getCompletionPercentage = () => {
    const totalFields = Object.keys(form).filter((key) => key !== "showPassword").length;
    const completedFields = Object.entries(form).filter(
      ([key, value]) => key !== "showPassword" && value !== ""
    ).length;
    return totalFields === 0 ? 0 : Math.floor((completedFields / totalFields) * 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formErrors = validateForm()
    setErrors(formErrors)

    if (Object.keys(formErrors).length === 0) {
      try {
        // API call

        toast({
          title: "Registration Successful!",
          description: "Your account has been created successfully.",
        })

        // Reset form and state
        setForm(initialState)
        setTouchedFields(new Set())
        setErrors({})
        setIsSubmitting(false)
        router.push("/login")
      } catch (error) {
        console.error("Registration error:", error)
        toast({
          title: "Registration Failed",
          description: "An error occurred while creating your account. Please try again.",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "Validation Errors",
        description: "Please fix the errors in the form before submitting.",
        variant: "destructive",
      })
    }

    setIsSubmitting(false)
  }

  const passwordStrength = getPasswordStrength()
  const completionPercentage = getCompletionPercentage()
  const isFormValid = Object.keys(validateForm()).length === 0

  return (
    <div className="container flex justify-center py-8">
      <Card className="mx-auto max-w-lg w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Register to access the DBT BUILDER equipment booking system</CardDescription>
          <div className="pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Form Completion</span>
              <Badge variant={completionPercentage === 100 ? "default" : "secondary"}>{completionPercentage}%</Badge>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  autoComplete="name"
                  autoFocus
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  onBlur={() => handleBlur("name")}
                  className={errors.name ? "border-red-500" : ""}
                  required
                />
                {errors.name && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.name}
                </p>
                )}

              </div>
              <div className="space-y-2">
                <Label htmlFor="email">University Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@curaj.ac.in"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  className={errors.name ? "border-red-500" : ""}
                  required
                />
                {errors.email && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.email}
                    </p>
                  )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select
                  value={form.department}
                  onValueChange={(value)=> handleChange("department", value)}
                  required
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.department}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={form.role}
                  onValueChange={(value) => handleChange("role", value)}
                  required
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.role}
                    </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    ref={passwordInputRef}
                    id="password"
                    name="new-password"
                    autoComplete="new-password"
                    type={form.showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    onBlur={() => handleBlur("password")}
                    className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                    placeholder="Create a password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => {
                      const input = passwordInputRef.current
                      if (!input) return
                      // remember cursor position
                      const start = input.selectionStart ?? 0
                      const end = input.selectionEnd ?? 0
                      // toggle visibility
                      handleChange("showPassword", !form.showPassword)
                      // restore cursor after DOM updates
                      requestAnimationFrame(() => {
                        input.setSelectionRange(start, end)
                        input.focus()
                      })
                    }}
                  >
                    {form.showPassword ? (
                      <Eye className="h-4 w-4 text-gray-500" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
                
                {errors.password && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.password}
                    </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={form.showPassword ? "text" : "password"}
                    name="new-password"
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    onBlur={() => handleBlur("confirmPassword")}
                    placeholder="Re-enter your password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => { handleChange("showPassword", !form.showPassword) }}
                  >
                    {form.showPassword ? (
                      <Eye className="h-4 w-4 text-gray-500" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    )}   
                  </Button>
                </div>
                {errors.confirmPassword && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.confirmPassword}
                    </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supervisor">Supervisor/PI (if applicable)</Label>
              <Input 
              id="supervisor" 
              placeholder="Name of your supervisor or PI"
              value={form.supervisor}
              onChange={(e) => handleChange("supervisor", e.target.value)}
              onBlur={() => handleBlur("supervisor")}
              className={errors.supervisor ? "border-red-500" : ""}
              />
              {errors.supervisor && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.supervisor}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full">
              Register
            </Button>
            <p className="mt-4 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
