"use client"

import React, { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, EyeOff, Eye } from "lucide-react"

type Errors = Partial<Record<keyof FormState, string>>

type FormState = {
  email: string;
  password: string;
}

const initialState: FormState = {
  email: "",
  password: "",
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({})
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<FormState>(initialState)
  const passwordInputRef = useRef<HTMLInputElement>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())

  const onEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    setForm(f => ({ ...f, email: e.target.value }))

    if (touchedFields.has("email")) {
      const error = validateField("email", e.target.value)
      setErrors((prev) => ({
        ...prev,
        ["email"]: error || undefined,
      }))
    }
  }

  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    setForm(f => ({ ...f, password: e.target.value }))

    if (touchedFields.has("password")) {
      const error = validateField("password", e.target.value)
      setErrors((prev) => ({
        ...prev,
        ["password"]: error || undefined,
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

  const validateField = (key: keyof FormState, value: string): string | null => {
    switch (key) {
      case "email":
        if (!value) return "Email is required";
        if (!/^[\w-]+(\.[\w-]+)*@curaj\.ac\.in$/.test(value)) return "Please use a valid university email address (@curaj.ac.in)";
        return null;
      case "password":
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        return null;
      default:
        return null;
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validation = validateForm()
    if (Object.keys(validation).length) {
      setErrors(validation)
      return
    }
    // 1. basic university-email check
    if (!email.endsWith("@curaj.ac.in")) {
      setErrors({email : "Please use a valid university email address (@curaj.ac.in)"});
      return;
    }

    setErrors({email: "", password: ""}); // clear previous errors
    setIsLoading(true);

    try {
      // 2. call your login API
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",            // send/receive HTTP-only cookie
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // 3. on success, redirect to home
      router.push("/");
    } catch (err: any) {
      const message = err.message || "An error occurred";
      if (message.toLowerCase().includes("email")) {
        setErrors({ email: message, password: "" });
      } else {
        setErrors({ email: "", password: message });
      }
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex mt-8 justify-center">
      <Card className="mx-auto max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
          <CardDescription>
            Enter your university email to sign in to the DBT BUILDER equipment booking system
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@curaj.ac.in"
                value={email}
                onChange={onEmailChange}
                onBlur={() => handleBlur("email")}
                className={errors.email ? "border-red-500" : ""}
                required
              />
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.email}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
              <Input
                ref={passwordInputRef}
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                className={errors.password ? "border-red-500" : ""}
                value={password}
                onChange={onPasswordChange}
                onBlur={() => handleBlur("password")}
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
                    setShowPassword((prev) => !prev)
                    // restore cursor after DOM updates
                    requestAnimationFrame(() => {
                      input.setSelectionRange(start, end)
                      input.focus()
                    })
                  }}
                >
                  {showPassword ? (
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
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full">
              
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Logging in...
                </>
              ): (
                <>
                  Log in
                </>
              )}
            </Button>
            <p className="mt-4 text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Register
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
