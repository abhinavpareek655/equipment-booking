import VerifyForm from "./VerifyForm"

export default async function VerifyPage({
  searchParams
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email = "" } = await searchParams
  return <VerifyForm email={email} />
}
