import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { pdfBase64, date, taskName } = await request.json();

    const data = await resend.emails.send({
      from: 'RenovaMaster <onboarding@resend.dev>', // Később saját domainre cserélhető
      to: ['projektmenedzser@ceged.hu'], // Ide írd a PM e-mail címét
      subject: `Napi Riport - ${taskName} - ${date}`,
      html: `
        <h1>Napi Helyszíni Jelentés</h1>
        <p>A mai napon a következő feladat elvégzésre került: <strong>${taskName}</strong></p>
        <p>A részletes jelentés és a LiDAR adatok a mellékelt PDF-ben találhatóak.</p>
        <br/>
        <p>Üdvözlettel,<br/>RenovaMaster AI Rendszer</p>
      `,
      attachments: [
        {
          filename: `Riport_${date}.pdf`,
          content: pdfBase64.split(',')[1], // Levágjuk a base64 fejlécet
        },
      ],
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error });
  }
}
