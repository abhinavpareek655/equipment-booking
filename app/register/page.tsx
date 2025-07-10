"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
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
import { AlertCircle, EyeOff, Eye, CheckCircle, User as UserIcon} from "lucide-react"
import { useDropzone } from 'react-dropzone';
import * as faceapi from 'face-api.js';

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
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [faceStatus, setFaceStatus] = useState<'none' | 'detected' | 'not-detected' | 'loading'>('none');
  const [faceMessage, setFaceMessage] = useState<string>("");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // add this ref for toggling password visibility
  const passwordInputRef = useRef<HTMLInputElement>(null)

  // Load face-api.js models on mount
  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      setModelsLoaded(true);
    };
    loadModels();
  }, []);

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

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setPhotoError(null);
    setFaceStatus('none');
    setFaceMessage("");
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setPhotoError("File size must be less than 1MB.");
      setPhotoFile(null);
      setPhotoPreview(null);
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setPhotoPreview(dataUrl);
      if (modelsLoaded) {
        setFaceStatus('loading');
        setFaceMessage('Detecting face...');
        const img = new window.Image();
        img.src = dataUrl;
        img.onload = async () => {
          const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions());
          if (!detections || detections.length === 0) {
            setFaceStatus('not-detected');
            setFaceMessage('No human face detected. You can use any image, but a face is recommended.');
          } else {
            setFaceStatus('detected');
            setFaceMessage('Face detected!');
          }
        };
        img.onerror = () => {
          setFaceStatus('none');
          setFaceMessage('Could not load image for face detection.');
        };
      }
    };
    reader.readAsDataURL(file);
  }, [modelsLoaded]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] }, multiple: false });

  const handleOpenCamera = async () => {
    setPhotoError(null);
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setPhotoError("Could not access camera.");
      setShowCamera(false);
    }
  };

  const handleCloseCamera = () => {
    setShowCamera(false);
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }
  };

  const handleCapturePhoto = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      // Compress to JPEG and ensure <1MB
      let quality = 0.92;
      let dataUrl = canvas.toDataURL('image/jpeg', quality);
      let fileSize = Math.ceil((dataUrl.length * 3) / 4) - (dataUrl.endsWith('==') ? 2 : dataUrl.endsWith('=') ? 1 : 0);
      while (fileSize > 1024 * 1024 && quality > 0.4) {
        quality -= 0.07;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
        fileSize = Math.ceil((dataUrl.length * 3) / 4) - (dataUrl.endsWith('==') ? 2 : dataUrl.endsWith('=') ? 1 : 0);
      }
      setPhotoPreview(dataUrl);
      setShowCamera(false);
      // Convert dataUrl to File
      fetch(dataUrl)
        .then(res => res.arrayBuffer())
        .then(buf => {
          const file = new File([buf], 'captured-photo.jpg', { type: 'image/jpeg' });
          setPhotoFile(file);
          // Run face detection
          if (modelsLoaded) {
            setFaceStatus('loading');
            setFaceMessage('Detecting face...');
            const img = new window.Image();
            img.src = dataUrl;
            img.onload = async () => {
              const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions());
              if (!detections || detections.length === 0) {
                setFaceStatus('not-detected');
                setFaceMessage('No human face detected. You can use any image, but a face is recommended.');
              } else {
                setFaceStatus('detected');
                setFaceMessage('Face detected!');
              }
            };
            img.onerror = () => {
              setFaceStatus('none');
              setFaceMessage('Could not load image for face detection.');
            };
          }
        });
    }
    // Stop camera
    handleCloseCamera();
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  const formErrors = validateForm();
  setErrors(formErrors);

  if (Object.keys(formErrors).length === 0) {
    // Store photo in localStorage as base64
    if (photoFile) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          localStorage.setItem("pendingProfilePhoto", ev.target?.result as string)
        } catch {}
      }
      reader.readAsDataURL(photoFile)
    } else {
      localStorage.removeItem("pendingProfilePhoto")
    }
    console.log("📦 Posting to /api/auth/register with payload:", form);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,               // ✅ add this
          department: form.department,   // ✅ add this
        }),
      });

      const rawText = await response.text();
      let parsedData;

      try {
        parsedData = JSON.parse(rawText);
        console.log("✅ Parsed JSON:", parsedData);
      } catch (parseErr) {
        console.error("⚠️ JSON parse error:", parseErr);
      }

      if (!response.ok) {
        throw new Error(`❌ HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Registration Successful!",
        description: "Your account has been created successfully.",
      });

      // setForm(initialState);
      setTouchedFields(new Set());
      setErrors({});

      setTimeout(() => {
        router.push(`/verify?email=${encodeURIComponent(form.email)}`);
      });
    } catch (error) {
      console.error("🚨 Registration error:", error);
      toast({
        title: "Registration Failed",
        description: "An error occurred while creating your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  } else {
    console.log("⚠️ Validation errors:", formErrors);
    toast({
      title: "Validation Errors",
      description: "Please fix the errors in the form before submitting.",
      variant: "destructive",
    });
    setIsSubmitting(false);
  }
};


  const passwordStrength = getPasswordStrength()
  const completionPercentage = getCompletionPercentage()
  const isFormValid = Object.keys(validateForm()).length === 0

  return (
    <div className="container flex justify-center mt-8">
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
            {/* Profile Photo Upload with react-dropzone and camera */}
            <div className="space-y-2 flex flex-col items-center">
              <Label htmlFor="profilePhoto" className="block text-center w-full">Profile Photo *</Label>
              <div {...getRootProps()}
                className={`mx-auto flex flex-col items-center justify-center border-2 border-dashed rounded-full w-32 h-32 bg-white shadow-sm transition-all duration-200 cursor-pointer
                  ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}
                `}
                style={{ aspectRatio: '1/1' }}
              >
                <input {...getInputProps()} id="profilePhoto" disabled={isSubmitting} />
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile preview" className="w-28 h-28 rounded-full object-cover border-2 border-gray-200 shadow-sm" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <UserIcon className="w-12 h-12 text-gray-300 mb-2" />
                    <span className="text-xs text-gray-500">Drag & drop or click</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                className="mt-2 px-4 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition"
                onClick={handleOpenCamera}
                disabled={isSubmitting || showCamera}
              >
                Use Camera
              </button>
              {showCamera && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
                    <video ref={videoRef} className="rounded-lg border mb-4" width={320} height={240} autoPlay playsInline />
                    <div className="flex gap-4">
                      <button
                        type="button"
                        className="px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700"
                        onClick={handleCapturePhoto}
                      >
                        Capture
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
                        onClick={handleCloseCamera}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500 text-center mt-2">Upload a clear photo of your face (max 1MB, face recommended).</p>
              {faceStatus === 'loading' && <p className="text-xs text-blue-600 text-center">{faceMessage}</p>}
              {faceStatus === 'not-detected' && <p className="text-xs text-yellow-600 text-center font-medium">{faceMessage}</p>}
              {faceStatus === 'detected' && <p className="text-xs text-green-600 text-center font-medium">{faceMessage}</p>}
              {photoError && <p className="text-sm text-red-600 flex items-center gap-1"><AlertCircle className="h-4 w-4" />{photoError}</p>}
            </div>
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
            <Button
                  type="submit"
                  className="w-full h-12 text-lg font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Register
                    </>
                  )}
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
