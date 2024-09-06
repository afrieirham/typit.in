import { createServer } from "http";
import next from "next";
import os from "os";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const PORT = 3000;
  const localIP = getLocalIP();

  server.listen(PORT, "0.0.0.0", (err) => {
    if (err) throw err;
    console.log(`   ▲ Next.js 14.1.0`);
    console.log(`   - Local:        http://localhost:${PORT}`);
    console.log(`   - Network:      http://${localIP}:${PORT}`);
  });
});
