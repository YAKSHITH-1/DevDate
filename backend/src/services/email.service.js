import nodemailer from "nodemailer";
import {
  BREVO_API_KEY,
  BREVO_SENDER_EMAIL,
  BREVO_SENDER_NAME,
  EMAIL_USER,
  EMAIL_PASS,
  NODE_ENV,
} from "../config/env.js";

/**
 * Universal email dispatcher supporting:
 * 1. Gmail / SMTP via Nodemailer (EMAIL_USER & EMAIL_PASS)
 * 2. Brevo transactional API (BREVO_API_KEY)
 * 3. Fallback error with clear terminal guidance
 */
export const sendEmail = async ({ to, toName, subject, htmlContent }) => {
  // Test mode safety: Never call external email API during automated testing
  if ((process.env.NODE_ENV || NODE_ENV) === "test") {
    return { success: true, messageId: "test-mock-email-id" };
  }

  // 1. If Gmail / SMTP credentials (EMAIL_USER & EMAIL_PASS) are provided, use Nodemailer
  if (EMAIL_USER && EMAIL_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS,
        },
      });

      const senderName = BREVO_SENDER_NAME || "DevDate";
      const info = await transporter.sendMail({
        from: `"${senderName}" <${EMAIL_USER}>`,
        to,
        subject,
        html: htmlContent,
      });

      console.log(`✅ [EMAIL] Successfully sent email to ${to} via Gmail SMTP (Message ID: ${info.messageId})`);
      return {
        success: true,
        messageId: info.messageId || "gmail-sent",
      };
    } catch (smtpError) {
      console.error(`❌ [EMAIL] Failed to send email via Gmail SMTP: ${smtpError.message}`);
      throw smtpError;
    }
  }

  // 2. If Brevo API Key is configured, use Brevo HTTP API
  if (BREVO_API_KEY) {
    return await sendBrevoEmail({ to, toName, subject, htmlContent });
  }

  // 3. Neither configured
  const guideMsg =
    "No email provider configured. To receive real emails in your inbox, set either:\n" +
    "  1) EMAIL_USER & EMAIL_PASS (Gmail 16-character App Password) in backend/.env\n" +
    "  2) BREVO_API_KEY in backend/.env";
  console.warn(`⚠️ [EMAIL WARNING] ${guideMsg}`);
  throw new Error(guideMsg);
};

/**
 * Sends a transactional email using Brevo's official v3 HTTP API.
 * Uses native fetch with a 10-second timeout.
 */
export const sendBrevoEmail = async ({ to, toName, subject, htmlContent }) => {
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

  console.log(`✅ [EMAIL] Successfully sent email to ${to} via Brevo API`);
  return {
    success: true,
    messageId: responseData?.messageId || "brevo-sent",
  };
};

/**
 * Sends a Playful Pop Art x Doodle Art HTML email containing the verification OTP.
 * 
 * @param {string} email - Destination email address
 * @param {string} otp - Plain 6-digit OTP
 * @param {number} expiryMinutes - Expiration time in minutes (default: 10)
 */
