import { gmail, auth, gmail_v1 } from "@googleapis/gmail";
import { config } from "../config";
import { logger } from "../logger";

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class MailService {
  private gmailClient: gmail_v1.Gmail | null = null;

  constructor() {
    if (config.mail.clientId && config.mail.clientSecret && config.mail.refreshToken) {
      try {
        const oauth2Client = new auth.OAuth2(
          config.mail.clientId,
          config.mail.clientSecret,
          "https://developers.google.com/oauthplayground"
        );
        oauth2Client.setCredentials({
          refresh_token: config.mail.refreshToken,
        });
        this.gmailClient = gmail({ version: "v1", auth: oauth2Client });
        logger.info("[Mailer] Gmail API v1 client initialized successfully", "Mailer");
      } catch (err) {
        logger.warn(`[Mailer] Failed to initialize Gmail client: ${(err as Error).message}`, "Mailer");
      }
    }
  }

  async sendMail(opts: SendMailOptions): Promise<{ success: boolean; messageId?: string }> {
    const brandHtml = this.wrapWithBrandTemplate(opts.subject, opts.html);

    if (!this.gmailClient) {
      logger.info(
        `[Mailer Dev Mode] Email to: ${opts.to} | Subject: "${opts.subject}"`,
        "Mailer",
        { to: opts.to, subject: opts.subject, textPreview: opts.text || "(HTML Content)" }
      );
      return { success: true, messageId: `dev-${Date.now()}` };
    }

    try {
      const utf8Subject = `=?utf-8?B?${Buffer.from(opts.subject).toString("base64")}?=`;
      const messageParts = [
        `From: "${config.app.name}" <${config.mail.sender}>`,
        `To: ${opts.to}`,
        `Subject: ${utf8Subject}`,
        "MIME-Version: 1.0",
        "Content-Type: text/html; charset=utf-8",
        "",
        brandHtml,
      ];
      const message = messageParts.join("\r\n");
      const encodedMessage = Buffer.from(message)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      const res = await this.gmailClient.users.messages.send({
        userId: "me",
        requestBody: {
          raw: encodedMessage,
        },
      });

      logger.info(`[Mailer] Email sent to ${opts.to} [ID: ${res.data.id}]`, "Mailer");
      return { success: true, messageId: res.data.id || undefined };
    } catch (err) {
      logger.error(`[Mailer] Error sending email to ${opts.to}: ${(err as Error).message}`, "Mailer", {
        error: (err as Error).stack,
      });
      return { success: false };
    }
  }

  private wrapWithBrandTemplate(title: string, bodyContent: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F9F8F6; margin: 0; padding: 40px 16px; color: #121212; }
          .container { max-width: 560px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; border: 1px solid #E5E3DF; overflow: hidden; }
          .header { background: #121212; padding: 24px 32px; border-bottom: 2px solid #C25E38; }
          .header h1 { margin: 0; color: #FFFFFF; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
          .header span { color: #C25E38; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-top: 4px; }
          .content { padding: 32px; font-size: 15px; line-height: 1.6; color: #3A3835; }
          .cta-btn { display: inline-block; background-color: #C25E38; color: #FFFFFF !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .footer { background: #F9F8F6; padding: 20px 32px; font-size: 12px; color: #7A7874; text-align: center; border-top: 1px solid #E5E3DF; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Ụlọ</h1>
            <span>Curated campus living</span>
          </div>
          <div class="content">
            <h2 style="color: #121212; margin-top: 0; font-size: 18px;">${title}</h2>
            ${bodyContent}
          </div>
          <div class="footer">
            <p>Ụlọ • UNN Campus Lodges, Nsukka</p>
            <p>Never pay rent before physical lodge inspection. Reservations are 100% free.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const mailer = new MailService();
