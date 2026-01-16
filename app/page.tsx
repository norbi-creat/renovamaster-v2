const exportPDF = async () => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text("RenovaMaster AI - Muszaki Jelentes", 14, 20);
  doc.setFontSize(10);
  doc.text(`Keszult: ${new Date().toLocaleDateString('hu-HU')}`, 14, 28);

  const tableData = materials.map(m => [
    m.material_name,
    `${m.planned_quantity} ${m.unit}`,
    m.is_verified ? "IGAZOLVA" : "VARAKOZIK"
  ]);

  (doc as any).autoTable({
    head: [['Anyag megnevezese', 'Mennyiseg', 'Allapot']],
    body: tableData,
    startY: 40,
    theme: 'striped'
  });

  let currentY = (doc as any).lastAutoTable.finalY + 20;
  
  for (const item of materials) {
    if (item.is_verified && item.photo_url) {
      try {
        // EZ A TRÜKK: Egy külső proxy-n keresztül kérjük a képet, ami megoldja a CORS-t
        const rawUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/material-photos/${item.photo_url}`;
        const proxiedUrl = `https://images.weserv.nl/?url=${encodeURIComponent(rawUrl)}&output=jpg&q=80`;
        
        const base64Img = await getBase64ImageFromURL(proxiedUrl);
        
        if (currentY > 240) {
          doc.addPage();
          currentY = 20;
        }

        doc.text(`Tetel: ${item.material_name}`, 14, currentY);
        doc.addImage(base64Img, 'JPEG', 14, currentY + 5, 80, 60);
        currentY += 75;
      } catch (e) {
        console.error("Kep hiba:", e);
      }
    }
  }

  doc.save("Jelentes.pdf");
};
