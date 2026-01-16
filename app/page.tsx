const exportPDF = async () => {
  const doc = new jsPDF();
  
  // 1. Alapadatok kiírása
  doc.setFontSize(18);
  doc.text("RenovaMaster AI - Műszaki Jelentés", 14, 20);
  doc.setFontSize(10);
  doc.text(`Készült: ${new Date().toLocaleDateString('hu-HU')}`, 14, 28);

  const tableData = materials.map(m => [
    m.material_name,
    `${m.planned_quantity} ${m.unit}`,
    m.is_verified ? "IGAZOLVA" : "VÁRAKOZIK"
  ]);

  (doc as any).autoTable({
    head: [['Anyag megnevezése', 'Mennyiség', 'Állapot']],
    body: tableData,
    startY: 40,
    theme: 'grid'
  });

  let currentY = (doc as any).lastAutoTable.finalY + 20;

  // 2. Képek letöltése speciális módon
  for (const item of materials) {
    if (item.is_verified && item.photo_url) {
      try {
        // Közvetlenül a Supabase-től kérjük le a fájl tartalmát (blob-ként)
        const { data, error } = await supabase.storage
          .from('material-photos')
          .download(item.photo_url);

        if (error) throw error;

        // Átalakítás Base64 formátumra, amit a PDF szeret
        const buffer = await data.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        const dataUrl = `data:image/jpeg;base64,${base64}`;

        if (currentY > 230) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFontSize(12);
        doc.text(`Tétel: ${item.material_name}`, 14, currentY);
        doc.addImage(dataUrl, 'JPEG', 14, currentY + 5, 100, 75);
        currentY += 90;

      } catch (e) {
        console.error("Hiba a PDF képnél:", e);
      }
    }
  }

  doc.save(`RenovaMaster-Dokumentacio.pdf`);
};
