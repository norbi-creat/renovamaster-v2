import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Kényszerítjük, hogy szerver oldali kód maradjon
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const body = await request.json();
    const { pdfBase64, date, taskName } = body;

    const { data, error } = await resend.emails.send({
      from: 'RenovaMaster <onboarding@resend.dev>',
      to: ['miski.norbert@gmail.com'], // Saját email címed
      subject: `Napi Riport - ${taskName} - ${date}`,
      html: `<strong>Riport elkészült: ${taskName}</strong>`,
      attachments: [
        {
          filename: `Riport_${date}.pdf`,
          content: pdfBase64.split(',')[1],
        },
      ],
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
