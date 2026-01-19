import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { pdfBase64, date, taskName } = await request.json();

    const data = await resend.emails.send({
      from: 'RenovaMaster <onboarding@resend.dev>',
      to: ['miski.norbert@gmail.com'], // Ide írd a PM címét!
      subject: `Napi Riport - ${taskName} - ${date}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h1 style="color: #2563eb;">RenovaMaster AI - Helyszíni Jelentés</h1>
          <p>Munkavégzés dátuma: <strong>${date}</strong></p>
          <p>Elvégzett feladat: <strong>${taskName}</strong></p>
          <hr style="border: 1px solid #e2e8f0; margin: 20px 0;"/>
          <p style="font-size: 12px; color: #64748b;">Ez egy automatikusan generált PDF jelentés a helyszíni operációról.</p>
        </div>
      `,
      attachments: [
        {
          filename: `Riport_${date}.pdf`,
          content: pdfBase64.split(',')[1],
        },
      ],
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Email küldési hiba:", error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