export const sendVerificationEmail = async (email, otp, expiryMinutes = 10) => {
  try {
    const digits = String(otp).padStart(6, "0").split("");
    const otpBoxesHtml = digits
      .map(
        (d) => `
          <td align="center" style="padding: 0 4px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
              <tr>
                <td align="center" valign="middle" style="width: 46px; height: 56px; background-color: #FFDE00; border: 3px solid #18181B; border-radius: 10px; box-shadow: 3px 3px 0px #18181B; text-align: center; font-size: 32px; font-weight: 900; color: #18181B; font-family: 'Arial Black', Impact, sans-serif; line-height: 56px;">
                  ${d}
                </td>
              </tr>
            </table>
          </td>
        `
      )
      .join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DevDate — Verification Code</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #FAF6EB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #FAF6EB; padding: 36px 14px;">
          <tr>
            <td align="center">
              <!-- MAIN POP ART CONTAINER CARD -->
              <table role="presentation" width="100%" style="max-width: 520px; background-color: #FFFFFF; border: 4px solid #18181B; border-radius: 24px; box-shadow: 8px 8px 0px #18181B; overflow: hidden;" cellspacing="0" cellpadding="0" border="0">
                
                <!-- TOP HEADER: CYAN POP ART HERO -->
                <tr>
                  <td style="background-color: #38BDF8; padding: 22px 24px; border-bottom: 4px solid #18181B; text-align: center;">
                    <!-- Badge Row -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 14px;">
                      <tr>
                        <td align="left">
                          <span style="display: inline-block; background-color: #FFDE00; border: 2px solid #18181B; border-radius: 9999px; padding: 4px 10px; font-size: 10px; font-weight: 900; color: #18181B; letter-spacing: 0.5px; box-shadow: 2px 2px 0px #18181B;">
                            ★ VERIFIED BUILDER
                          </span>
                        </td>
                        <td align="right">
                          <span style="display: inline-block; background-color: #FF4B4B; border: 2px solid #18181B; border-radius: 6px; padding: 4px 10px; font-size: 10px; font-weight: 900; color: #FFFFFF; letter-spacing: 0.6px; transform: rotate(2deg); box-shadow: 2px 2px 0px #18181B;">
                            POW! // SQUAD UP
                          </span>
                        </td>
                      </tr>
                    </table>

                    <!-- Brand Hero Title -->
                    <h1 style="margin: 0; color: #FFFFFF; font-size: 38px; font-weight: 900; font-style: italic; letter-spacing: 2px; text-transform: uppercase; font-family: 'Arial Black', Impact, sans-serif; text-shadow: 3px 3px 0px #18181B;">
                      DEVDATE
                    </h1>
                    
                    <!-- Monospace Breadcrumb -->
                    <div style="margin-top: 6px;">
                      <span style="background-color: #FFFFFF; border: 2px solid #18181B; border-radius: 9999px; padding: 3px 12px; font-size: 11px; font-weight: 800; color: #18181B; font-family: 'Courier New', Courier, monospace; letter-spacing: 0.5px;">
                        // 2-STEP RIG AUTHENTICATION
                      </span>
                    </div>
                  </td>
                </tr>

                <!-- BODY SECTION: DOODLE ART & OTP -->
                <tr>
                  <td style="padding: 28px 24px 20px 24px; background-color: #FFFFFF;">
                    
                    <!-- Greeting Speech Bubble -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 18px;">
                      <tr>
                        <td>
                          <div style="background-color: #FEF9C3; border: 2.5px solid #18181B; border-radius: 12px; padding: 12px 16px; box-shadow: 3px 3px 0px #18181B;">
                            <p style="margin: 0; color: #18181B; font-size: 14px; font-weight: 900; letter-spacing: 0.4px;">
                               HEY BUILDER! READY TO SQUAD UP?
                            </p>
                            <p style="margin: 6px 0 0 0; color: #4B5563; font-size: 13px; font-weight: 600; line-height: 1.4;">
                              Your terminal is ready. Enter this one-time 6-digit access token to verify your account and claim your pass to the campus hack squad:
                            </p>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- 6-DIGIT OTP POP ART TOKEN DISPLAY -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 22px 0 16px 0;">
                      <tr>
                        <td align="center">
                          <!-- BAM sticker tag -->
                          <div style="margin-bottom: 10px;">
                            <span style="display: inline-block; background-color: #4ADE80; border: 2px solid #18181B; border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 900; color: #18181B; box-shadow: 2px 2px 0px #18181B;">
                              ✦ 6-DIGIT ACCESS TOKEN ✦
                            </span>
                          </div>

                          <!-- The 6 Digit Boxes -->
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              ${otpBoxesHtml}
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Expiry & Security Status Banner -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 18px 0;">
                      <tr>
                        <td align="center">
                          <span style="display: inline-block; background-color: #DCFCE7; border: 2px solid #22C55E; border-radius: 9999px; padding: 6px 14px; font-size: 12px; font-weight: 800; color: #15803D;">
                            ⏱ EXPIRES IN <strong>${expiryMinutes} MINUTES</strong> 
                          </span>
                        </td>
                      </tr>
                    </table>


                <!-- FOOTER: RETRO TERMINAL & DOODLE SIGN-OFF -->
                <tr>
                  <td style="background-color: #FAF6EB; padding: 18px 24px; border-top: 3.5px solid #18181B; text-align: center;">
                    <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; color: #6B7280; line-height: 1.4;">
                      If you didn't request this rig authentication, you can safely disregard this transmission.
                    </p>
                    <p style="margin: 0; font-size: 11px; font-weight: 900; color: #18181B; font-family: 'Courier New', Courier, monospace; letter-spacing: 0.5px;">
                      &gt;_ DEVDATE PLATFORM 2026 // END-TO-END SECURE
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    return await sendEmail({
      to: email,
      subject: " DevDate — Your 6-Digit Verification Code",
      htmlContent,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Sends a Playful Pop Art x Doodle Art HTML email containing a secure password reset link.
 * 
 * @param {string} email - Destination recipient email
 * @param {string} resetUrl - Complete password reset URL containing the raw token
 * @param {number} expiryMinutes - Expiration time in minutes (default: 15)
 */
export const sendPasswordResetEmail = async (email, resetUrl, expiryMinutes = 15) => {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DevDate — Password Reset</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #FAF6EB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #FAF6EB; padding: 36px 14px;">
          <tr>
            <td align="center">
              <!-- MAIN POP ART CONTAINER CARD -->
              <table role="presentation" width="100%" style="max-width: 520px; background-color: #FFFFFF; border: 4px solid #18181B; border-radius: 24px; box-shadow: 8px 8px 0px #18181B; overflow: hidden;" cellspacing="0" cellpadding="0" border="0">
                
                <!-- TOP HEADER: CORAL POP ART HERO -->
                <tr>
                  <td style="background-color: #FF4B4B; padding: 22px 24px; border-bottom: 4px solid #18181B; text-align: center;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 14px;">
                      <tr>
                        <td align="left">
                          <span style="display: inline-block; background-color: #FFDE00; border: 2px solid #18181B; border-radius: 9999px; padding: 4px 10px; font-size: 10px; font-weight: 900; color: #18181B; box-shadow: 2px 2px 0px #18181B;">
                             RIG SECURITY
                          </span>
                        </td>
                        <td align="right">
                          <span style="display: inline-block; background-color: #FFFFFF; border: 2px solid #18181B; border-radius: 6px; padding: 4px 10px; font-size: 10px; font-weight: 900; color: #18181B; transform: rotate(-2deg); box-shadow: 2px 2px 0px #18181B;">
                            BOOM! // RIG RESET
                          </span>
                        </td>
                      </tr>
                    </table>

                    <h1 style="margin: 0; color: #FFFFFF; font-size: 36px; font-weight: 900; font-style: italic; letter-spacing: 2px; text-transform: uppercase; font-family: 'Arial Black', Impact, sans-serif; text-shadow: 3px 3px 0px #18181B;">
                      DEVDATE
                    </h1>
                    
                    <div style="margin-top: 6px;">
                      <span style="background-color: #18181B; border: 2px solid #FFFFFF; border-radius: 9999px; padding: 3px 12px; font-size: 11px; font-weight: 800; color: #FFFFFF; font-family: 'Courier New', Courier, monospace;">
                        // ACCESS KEY RECOVERY
                      </span>
                    </div>
                  </td>
                </tr>

                <!-- BODY SECTION -->
                <tr>
                  <td style="padding: 28px 24px; background-color: #FFFFFF;">
                    
                    <!-- Speech bubble notice -->
                    <div style="background-color: #FAF6EB; border: 2.5px solid #18181B; border-radius: 12px; padding: 14px 16px; box-shadow: 3px 3px 0px #18181B; margin-bottom: 22px;">
                      <p style="margin: 0; color: #18181B; font-size: 14px; font-weight: 900;">
                        RESET YOUR ACCESS KEY (PASSWORD)
                      </p>
                      <p style="margin: 6px 0 0 0; color: #4B5563; font-size: 13px; font-weight: 600; line-height: 1.4;">
                        We received a dispatch to reset the access key for your DevDate profile. Click the big button below to choose a fresh password:
                      </p>
                    </div>

                    <!-- POP ART BIG CTA BUTTON -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0 20px 0;">
                      <tr>
                        <td align="center">
                          <a href="${resetUrl}" target="_blank" style="display: inline-block; background-color: #FFDE00; color: #18181B; font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; text-decoration: none; padding: 16px 36px; border: 3.5px solid #18181B; border-radius: 9999px; box-shadow: 5px 5px 0px #18181B; font-family: 'Arial Black', Impact, sans-serif;">
                             RESET MY PASSWORD ➔
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Expiry warning pill -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 12px 0;">
                      <tr>
                        <td align="center">
                          <span style="display: inline-block; background-color: #FEE2E2; border: 2px solid #EF4444; border-radius: 9999px; padding: 5px 12px; font-size: 11.5px; font-weight: 800; color: #B91C1C;">
                            LINK VALID FOR <strong>${expiryMinutes} MINUTES</strong> (ONE-TIME USE)
                          </span>
                        </td>
                      </tr>
                    </table>

                    <!-- Fallback link in terminal box -->
                    <div style="background-color: #F3F4F6; border: 1.5px solid #D1D5DB; border-radius: 8px; padding: 10px; margin-top: 20px; word-break: break-all;">
                      <p style="margin: 0 0 4px 0; font-size: 10.5px; font-weight: 800; color: #6B7280;">BUTTON NOT CLICKABLE? COPY THIS LINK:</p>
                      <a href="${resetUrl}" target="_blank" style="font-size: 11px; color: #0284C7; font-family: 'Courier New', Courier, monospace; text-decoration: underline;">
                        ${resetUrl}
                      </a>
                    </div>

                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td style="background-color: #FAF6EB; padding: 18px 24px; border-top: 3.5px solid #18181B; text-align: center;">
                    <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; color: #6B7280; line-height: 1.4;">
                      If you did not request this, your password remains completely unchanged.
                    </p>
                    <p style="margin: 0; font-size: 11px; font-weight: 900; color: #18181B; font-family: 'Courier New', Courier, monospace;">
                      &gt;_ DEVDATE PLATFORM 2026 // ALL RIGHTS RESERVED
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    return await sendEmail({
      to: email,
      subject: " DevDate — Reset Your Access Key",
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
    return sendEmail({
      to: options.to,
      subject: options.subject,
      htmlContent: options.html,
    });
  },
});

export default {
  sendEmail,
  sendBrevoEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  createTransporter,
};
