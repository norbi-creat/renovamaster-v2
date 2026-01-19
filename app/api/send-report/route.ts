export const runtime = 'edge';

import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { pdfBase64, date, taskName } = await request.json();

    const data = await resend.emails.send({
      from: 'RenovaMaster <onboarding@resend.dev>',
      to: ['miski.norbert@gmail.com'], 
      subject: `Napi Riport - ${taskName} - ${date}`,
      html: `<h1>Napi Riport</h1><p>Feladat: ${taskName}</p><p>Dátum: ${date}</p>`,
      attachments: [
        {
          filename: `Riport_${date}.pdf`,
          content: pdfBase64.split(',')[1],
        },
      ],
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
