import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = 'onboarding@resend.dev' // Change to bookings@sportiva.lk after domain setup

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    const { type, booking, userEmail, venueOwnerEmail } = await req.json()

    let emailsSent = []

    // ── BOOKING CONFIRMED ──
    if (type === 'booking_confirmed') {
      // Email to USER
      const userHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmed</title>
        </head>
        <body style="margin:0;padding:0;background:#0f172a;font-family:'DM Sans',Arial,sans-serif;">
          <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
            
            <!-- Header -->
            <div style="text-align:center;margin-bottom:32px;">
              <div style="display:inline-block;background:#22c55e;border-radius:12px;padding:8px 16px;margin-bottom:16px;">
                <span style="color:#000;font-size:20px;font-weight:900;letter-spacing:2px;">SPORTIVA.LK</span>
              </div>
            </div>

            <!-- Card -->
            <div style="background:#1e293b;border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,0.05);">
              
              <!-- Green header bar -->
              <div style="background:linear-gradient(135deg,#16a34a,#15803d);padding:28px 32px;text-align:center;">
                <div style="font-size:40px;margin-bottom:8px;">✅</div>
                <h1 style="color:#fff;font-size:24px;font-weight:700;margin:0 0 4px;">Booking Confirmed!</h1>
                <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:0;">Your court is reserved and ready</p>
              </div>

              <!-- Body -->
              <div style="padding:32px;">
                
                <!-- Booking ID -->
                <div style="text-align:center;margin-bottom:24px;">
                  <span style="background:#22c55e20;border:1px solid #22c55e40;color:#4ade80;font-size:13px;font-weight:700;padding:6px 16px;border-radius:100px;letter-spacing:1px;">
                    BOOKING ID: #${booking.booking_id}
                  </span>
                </div>

                <!-- Details -->
                <div style="background:#0f172a;border-radius:14px;padding:20px;margin-bottom:20px;">
                  <table style="width:100%;border-collapse:collapse;">
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                      <td style="padding:10px 0;color:#94a3b8;font-size:13px;">🏟️ Venue</td>
                      <td style="padding:10px 0;color:#fff;font-size:13px;font-weight:600;text-align:right;">${booking.venue_name}</td>
                    </tr>
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                      <td style="padding:10px 0;color:#94a3b8;font-size:13px;">📅 Date</td>
                      <td style="padding:10px 0;color:#fff;font-size:13px;font-weight:600;text-align:right;">${booking.date}</td>
                    </tr>
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                      <td style="padding:10px 0;color:#94a3b8;font-size:13px;">🕐 Time</td>
                      <td style="padding:10px 0;color:#fff;font-size:13px;font-weight:600;text-align:right;">${booking.start_time} – ${booking.end_time}</td>
                    </tr>
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                      <td style="padding:10px 0;color:#94a3b8;font-size:13px;">🏃 Sport</td>
                      <td style="padding:10px 0;color:#fff;font-size:13px;font-weight:600;text-align:right;">${booking.sport}</td>
                    </tr>
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                      <td style="padding:10px 0;color:#94a3b8;font-size:13px;">💳 Paid Now</td>
                      <td style="padding:10px 0;color:#4ade80;font-size:13px;font-weight:700;text-align:right;">Rs 520</td>
                    </tr>
                    <tr>
                      <td style="padding:10px 0;color:#94a3b8;font-size:13px;">💰 Pay at Venue</td>
                      <td style="padding:10px 0;color:#facc15;font-size:13px;font-weight:700;text-align:right;">Rs ${booking.remaining_amount}</td>
                    </tr>
                  </table>
                </div>

                <!-- Info box -->
                <div style="background:#1e3a5f;border:1px solid #3b82f640;border-radius:12px;padding:14px 16px;margin-bottom:20px;">
                  <p style="color:#93c5fd;font-size:12px;margin:0;line-height:1.6;">
                    ℹ️ <strong>Remember:</strong> Please arrive on time and pay the remaining amount at the venue. 
                    You can cancel for free up to 24 hours before your booking.
                  </p>
                </div>

                <!-- CTA Button -->
                <div style="text-align:center;">
                  <a href="https://sportiva-lk.vercel.app/dashboard" 
                    style="display:inline-block;background:#22c55e;color:#000;font-weight:700;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;letter-spacing:0.5px;">
                    View My Bookings →
                  </a>
                </div>
              </div>

              <!-- Footer -->
              <div style="border-top:1px solid rgba(255,255,255,0.05);padding:20px 32px;text-align:center;">
                <p style="color:#475569;font-size:12px;margin:0 0 4px;">Thank you for booking with Sportiva.lk</p>
                <p style="color:#22c55e;font-size:12px;font-weight:600;margin:0;">Book. Play. Repeat. 🏟️</p>
              </div>
            </div>

            <!-- Bottom note -->
            <p style="color:#334155;font-size:11px;text-align:center;margin-top:20px;">
              © ${new Date().getFullYear()} Sportiva.lk — Made with ♥ in Sri Lanka 🇱🇰
            </p>
          </div>
        </body>
        </html>
      `

      // Email to VENUE OWNER / ADMIN
      const adminHtml = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="margin:0;padding:0;background:#0f172a;font-family:Arial,sans-serif;">
          <div style="max-width:560px;margin:0 auto;padding:32px 16px;">

            <div style="text-align:center;margin-bottom:24px;">
              <div style="display:inline-block;background:#22c55e;border-radius:12px;padding:8px 16px;">
                <span style="color:#000;font-size:18px;font-weight:900;letter-spacing:2px;">SPORTIVA.LK</span>
              </div>
            </div>

            <div style="background:#1e293b;border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,0.05);">
              
              <div style="background:linear-gradient(135deg,#1d4ed8,#1e40af);padding:24px 32px;text-align:center;">
                <div style="font-size:36px;margin-bottom:8px;">🎉</div>
                <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 4px;">New Booking Alert!</h1>
                <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:0;">A new booking has been made at your venue</p>
              </div>

              <div style="padding:28px 32px;">
                
                <div style="text-align:center;margin-bottom:20px;">
                  <span style="background:#3b82f620;border:1px solid #3b82f640;color:#93c5fd;font-size:13px;font-weight:700;padding:6px 16px;border-radius:100px;">
                    BOOKING #${booking.booking_id}
                  </span>
                </div>

                <div style="background:#0f172a;border-radius:14px;padding:20px;margin-bottom:16px;">
                  <table style="width:100%;border-collapse:collapse;">
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                      <td style="padding:10px 0;color:#94a3b8;font-size:13px;">👤 Customer</td>
                      <td style="padding:10px 0;color:#fff;font-size:13px;font-weight:600;text-align:right;">${booking.customer_name}</td>
                    </tr>
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                      <td style="padding:10px 0;color:#94a3b8;font-size:13px;">📱 Phone</td>
                      <td style="padding:10px 0;color:#fff;font-size:13px;font-weight:600;text-align:right;">${booking.customer_phone}</td>
                    </tr>
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                      <td style="padding:10px 0;color:#94a3b8;font-size:13px;">🏟️ Venue</td>
                      <td style="padding:10px 0;color:#fff;font-size:13px;font-weight:600;text-align:right;">${booking.venue_name}</td>
                    </tr>
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                      <td style="padding:10px 0;color:#94a3b8;font-size:13px;">📅 Date</td>
                      <td style="padding:10px 0;color:#fff;font-size:13px;font-weight:600;text-align:right;">${booking.date}</td>
                    </tr>
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                      <td style="padding:10px 0;color:#94a3b8;font-size:13px;">🕐 Time</td>
                      <td style="padding:10px 0;color:#fff;font-size:13px;font-weight:600;text-align:right;">${booking.start_time} – ${booking.end_time}</td>
                    </tr>
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                      <td style="padding:10px 0;color:#94a3b8;font-size:13px;">🏃 Sport</td>
                      <td style="padding:10px 0;color:#fff;font-size:13px;font-weight:600;text-align:right;">${booking.sport}</td>
                    </tr>
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                      <td style="padding:10px 0;color:#94a3b8;font-size:13px;">💳 Advance Paid</td>
                      <td style="padding:10px 0;color:#4ade80;font-size:13px;font-weight:700;text-align:right;">Rs 520</td>
                    </tr>
                    <tr>
                      <td style="padding:10px 0;color:#94a3b8;font-size:13px;">💰 Collect at Venue</td>
                      <td style="padding:10px 0;color:#facc15;font-size:13px;font-weight:700;text-align:right;">Rs ${booking.remaining_amount}</td>
                    </tr>
                  </table>
                </div>

                <div style="text-align:center;">
                  <a href="https://sportiva-lk.vercel.app/venue-dashboard"
                    style="display:inline-block;background:#3b82f6;color:#fff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;">
                    View in Dashboard →
                  </a>
                </div>
              </div>

              <div style="border-top:1px solid rgba(255,255,255,0.05);padding:16px 32px;text-align:center;">
                <p style="color:#475569;font-size:12px;margin:0;">Sportiva.lk — Book. Play. Repeat. 🏟️</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `

      // Send to user
      const userRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: 'mohamedshiman772004@gmail.com', // Change to userEmail after testing
          subject: `✅ Booking Confirmed — ${booking.venue_name} | #${booking.booking_id}`,
          html: userHtml,
        }),
      })

      emailsSent.push({ to: 'user', status: userRes.status })

      // Send to venue owner/admin
      if (venueOwnerEmail) {
        const adminRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: venueOwnerEmail,
            subject: `🎉 New Booking — ${booking.customer_name} | ${booking.venue_name} | #${booking.booking_id}`,
            html: adminHtml,
          }),
        })
        emailsSent.push({ to: 'admin', status: adminRes.status })
      }
    }

    // ── BOOKING CANCELLED ──
    if (type === 'booking_cancelled') {
      const cancelHtml = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="margin:0;padding:0;background:#0f172a;font-family:Arial,sans-serif;">
          <div style="max-width:560px;margin:0 auto;padding:32px 16px;">

            <div style="text-align:center;margin-bottom:24px;">
              <div style="display:inline-block;background:#22c55e;border-radius:12px;padding:8px 16px;">
                <span style="color:#000;font-size:18px;font-weight:900;letter-spacing:2px;">SPORTIVA.LK</span>
              </div>
            </div>

            <div style="background:#1e293b;border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,0.05);">
              
              <div style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:24px 32px;text-align:center;">
                <div style="font-size:36px;margin-bottom:8px;">❌</div>
                <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 4px;">Booking Cancelled</h1>
                <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:0;">Your booking has been cancelled</p>
              </div>

              <div style="padding:28px 32px;">

                <div style="text-align:center;margin-bottom:20px;">
                  <span style="background:#ef444420;border:1px solid #ef444440;color:#fca5a5;font-size:13px;font-weight:700;padding:6px 16px;border-radius:100px;">
                    BOOKING #${booking.booking_id}
                  </span>
                </div>

                <div style="background:#0f172a;border-radius:14px;padding:20px;margin-bottom:16px;">
                  <table style="width:100%;border-collapse:collapse;">
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                      <td style="padding:10px 0;color:#94a3b8;font-size:13px;">🏟️ Venue</td>
                      <td style="padding:10px 0;color:#fff;font-size:13px;font-weight:600;text-align:right;">${booking.venue_name}</td>
                    </tr>
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                      <td style="padding:10px 0;color:#94a3b8;font-size:13px;">📅 Date</td>
                      <td style="padding:10px 0;color:#fff;font-size:13px;font-weight:600;text-align:right;">${booking.date}</td>
                    </tr>
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                      <td style="padding:10px 0;color:#94a3b8;font-size:13px;">🕐 Time</td>
                      <td style="padding:10px 0;color:#fff;font-size:13px;font-weight:600;text-align:right;">${booking.start_time} – ${booking.end_time}</td>
                    </tr>
                    <tr>
                      <td style="padding:10px 0;color:#94a3b8;font-size:13px;">💰 Refund</td>
                      <td style="padding:10px 0;color:#4ade80;font-size:13px;font-weight:700;text-align:right;">Rs 520 (3-5 business days)</td>
                    </tr>
                  </table>
                </div>

                <div style="background:#1c1917;border:1px solid #78716c40;border-radius:12px;padding:14px 16px;margin-bottom:20px;">
                  <p style="color:#a8a29e;font-size:12px;margin:0;line-height:1.6;">
                    💳 Your advance payment of <strong style="color:#fff;">Rs 520</strong> will be refunded within <strong style="color:#fff;">3-5 business days</strong> to your original payment method.
                  </p>
                </div>

                <div style="text-align:center;">
                  <a href="https://sportiva-lk.vercel.app/venues"
                    style="display:inline-block;background:#22c55e;color:#000;font-weight:700;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;">
                    Book Another Venue →
                  </a>
                </div>
              </div>

              <div style="border-top:1px solid rgba(255,255,255,0.05);padding:16px 32px;text-align:center;">
                <p style="color:#475569;font-size:12px;margin:0;">Sportive.lk — Book. Play. Repeat. 🏟️</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `

      const cancelRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to:'mohamedshiman772004@gmail.com', // Change to userEmail after testing
          subject: `❌ Booking Cancelled — ${booking.venue_name} | #${booking.booking_id}`,
          html: cancelHtml,
        }),
      })

      emailsSent.push({ to: 'user_cancel', status: cancelRes.status })
    }

    return new Response(
      JSON.stringify({ success: true, emails: emailsSent }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    )
  } catch (err: any) {
  return new Response(
    JSON.stringify({ error: err?.message || 'Unknown error' }),
    {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  )
}
})