/**
 * Send an SMS via the configured SMS gateway.
 * Returns true if the message was dispatched (or logged in dev), false otherwise.
 */
export async function sendSMS(phone: string, message: string): Promise<boolean> {
  const smsUser = process.env.SMS_API_USER;
  const smsAuthKey = process.env.SMS_API_AUTH_KEY;
  const smsSender = process.env.SMS_API_SENDER || "PREMIUM";
  const smsEntityId = process.env.SMS_API_ENTITY_ID;
  const smsTemplateId = process.env.SMS_API_TEMPLATE_ID;
  const smsBaseUrl = process.env.SMS_API_BASE_URL;

  if (process.env.NODE_ENV === "development") {
    console.log(`\n[DEV SMS] To: ${phone}\nMessage: ${message}\n`);
  }

  if (!smsUser || !smsAuthKey || !smsBaseUrl) {
    if (process.env.NODE_ENV === "development") {
      console.warn("SMS API not configured — message logged only (dev mode)");
    }
    return false;
  }

  try {
    const url = `${smsBaseUrl}?user=${smsUser}&authkey=${smsAuthKey}&sender=${smsSender}&mobile=${phone}&text=${encodeURIComponent(message)}&output=json&entityid=${smsEntityId}&templateid=${smsTemplateId}`;
    const res = await fetch(url);
    const data = await res.json();
    if (process.env.NODE_ENV === "development") {
      console.log("SMS API response:", data?.status ?? "unknown");
    }
    return true;
  } catch (err) {
    console.error("SMS delivery failed:", (err as Error).message);
    return false;
  }
}
