import Link from "next/link"

export function MainNav() {
  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <span className="hidden font-bold sm:inline-block">CURAJ EBS</span>
      </Link>
      <nav className="hidden gap-6 md:flex">
        <Link href="/equipment" className="text-sm font-medium transition-colors hover:text-primary">
          Equipment
        </Link>
        <Link href="/booking" className="text-sm font-medium transition-colors hover:text-primary">
          Book Equipment
        </Link>
        <Link href="/my-bookings" className="text-sm font-medium transition-colors hover:text-primary">
          My Bookings
        </Link>
        <Link href="/guidelines" className="text-sm font-medium transition-colors hover:text-primary">
          Guidelines
        </Link>
      </nav>
    </div>
  )
}
