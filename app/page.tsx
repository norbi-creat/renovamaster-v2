// Ezt a segédfunkciót add a Dashboard komponensen BELÜLRE, az exportPDF elé:
const getBase64ImageFromURL = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/jpeg");
      resolve(dataURL);
    };
    img.onerror = (error) => reject(error);
    img.src = url;
  });
};

// Majd cseréld le az exportPDF funkciót erre:
const exportPDF = async () => {
  const doc = new jsPDF();
  
  // Fejléc
  doc.setFontSize(18);
  doc.text("RenovaMaster AI - Műszaki Jelentés", 14, 20);
  doc.setFontSize(10);
  doc.text(`Készült: ${new Date().toLocaleDateString('hu-HU')}`, 14, 28);
  doc.text("Helyszín: Veszprém - Projekt #H511436", 14, 33);

  // Táblázat adatok
  const tableData = materials.map(m => [
    m.material_name,
    `${m.planned_quantity} ${m.unit}`,
    m.is_verified ? "IGAZOLVA" : "VÁRAKOZIK"
  ]);

  (doc as any).autoTable({
    head: [['Anyag megnevezése', 'Mennyiség', 'Állapot']],
    body: tableData,
    startY: 40,
    theme: 'striped'
  });

  // FOTÓK HOZZÁADÁSA A TÁBLÁZAT ALÁ
  let currentY = (doc as any).lastAutoTable.finalY + 20;
  
  doc.setFontSize(14);
  doc.text("Csatolt bizonyító fotók:", 14, currentY);
  currentY += 10;

  for (const item of materials) {
    if (item.is_verified && item.photo_url) {
      try {
        const imgUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/material-photos/${item.photo_url}`;
        const base64Img = await getBase64ImageFromURL(imgUrl);
        
        // Ha túllépnénk az oldalt, új oldalt nyitunk
        if (currentY > 240) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFontSize(10);
        doc.text(`Tétel: ${item.material_name}`, 14, currentY);
        doc.addImage(base64Img, 'JPEG', 14, currentY + 5, 80, 60); // 80x60mm-es kép
        currentY += 75; // Távolság a következő képig
      } catch (e) {
        console.error("Kép betöltési hiba:", e);
      }
    }
  }

  doc.save(`Jelentes-${new Date().getTime()}.pdf`);
};
