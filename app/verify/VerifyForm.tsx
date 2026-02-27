"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, RefreshCw } from "lucide-react"

export default function VerifyForm({ email }: { email: string }) {
  const router = useRouter()

  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [supervisorOtp, setSupervisorOtp] = useState(["", "", "", "", "", ""])
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600)
  const [canResend, setCanResend] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState("");
  const [activeTab, setActiveTab] = useState<'user' | 'supervisor'>('user');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const supervisorInputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [timeLeft])

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string, type: 'user' | 'supervisor' = 'user') => {
    if (value.length > 1) return

    const setState = type === 'user' ? setOtp : setSupervisorOtp;
    const currentRefs = type === 'user' ? inputRefs : supervisorInputRefs;
    const currentOtp = type === 'user' ? otp : supervisorOtp;

    const newOtp = [...currentOtp]
    newOtp[index] = value
    setState(newOtp)
    setError("")

    // Auto-focus next input
    if (value && index < 5) {
      currentRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all fields are filled
    if (newOtp.every((digit) => digit !== "") && newOtp.join("").length === 6) {
      if (type === 'user') {
        // If in user tab and all fields filled, move to supervisor tab (if needed)
        setActiveTab('supervisor')
      } else {
        // If supervisor OTP is complete, verify both
        handleVerify(otp.join(""), newOtp.join(""))
      }
    }
  }

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent, type: 'user' | 'supervisor' = 'user') => {
    const currentOtp = type === 'user' ? otp : supervisorOtp;
    const currentRefs = type === 'user' ? inputRefs : supervisorInputRefs;

    if (e.key === "Backspace" && !currentOtp[index] && index > 0) {
      currentRefs.current[index - 1]?.focus()
    }
  }

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent, type: 'user' | 'supervisor' = 'user') => {
    e.preventDefault()
    const pastedData = e
      .clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6)

    if (pastedData.length === 6) {
      const setState = type === 'user' ? setOtp : setSupervisorOtp;
      const newOtp = pastedData.split("")
      setState(newOtp)
      setError("")
      if (type === 'supervisor') {
        handleVerify(otp.join(""), pastedData)
      }
    }
  }

  // Verify OLP
  const handleVerify = async (otpCode?: string, supervisorOtpCode?: string) => {
    const codeToVerify = otpCode ?? otp.join("")
    const supervisorCodeToVerify = supervisorOtpCode ?? supervisorOtp.join("")

    if (codeToVerify.length !== 6) {
      setError("Please enter the complete 6-digit OTP")
      return
    }

    if (supervisorCodeToVerify.length !== 6) {
      setError("Please enter the complete 6-digit supervisor OTP")
      return
    }

    setIsVerifying(true)
    setError("")

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: codeToVerify,
          supervisorOtp: supervisorCodeToVerify,
        }),
      })

      if (!response.ok) {
        const { message } = await response.json()
        throw new Error(message || "OTP verification failed")
      }

      // After successful verification, upload the photo from localStorage
      setUploadingPhoto(true);
      setPhotoUploadError("");
      const base64 = localStorage.getItem("pendingProfilePhoto");
      if (base64) {
        // Convert base64 to File
        const arr = base64.split(",");
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
        const bstr = atob(arr[1] || "");
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
        const file = new File([u8arr], "profile-photo.jpg", { type: mime });
        const formData = new FormData();
        formData.append("email", email);
        formData.append("profilePhoto", file);
        const uploadRes = await fetch("/api/auth/upload-profile-photo", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) {
          const data = await uploadRes.json();
          setPhotoUploadError(data.message || "Failed to upload profile photo.");
          setUploadingPhoto(false);
          setIsVerifying(false);
          return;
        }
        localStorage.removeItem("pendingProfilePhoto");
      }
      setSuccess(true)
      setTimeout(() => {
        router.push("/")
      }, 1000)
    } catch (err: any) {
      console.log("Verification error:", err)
      setError(err.message || "Verification failed. Please try again.")
    } finally {
      setIsVerifying(false)
      setUploadingPhoto(false);
    }
  }

  // Resend OTP
  const handleResend = async () => {
    setIsResending(true)
    setError("")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Reset timer and state
      setTimeLeft(300)
      setCanResend(false)
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
      setError("")
    } catch {
      setError("Failed to resend OTP. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  if (success) {
    return (
      <div className="container flex mt-8 justify-center">
        <Card className="mx-auto max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-center mb-2">
              Verification Successful!
            </h2>
            <p className="text-center text-muted-foreground mb-4">
              Your account has been verified successfully. Redirecting you to the
              dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container flex mt-8 justify-center">
      <Card className="mx-auto max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Verify Your Registration
          </CardTitle>
          <CardDescription className="text-center">
            Verification codes have been sent to you and your supervisor.
            <br />
            <span className="font-medium">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tabs for user and supervisor verification */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('user')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Your Code
            </button>
            <button
              onClick={() => setActiveTab('supervisor')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'supervisor'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Supervisor Code
            </button>
          </div>

          {/* User OTP Tab */}
          {activeTab === 'user' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Enter your verification code</Label>
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value, 'user')}
                      onKeyDown={(e) => handleKeyDown(index, e, 'user')}
                      onPaste={(e) => handlePaste(e, 'user')}
                      className="w-12 h-12 text-center text-lg font-semibold border-gray-500"
                      disabled={isVerifying}
                    />
                  ))}
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  {timeLeft > 0 ? (
                    <>Code expires in {formatTime(timeLeft)}</>
                  ) : (
                    <>Code has expired</>
                  )}
                </p>

                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Didn't receive the code?
                  </span>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={handleResend}
                    disabled={!canResend || isResending}
                    className="p-0 h-auto font-medium"
                  >
                    {isResending ? (
                      <>
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Resend OTP"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Supervisor OTP Tab */}
          {activeTab === 'supervisor' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-amber-800">
                  Your supervisor will receive a verification code at their email. Share this section with them for account approval.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supervisorOtp">Enter supervisor verification code</Label>
                <div className="flex gap-2 justify-center">
                  {supervisorOtp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => {
                        supervisorInputRefs.current[index] = el
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value, 'supervisor')}
                      onKeyDown={(e) => handleKeyDown(index, e, 'supervisor')}
                      onPaste={(e) => handlePaste(e, 'supervisor')}
                      className="w-12 h-12 text-center text-lg font-semibold border-gray-500"
                      disabled={isVerifying}
                    />
                  ))}
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  {timeLeft > 0 ? (
                    <>Code expires in {formatTime(timeLeft)}</>
                  ) : (
                    <>Code has expired</>
                  )}
                </p>

                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Supervisor didn't receive the code?
                  </span>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={handleResend}
                    disabled={!canResend || isResending}
                    className="p-0 h-auto font-medium"
                  >
                    {isResending ? (
                      <>
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Resend OTP"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {photoUploadError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{photoUploadError}</AlertDescription>
            </Alert>
          )}
          {uploadingPhoto && (
            <div className="text-center text-blue-600 text-sm">Uploading profile photo...</div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            onClick={() => handleVerify()}
            disabled={isVerifying || otp.some((digit) => digit === "") || supervisorOtp.some((digit) => digit === "")}
            className="w-full"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Both Codes"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Wrong email?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Go back to registration
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
