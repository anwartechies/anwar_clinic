export interface StaffInviteTemplateData {
  recipientName: string;
  recipientEmail: string;
  roleName: string;
  department?: string | null;
  designation?: string | null;
  temporaryPassword?: string;
  loginUrl: string;
}

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

/**
 * Generates an email invitation template for newly invited staff members.
 */
export function getStaffInviteEmailTemplate(data: StaffInviteTemplateData): EmailContent {
  const { recipientName, recipientEmail, roleName, department, designation, temporaryPassword, loginUrl } = data;

  const subject = `Welcome to Nexgen Clinic - You've been invited to the Staff Portal`;

  const detailsRow = (label: string, value?: string | null) => {
    if (!value) return "";
    return `
      <tr>
        <td style="padding: 8px 12px; color: #64748b; font-size: 14px; font-weight: 500; border-bottom: 1px solid #f1f5f9; width: 140px;">
          ${label}
        </td>
        <td style="padding: 8px 12px; color: #1e293b; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f1f5f9;">
          ${value}
        </td>
      </tr>
    `;
  };

  const passwordBlock = temporaryPassword
    ? `
      <div style="margin: 24px 0; padding: 16px 20px; background-color: #f8fafc; border-left: 4px solid #0f766e; border-radius: 6px;">
        <p style="margin: 0 0 6px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 700;">
          Temporary Credentials
        </p>
        <p style="margin: 4px 0; font-size: 14px; color: #334155;">
          <strong>Email:</strong> <span style="font-family: monospace; color: #0f172a;">${recipientEmail}</span>
        </p>
        <p style="margin: 4px 0; font-size: 14px; color: #334155;">
          <strong>Temporary Password:</strong> <span style="font-family: monospace; background: #e2e8f0; padding: 2px 6px; border-radius: 4px; color: #0f172a; font-weight: 600;">${temporaryPassword}</span>
        </p>
        <p style="margin: 8px 0 0 0; font-size: 12px; color: #dc2626;">
          * For your security, your account will be activated upon your first login. Please change your password after logging in.
        </p>
      </div>
    `
    : `
      <div style="margin: 24px 0; padding: 16px 20px; background-color: #f8fafc; border-left: 4px solid #0f766e; border-radius: 6px;">
        <p style="margin: 0; font-size: 14px; color: #334155;">
          Log in with your registered email: <strong>${recipientEmail}</strong>
        </p>
      </div>
    `;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #334155;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container Card -->
        <table role="presentation" width="100%" style="max-width: 580px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0;" cellspacing="0" cellpadding="0">
          
          <!-- Clinic Brand Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f766e 0%, #115e59 100%); padding: 32px 36px; text-align: left;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.02em;">
                Nexgen Clinic
              </h1>
              <p style="margin: 6px 0 0 0; color: #ccfbf1; font-size: 14px;">
                Healthcare & Management Portal
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px;">
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #0f172a;">
                Hello ${recipientName || "there"},
              </h2>
              
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                You have been invited to join the <strong>Nexgen Clinic Staff Management Portal</strong> as a <strong>${roleName}</strong>.
              </p>

              <!-- Role & Assignment Details -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
                ${detailsRow("Assigned Role", roleName)}
                ${detailsRow("Department", department)}
                ${detailsRow("Designation", designation)}
                ${detailsRow("Portal Email", recipientEmail)}
              </table>

              <!-- Credentials Box -->
              ${passwordBlock}

              <!-- Action Button -->
              <div style="text-align: center; margin: 32px 0 24px 0;">
                <a href="${loginUrl}" target="_blank" style="display: inline-block; background-color: #0f766e; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 13px 32px; border-radius: 8px; box-shadow: 0 2px 4px rgba(15, 118, 110, 0.2);">
                  Sign In to Staff Portal
                </a>
              </div>

              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #94a3b8; text-align: center;">
                If the button doesn't work, copy and paste this link into your browser:<br/>
                <a href="${loginUrl}" style="color: #0f766e; word-break: break-all;">${loginUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 36px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b;">
                © ${new Date().getFullYear()} Nexgen Clinic. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                This is an automated invitation. If you were not expecting this, please contact the administrator.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
Welcome to Nexgen Clinic

Hello ${recipientName || "there"},

You have been invited to join the Nexgen Clinic Staff Management Portal.

Details:
- Role: ${roleName}
${department ? `- Department: ${department}\n` : ""}${designation ? `- Designation: ${designation}\n` : ""}- Email: ${recipientEmail}
${temporaryPassword ? `- Temporary Password: ${temporaryPassword}\n` : ""}

Login URL: ${loginUrl}

Please sign in and change your password upon your first login.

© ${new Date().getFullYear()} Nexgen Clinic. All rights reserved.
  `.trim();

  return { subject, html, text };
}
