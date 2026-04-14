import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendTicketEmail = async (userEmail: string, movieTitle: string, theater: string, time: string, seats: string, amount: number, orderId: string) => {
  try {
    console.log(`📧 Attempting to send email via Resend to: ${userEmail}`);

    const data = await resend.emails.send({
      // Resend Free Tier requires you to use their onboarding domain
      from: 'MovieHub Tickets <onboarding@resend.dev>', 
      // Resend Free Tier only allows sending to the email you verified your account with
      to: userEmail, 
      subject: `🎬 Your Tickets are Confirmed: ${movieTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; background-color: #111; color: #fff; border-radius: 10px; overflow: hidden; border: 1px solid #333;">
          <div style="background-color: #f5c518; padding: 20px; text-align: center;">
            <h1 style="color: #000; margin: 0; font-size: 24px;">Booking Confirmed!</h1>
          </div>
          <div style="padding: 30px;">
            <h2 style="font-size: 22px; margin-top: 0; color: #f5c518;">${movieTitle}</h2>
            <hr style="border: 1px solid #333; margin: 20px 0;" />
            <table style="width: 100%; color: #ccc; line-height: 1.6;">
              <tr><td style="padding-bottom: 10px;"><strong>Theater:</strong></td><td style="padding-bottom: 10px; text-align: right;">${theater}</td></tr>
              <tr><td style="padding-bottom: 10px;"><strong>Date & Time:</strong></td><td style="padding-bottom: 10px; text-align: right;">${time}</td></tr>
              <tr><td style="padding-bottom: 10px;"><strong>Seats:</strong></td><td style="padding-bottom: 10px; text-align: right; color: #fff; font-weight: bold;">${seats}</td></tr>
              <tr><td style="padding-bottom: 10px;"><strong>Amount Paid:</strong></td><td style="padding-bottom: 10px; text-align: right;">₹${amount}</td></tr>
            </table>
            <hr style="border: 1px solid #333; margin: 20px 0;" />
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #666; font-size: 12px; margin-bottom: 5px;">Order ID: ${orderId}</p>
              <p style="color: #f5c518; font-size: 14px; font-weight: bold;">Please show this email at the entrance.</p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("🟢 RESEND SUCCESS:", data);
    return data;
  } catch (error) {
    console.error("🔴 RESEND ERROR:", error);
    return null;
  }
};