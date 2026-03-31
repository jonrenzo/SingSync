import { networkInterfaces } from 'os'

export function getLocalIp(): string | undefined {
  const nets = networkInterfaces()
  for (const name of Object.keys(nets)) {
    const netArray = nets[name]
    if (!netArray) continue
    for (const net of netArray) {
      const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
      if (net.family === familyV4Value && !net.internal) {
        return net.address
      }
    }
  }
  return undefined
}
