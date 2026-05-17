import dns from "node:dns";
import mongoose, { type ConnectOptions } from "mongoose";

/**
 * Node 17+ dual-stack “happy eyeballs” can produce `ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR`
 * against Atlas on some Windows/ISP networks; force IPv4 + disable auto family select.
 */
export const MONGOOSE_ATLAS_CONNECT_OPTS: ConnectOptions = {
  family: 4,
  autoSelectFamily: false,
};

/** Apply before any `mongodb+srv` SRV lookup (Next dev / API may import this late). */
export function applyMongoDnsFromEnv(): void {
  const dnsServers = process.env.MONGODB_DNS_SERVERS?.trim();
  if (dnsServers) {
    try {
      dns.setServers(
        dnsServers
          .split(/[,;\s]+/)
          .map((s) => s.trim())
          .filter(Boolean)
      );
    } catch {
      /* ignore invalid list */
    }
  }
  try {
    dns.setDefaultResultOrder?.("ipv4first");
  } catch {
    /* ignore */
  }
}

applyMongoDnsFromEnv();

export function isMongoSrvDnsFailure(err: unknown): boolean {
  const e = err as { syscall?: string; message?: string };
  const msg = String(e?.message ?? err);
  return (
    e?.syscall === "querySrv" ||
    msg.includes("querySrv") ||
    msg.includes("_mongodb._tcp")
  );
}

/** Wrong DB user/password in URI, or password not URL-encoded. */
export function isMongoAuthFailure(err: unknown): boolean {
  const blob = collectErrorMessages(err).join("|").toLowerCase();
  return (
    blob.includes("bad auth") ||
    blob.includes("authentication failed") ||
    blob.includes("mongoservererror: bad auth")
  );
}

function collectErrorMessages(err: unknown): string[] {
  const parts: string[] = [];
  let cur: unknown = err;
  for (let i = 0; i < 6 && cur; i++) {
    parts.push(String(cur instanceof Error ? cur.message : cur));
    cur = (cur as { cause?: unknown })?.cause;
  }
  return parts;
}

/** TLS fails before MongoDB wire protocol (often firewall / DPI on outbound 27017). */
export function isMongoTlsLikeFailure(err: unknown): boolean {
  const blob = collectErrorMessages(err).join("|");
  return (
    blob.includes("ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR") ||
    blob.includes("tlsv1 alert internal error") ||
    blob.includes("ssl3_read_bytes")
  );
}

/**
 * Connect with `mongodb+srv://`; if SRV DNS fails and `MONGODB_URI_DIRECT` is set
 * (Atlas "standard" `mongodb://host:27017,...`), retry with that URI.
 */
export async function mongooseConnectWithSrvFallback(primaryUri: string): Promise<void> {
  applyMongoDnsFromEnv();

  const direct = process.env.MONGODB_URI_DIRECT?.trim();

  try {
    await mongoose.connect(primaryUri, MONGOOSE_ATLAS_CONNECT_OPTS);
    return;
  } catch (err) {
    if (!isMongoSrvDnsFailure(err) || !direct || direct === primaryUri) {
      throw err;
    }
    if (direct.startsWith("mongodb+srv://")) {
      throw new Error(
        "MONGODB_URI_DIRECT must use mongodb:// (Atlas “standard connection string”), not mongodb+srv:// — SRV DNS is what failed on the primary URI."
      );
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect().catch(() => {});
    }
    await mongoose.connect(direct, MONGOOSE_ATLAS_CONNECT_OPTS);
  }
}
