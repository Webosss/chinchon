const fs = require('fs')
module.exports = async () => {
  try{
    const pid = Number(fs.readFileSync('.ws-server-pid', 'utf8'))
    if(pid) process.kill(pid)
  }catch(e){ /* ignore */ }
  try{ fs.unlinkSync('.ws-server-pid') }catch(e){ }
}
