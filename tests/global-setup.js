const { spawn } = require('child_process')
const fs = require('fs')

module.exports = async () => {
  // Start the WS server in background
  const proc = spawn('npm', ['run', 'start:server'], { cwd: process.cwd(), shell: true, stdio: ['ignore', 'pipe', 'pipe'] })
  // Write PID for teardown
  fs.writeFileSync('.ws-server-pid', String(proc.pid))

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      proc.kill()
      reject(new Error('WS server did not start in time'))
    }, 10000)

    proc.stdout.on('data', (d) => {
      const s = d.toString()
      if (s.includes('WebSocket server listening')) {
        clearTimeout(timeout)
        // give it a moment to settle
        setTimeout(resolve, 200)
      }
    })

    proc.on('error', (err) => {
      clearTimeout(timeout)
      reject(err)
    })
  })
}
