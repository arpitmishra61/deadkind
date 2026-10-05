import { createHash } from "crypto";

const ADMIN_COOKIE = "__dk_admin";

function getExpectedToken() {
  const password = process.env.ADMIN_PASSWORD || "password@123";
  return createHash("sha256").update(password + "dk-admin-2050").digest("hex");
}

export function verifyAdminRequest(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/__dk_admin=([^;]+)/);
  const token = match ? decodeURIComponent(match[1]) : null;
  return token === getExpectedToken();
}

export function getAdminToken() {
  return getExpectedToken();
}

export { ADMIN_COOKIE };
