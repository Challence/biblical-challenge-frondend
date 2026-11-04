export const reminderPayload = JSON.stringify({
  title: 'Tu lectura de hoy está lista',
  body: 'Continúa tu ritmo diario en Desafío Bíblico.',
  url: '/lectura-hoy',
  tag: 'daily-reading-reminder',
})

const zonedParts = (date: Date, timezone: string) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value)
  return {
    year: value('year'),
    month: value('month'),
    day: value('day'),
    hour: value('hour'),
    minute: value('minute'),
    second: value('second'),
  }
}

const localTimeToUtc = (
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timezone: string,
) => {
  const desired = Date.UTC(year, month - 1, day, hour, minute)
  let candidate = desired
  for (let iteration = 0; iteration < 3; iteration += 1) {
    const actual = zonedParts(new Date(candidate), timezone)
    const represented = Date.UTC(
      actual.year,
      actual.month - 1,
      actual.day,
      actual.hour,
      actual.minute,
      actual.second,
    )
    candidate += desired - represented
  }
  return new Date(candidate)
}

export function assertTimezone(timezone: string) {
  new Intl.DateTimeFormat('en', { timeZone: timezone }).format()
}

export function nextReminderAt(timezone: string, hour = 8, minute = 0, now = new Date()) {
  assertTimezone(timezone)
  const local = zonedParts(now, timezone)
  let next = localTimeToUtc(local.year, local.month, local.day, hour, minute, timezone)
  if (next <= now) {
    const tomorrow = new Date(Date.UTC(local.year, local.month - 1, local.day + 1))
    next = localTimeToUtc(
      tomorrow.getUTCFullYear(),
      tomorrow.getUTCMonth() + 1,
      tomorrow.getUTCDate(),
      hour,
      minute,
      timezone,
    )
  }
  return next
}

export async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}
