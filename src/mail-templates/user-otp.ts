
export const userOTPEmail = (username: string, otp: string | number) => {
    const subject = `Insert • Verify your email, ${username}`;

    const html = `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
  <head>
    <title>Verify your email</title>
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;600;700&display=swap" rel="stylesheet" />
    <style type="text/css">
      /* Base reset */
      html, body { margin: 0; padding: 0; height: 100%; }
      body {
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
        background-color: #F3F4F6;
        font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
        color: #111827;
      }
      table, td { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
      img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
      a { color: #111827; text-decoration: none; }
      p { margin: 0; }
      /* Utility */
      .container { width: 100%; max-width: 600px; margin: 0 auto; background: #ffffff; }
      .pad-0 { padding: 0; }
      .pad-24 { padding: 24px; }
      .pad-32 { padding: 32px; }
      .text-center { text-align: center; }
      .muted { color: #6B7280; }
      .btn {
        display: inline-block;
        padding: 12px 22px;
        background: #111827;
        color: #ffffff !important;
        border-radius: 8px;
        font-size: 14px;
      }
      .otp-box {
        display: inline-block;
        margin-top: 12px;
        padding: 14px 18px;
        border: 1px solid #E5E7EB;
        border-radius: 10px;
        background: #F9FAFB;
        font-size: 26px;
        font-weight: 700;
        letter-spacing: 6px;
        color: #111827;
      }
      .card {
        border: 1px solid #E5E7EB;
        border-radius: 12px;
        background: #ffffff;
      }
      @media only screen and (max-width: 480px) {
        .pad-32 { padding: 22px !important; }
        .otp-box { font-size: 22px !important; letter-spacing: 4px !important; }
      }
    </style>
  </head>
  <body>
    <!-- Preheader (hidden) -->
    <div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
      Use the code below to verify your email for Insert.
    </div>

    <div style="background-color:#F3F4F6;">
      <!-- Hero -->
      <div class="container">
        <table role="presentation" width="100%">
          <tr>
            <td class="pad-0 text-center">
              <img
                src="https://res.cloudinary.com/dgxeg3sju/image/upload/v1767330377/8cf2847e-c96f-4064-b645-e47211780c6b.png"
                alt="Insert"
                width="600"
                style="width:100%;max-width:600px;display:block;"
                draggable="false"
                oncontextmenu="return false"
              />
            </td>
          </tr>
        </table>
      </div>

      <!-- Content card -->
      <div class="container">
        <table role="presentation" width="100%">
          <tr>
            <td class="pad-32 text-center">
              <h1 style="margin:0 0 8px; font-size:22px; font-weight:700;">Verify your email</h1>
              <p class="muted" style="font-size:15px; line-height:1.6; margin:0 0 16px;">
                Hey ${username}, enter this code to complete your verification.
              </p>

              <div class="otp-box" aria-label="Your verification code">${otp}</div>

              <p class="muted" style="font-size:12px; line-height:1.6; margin:14px 0 0;">
                This code expires in a 5 minutes. Do not share it with anyone.
              </p>

              <div style="margin-top:20px;">
                <a class="btn" href="https://insertshare.vercel.app/" target="_blank" rel="noopener">Open Insert</a>
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Footer -->
      <div style="max-width:600px;margin:0 auto;">
        <table role="presentation" width="100%">
          <tr>
            <td class="pad-24 text-center">
              <p class="muted" style="font-size:12px;">&copy; 2025 Insert. All rights reserved.</p>
              <p class="muted" style="font-size:12px; margin-top:6px;">
                If you didn’t request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </body>
</html>
  `;

    return { subject, html };
};