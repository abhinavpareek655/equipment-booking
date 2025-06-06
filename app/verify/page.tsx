import VerifyForm from "./VerifyForm"

export default function VerifyPage({
  searchParams,
}: {
  searchParams: { email?: string }
}) {
  const email = searchParams.email || ""
  return <VerifyForm email={email} />
}
