import nodemailer from 'nodemailer';

const EMAIL_FROM = process.env.NEXT_PUBLIC_EMAIL_FROM;
const EMAIL_PASS = process.env.NEXT_PUBLIC_EMAIL_PASS;

if (!EMAIL_FROM || !EMAIL_PASS) {
    throw new Error('Email credentials are missing. Set EMAIL_FROM and EMAIL_PASS in server-only env.');
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_FROM,
        pass: EMAIL_PASS,
    },
});

type SendEmailOptions = {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
};

export const sendEmail = async ({ to, subject, html, text }: SendEmailOptions): Promise<string> => {
    try {
        const info = await transporter.sendMail({
            from: `"Insert" <${EMAIL_FROM}>`,
            to,
            subject,
            html
        });

        console.log('✅ Email sent:', info.messageId);
        return info.messageId;
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('❌ Error sending email:', message);
        throw new Error('❌ Error sending email: ' + message);
    }
};