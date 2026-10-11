import tls from "node:tls";

/** Days until the site's certificate ends, or null when it cannot be read. Used only to warn early. */
export function certDaysLeft(host: string, timeoutMs = 5000): Promise<number | null> {
  return new Promise((resolve) => {
    let settled = false;
    const done = (value: number | null) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };
    try {
      const socket = tls.connect({ host, port: 443, servername: host, rejectUnauthorized: false, timeout: timeoutMs }, () => {
        const cert = socket.getPeerCertificate();
        socket.end();
        const end = cert?.valid_to ? Date.parse(cert.valid_to) : NaN;
        done(Number.isNaN(end) ? null : Math.floor((end - Date.now()) / 86_400_000));
      });
      socket.on("error", () => done(null));
      socket.on("timeout", () => {
        socket.destroy();
        done(null);
      });
    } catch {
      done(null);
    }
  });
}
