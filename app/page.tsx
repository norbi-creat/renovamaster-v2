const exportPDF = async () => {
  const doc = new jsPDF();
  
  // 1. Fejléc és táblázat generálása
  doc.setFontSize(18);
  doc.text("RenovaMaster AI - Muszaki Dokumentacio", 14, 20);
  doc.setFontSize(10);
  doc.text(`Kelt: ${new Date().toLocaleDateString('hu-HU')}`, 14, 28);

  const tableData = materials.map(m => [
    m.material_name,
    `${m.planned_quantity} ${m.unit}`,
    m.is_verified ? "IGAZOLVA" : "VARAKOZIK"
  ]);

  (doc as any).autoTable({
    head: [['Anyag', 'Mennyiseg', 'Allapot']],
    body: tableData,
    startY: 35,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235] } 
  });

  let currentY = (doc as any).lastAutoTable.finalY + 15;

  // 2. Képek letöltése és beágyazása
  for (const item of materials) {
    if (item.is_verified && item.photo_url) {
      try {
        // Közvetlen letöltés a Supabase tárolóból
        const { data, error } = await supabase.storage
          .from('material-photos')
          .download(item.photo_url);

        if (error || !data) continue;

        // Átalakítás Base64 formátumra, amit a PDF befogad
        const reader = new FileReader();
        const base64data = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(data);
        });

        if (currentY > 230) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFontSize(12);
        doc.text(`Csatolt foto: ${item.material_name}`, 14, currentY);
        
        // Kép hozzáadása (100mm széles, az arányokat tartva)
        doc.addImage(base64data as string, 'JPEG', 14, currentY + 5, 100, 75);
        currentY += 90;

      } catch (e) {
        console.error("Hiba a PDF képnél:", e);
      }
    }
  }

  doc.save(`RenovaMaster_Jelentes.pdf`);
};
