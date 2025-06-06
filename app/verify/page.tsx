"use client";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  return (
    <div>
      <p>Email: {email}</p>
    </div>
  );
}
