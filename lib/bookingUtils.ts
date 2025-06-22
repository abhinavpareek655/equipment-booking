export async function autoCompleteBookings() {
  const Booking = (await import('@/models/Booking')).default
  const Equipment = (await import('@/models/Equipment')).default
  const now = new Date()
  const approved = await Booking.find({ status: 'approved' })
  for (const b of approved) {
    const [hourStr, minuteStr] = (b.startTime || '0:0').split(':')
    const start = new Date(`${b.date}T00:00`)
    start.setHours(parseInt(hourStr, 10))
    start.setMinutes(parseInt(minuteStr, 10))
    const end = new Date(start.getTime() + (b.duration || 0) * 60 * 60 * 1000)
    if (now >= end) {
      b.status = 'completed'
      await b.save()

      const eq = await Equipment.findById(b.equipmentId)
      if (eq) {
        eq.totalHours += b.duration || 0
        const total = eq.totalHours || 0
        const uptimeRatio = total > 0
          ? ((total - (eq.maintenanceHours || 0)) / total) * 100
          : 0
        eq.uptime = `${uptimeRatio.toFixed(1)}%`
        await eq.save()
      }
    }
  }
}
