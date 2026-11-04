import { createClient } from '@supabase/supabase-js'

const DEFAULT_EMAILS = {
  local: 'test@123.com',
  production: 'jacobo@gmail.com',
}

function requiredEnv(name) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} is required`)
  return value
}

function configuredEmail() {
  const explicitEmail = process.env.ADMIN_EMAIL?.trim()
  if (explicitEmail) return explicitEmail

  const environment = process.env.APP_ENV?.trim()
  if (environment !== 'local' && environment !== 'production') {
    throw new Error('ADMIN_EMAIL is required unless APP_ENV is explicitly local or production')
  }
  return DEFAULT_EMAILS[environment]
}

async function findUsersByEmail(admin, email) {
  const users = []
  const perPage = 1000

  for (let page = 1; ; page += 1) {
    const { data, error } = await admin.listUsers({ page, perPage })
    if (error) throw new Error(`Could not list users: ${error.message}`)

    users.push(...data.users.filter((user) => user.email === email))
    if (data.users.length < perPage) return users
  }
}

async function main() {
  const url = requiredEnv('SUPABASE_URL')
  const serviceRoleKey = requiredEnv('SUPABASE_SERVICE_ROLE_KEY')
  const email = configuredEmail()
  const supabase = createClient(url, serviceRoleKey)
  const matches = await findUsersByEmail(supabase.auth.admin, email)

  if (matches.length === 0) throw new Error(`No user found for ADMIN_EMAIL (${email})`)
  if (matches.length > 1) throw new Error(`Multiple users found for ADMIN_EMAIL (${email})`)

  const user = matches[0]
  const appMetadata = {
    ...(user.app_metadata ?? {}),
    role: 'admin',
  }
  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    app_metadata: appMetadata,
  })
  if (error) throw new Error(`Could not update administrator: ${error.message}`)

  console.log(`Administrator synchronized for ${email}`)
}

main().catch((error) => {
  console.error(`Admin synchronization failed: ${error.message}`)
  process.exitCode = 1
})
