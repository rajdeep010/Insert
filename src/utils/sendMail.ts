import nodemailer from 'nodemailer';

const getEmailCredentials = () => {
    const emailFrom = process.env.EMAIL_FROM || process.env.NEXT_PUBLIC_EMAIL_FROM;
    const emailPass = process.env.EMAIL_PASS || process.env.NEXT_PUBLIC_EMAIL_PASS;

    if (!emailFrom || !emailPass) {
        throw new Error('Email credentials are missing. Set EMAIL_FROM and EMAIL_PASS in server-only env.');
    }

    return { emailFrom, emailPass };
};

const createTransporter = () => {
    const { emailFrom, emailPass } = getEmailCredentials();

    return {
        transporter: nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: emailFrom,
                pass: emailPass,
            },
        }),
        emailFrom,
    };
};

type SendEmailOptions = {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
};

export const sendEmail = async ({ to, subject, html, text }: SendEmailOptions): Promise<string> => {
    try {
        const { transporter, emailFrom } = createTransporter();
        const info = await transporter.sendMail({
            from: `"Insert" <${emailFrom}>`,
            to,
            subject,
            html
        });

        // console.log('✅ Email sent:', info.messageId);
        return info.messageId;
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('❌ Error sending email:', message);
        throw new Error('❌ Error sending email: ' + message);
    }
};