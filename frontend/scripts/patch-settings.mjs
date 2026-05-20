import fs from 'fs'

const p = new URL('../app/settings/page.tsx', import.meta.url)
let c = fs.readFileSync(p, 'utf8')

if (c.includes('ProfileSettingsForm\n            initialUser')) {
  console.log('already patched')
  process.exit(0)
}

const replacement = `
          <ProfileSettingsForm
            initialUser={user}
            onSaved={(updated) => setUser(updated)}
          />`

const re =
  /\n          <div className="space-y-4">[\s\S]*?<Button className="bg-\[#C9A227\][^"]*">[\s\S]*?Save Changes[\s\S]*?<\/Button>\s*<\/motion>/

if (!re.test(c)) {
  const re2 =
    /\n          <div className="space-y-4">[\s\S]*?Save Changes[\s\S]*?<\/div>\n        <\/SettingsSection>/
  if (!re2.test(c)) {
    console.error('pattern not found')
    process.exit(1)
  }
  c = c.replace(re2, `${replacement}\n        </SettingsSection>`)
} else {
  c = c.replace(re, replacement)
}

fs.writeFileSync(p, c)
console.log('patched ok')
