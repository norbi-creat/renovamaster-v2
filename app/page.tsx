const exportPDF = async () => {
  const doc = new jsPDF();
  
  // 1. Fejléc és táblázat
  doc.setFontSize(18);
  doc.text("RenovaMaster AI - Műszaki Dokumentáció", 14, 20);
  doc.setFontSize(10);
  doc.text(`Kelt: ${new Date().toLocaleDateString('hu-HU')}`, 14, 28);

  const tableData = materials.map(m => [
    m.material_name,
    `${m.planned_quantity} ${m.unit}`,
    m.is_verified ? "IGAZOLVA" : "VÁRAKOZIK"
  ]);

  (doc as any).autoTable({
    head: [['Anyag', 'Mennyiség', 'Állapot']],
    body: tableData,
    startY: 35,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235] } // Szép kék fejléc a PDF-ben
  });

  let currentY = (doc as any).lastAutoTable.finalY + 15;

  // 2. Képek beillesztése a biztonsági korlátok megkerülésével
  for (const item of materials) {
    if (item.is_verified && item.photo_url) {
      try {
        // Közvetlen blob letöltés, ez nem ütközik CORS hibába
        const { data, error } = await supabase.storage
          .from('material-photos')
          .download(item.photo_url);

        if (error || !data) continue;

        // Kép átalakítása olyan formátumra, amit a PDF befogad
        const blobUrl = URL.createObjectURL(data);
        const img = new Image();
        img.src = blobUrl;

        await new Promise((resolve) => {
          img.onload = resolve;
        });

        if (currentY > 230) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFontSize(12);
        doc.text(`Csatolt fotó: ${item.material_name}`, 14, currentY);
        
        // A képet beillesztjük a PDF-be
        doc.addImage(img, 'JPEG', 14, currentY + 5, 100, 75);
        currentY += 90;
        
        URL.revokeObjectURL(blobUrl); // Memória felszabadítása

      } catch (e) {
        console.error("Kép hiba a PDF-ben:", e);
      }
    }
  }

  doc.save(`RenovaMaster_Jelentes.pdf`);
};
