import { NextResponse } from "next/server";

export interface SendSmsResult {
  sent: boolean;
  method: string;
  reason?: string;
}

/**
 * Send OTP via SMS to a phone number.
 * Supports Twilio, Fast2SMS / custom SMS gateways, or dev console fallback.
 */
export async function sendOtpSms(toPhone: string, otp: string): Promise<SendSmsResult> {
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

  const fast2smsKey = process.env.FAST2SMS_API_KEY;

  // Format phone number to clean standard format
  const cleanDigits = toPhone.replace(/\D/g, "");
  const formattedPhone = toPhone.trim().startsWith("+")
    ? toPhone.trim()
    : `+91${cleanDigits.slice(-10)}`;

  if (twilioSid && twilioAuthToken && twilioFrom) {
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString("base64");
      const body = new URLSearchParams({
        To: formattedPhone,
        From: twilioFrom,
        Body: `Your WorkHub verification code is: ${otp}. Valid for 10 minutes.`,
      });

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Twilio API request failed");
      }

      console.log(`[SMS Sent via Twilio] OTP ${otp} sent to ${formattedPhone}`);
      return { sent: true, method: "twilio" };
    } catch (err: any) {
      console.error(`[Twilio SMS Failed]:`, err.message);
      return {
        sent: false,
        method: "twilio_error",
        reason: err.message,
      };
    }
  } else if (fast2smsKey) {
    try {
      const numbers = cleanDigits.slice(-10);
      const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: fast2smsKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "otp",
          variables_values: otp,
          numbers: numbers,
        }),
      });

      const data = await response.json();
      if (data.return) {
        console.log(`[SMS Sent via Fast2SMS] OTP ${otp} sent to ${formattedPhone}`);
        return { sent: true, method: "fast2sms" };
      } else {
        throw new Error(data.message || "Fast2SMS dispatch failed");
      }
    } catch (err: any) {
      console.error(`[Fast2SMS Failed]:`, err.message);
      return {
        sent: false,
        method: "fast2sms_error",
        reason: err.message,
      };
    }
  } else {
    console.log(`[SMS Config Missing - Console Fallback] To: ${formattedPhone} | OTP Code: ${otp}`);
    return {
      sent: false,
      method: "console",
      reason: "Configure TWILIO or FAST2SMS credentials in .env to send real phone SMS",
    };
  }
}
