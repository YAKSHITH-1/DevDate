import {
  BREVO_API_KEY,
  BREVO_SENDER_EMAIL,
  BREVO_SENDER_NAME,
  NODE_ENV,
} from "../config/env.js";

/**
 * Sends a transactional email using Brevo's official v3 HTTP API.
 * Uses native fetch with a 10-second timeout.
 * 
 * @param {Object} params
 * @param {string} params.to - Recipient email address
 * @param {string} [params.toName] - Recipient display name
 * @param {string} params.subject - Email subject line
 * @param {string} params.htmlContent - HTML message content
 * @returns {Promise<{ success: boolean, messageId: string }>}
 */
export const sendBrevoEmail = async ({ to, toName, subject, htmlContent }) => {
  // Test mode safety: Never call external email API during automated testing
  if ((process.env.NODE_ENV || NODE_ENV) === "test") {
    return { success: true, messageId: "test-mock-brevo-id" };
  }

  if (!BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY is not configured on the server.");
  }

  const payload = {
    sender: {
      name: BREVO_SENDER_NAME,
      email: BREVO_SENDER_EMAIL,
    },
    to: [
      {
        email: to,
        name: toName || to,
      },
    ],
    subject,
    htmlContent,
  };

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10000),
  });

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = responseData?.message || responseData?.code || `HTTP ${response.status}`;
    throw new Error(`Brevo API error (${response.status}): ${errorMsg}`);
  }

  return {
    success: true,
    messageId: responseData?.messageId || "brevo-sent",
  };
};

/**
 * Sends a modern, styled HTML email containing the verification OTP via Brevo.
 * 
 * @param {string} email - Destination email address
 * @param {string} otp - Plain 6-digit OTP
 * @param {number} expiryMinutes - Expiration time in minutes (default: 10)
 */
export const sendVerificationEmail = async (email, otp, expiryMinutes = 10) => {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DevDate Verification Code</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0f172a; padding: 32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" style="max-width: 540px; background-color: #1e293b; border-radius: 12px; border: 1px solid #334155; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <h1 style="margin: 0; color: #38bdf8; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">DevDate</h1>
                    <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 14px;">Connect with Developers. Build Together.</p>
                  </td>
                </tr>
                <tr>
                  <td style="color: #f1f5f9; font-size: 16px; line-height: 1.6; padding-bottom: 24px;">
                    <p style="margin: 0 0 12px 0;">Hello,</p>
                    <p style="margin: 0;">Thank you for registering on <strong>DevDate</strong>. Please use the one-time verification code below to verify your email address and activate your developer profile:</p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 16px 0 24px 0;">
                    <div style="background: linear-gradient(135deg, #0284c7 0%, #3b82f6 100%); color: #ffffff; font-size: 32px; font-weight: 800; letter-spacing: 8px; padding: 16px 32px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4);">
                      ${otp}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <p style="margin: 0; color: #f87171; font-size: 13px; font-weight: 600;">
                      ⏱️ This verification code is valid for <strong>${expiryMinutes} minutes</strong>.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="border-top: 1px solid #334155; padding-top: 24px; color: #64748b; font-size: 12px; line-height: 1.5; text-align: center;">
                    <p style="margin: 0 0 6px 0;">If you did not initiate this request, you can safely ignore this message.</p>
                    <p style="margin: 0;">&copy; ${new Date().getFullYear()} DevDate Platform. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    return await sendBrevoEmail({
      to: email,
      subject: "DevDate — Your Email Verification Code",
      htmlContent,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Sends a modern, styled HTML email containing a secure password reset link via Brevo.
 * 
 * @param {string} email - Destination recipient email
 * @param {string} resetUrl - Complete password reset URL containing the raw token
 * @param {number} expiryMinutes - Expiration time in minutes (default: 15)
 */
export const sendPasswordResetEmail = async (email, resetUrl, expiryMinutes = 15) => {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DevDate Password Reset</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0f172a; padding: 32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" style="max-width: 540px; background-color: #1e293b; border-radius: 12px; border: 1px solid #334155; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <h1 style="margin: 0; color: #38bdf8; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">DevDate</h1>
                    <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 14px;">Connect with Developers. Build Together.</p>
                  </td>
                </tr>
                <tr>
                  <td style="color: #f1f5f9; font-size: 16px; line-height: 1.6; padding-bottom: 24px;">
                    <p style="margin: 0 0 12px 0;">Hello,</p>
                    <p style="margin: 0;">We received a request to reset your DevDate account password. Click the button below to choose a new password:</p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 16px 0 24px 0;">
                    <a href="${resetUrl}" target="_blank" style="background: linear-gradient(135deg, #0284c7 0%, #3b82f6 100%); color: #ffffff; font-size: 16px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4);">
                      Reset My Password
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <p style="margin: 0; color: #f87171; font-size: 13px; font-weight: 600;">
                      ⏱️ This password reset link is valid for <strong>${expiryMinutes} minutes</strong> and can only be used once.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="border-top: 1px solid #334155; padding-top: 24px; color: #64748b; font-size: 12px; line-height: 1.5; text-align: center;">
                    <p style="margin: 0 0 6px 0;">If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
                    <p style="margin: 0;">&copy; ${new Date().getFullYear()} DevDate Platform. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    return await sendBrevoEmail({
      to: email,
      subject: "DevDate — Password Reset Request",
      htmlContent,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Backward-compatible transporter stub
 */
export const createTransporter = async () => ({
  sendMail: async (options) => {
    return sendBrevoEmail({
      to: options.to,
      subject: options.subject,
      htmlContent: options.html,
    });
  },
});

export default {
  sendBrevoEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  createTransporter,
};
