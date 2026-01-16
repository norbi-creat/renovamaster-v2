// Keresd meg a kódban a "CheckCircle2" részt, és cseréld le erre a blokkra:

{item.is_verified ? (
  <div className="flex flex-col items-center gap-3 w-full">
    <div className="w-full bg-green-50 text-green-600 py-3 rounded-2xl border border-green-100 flex items-center justify-center gap-2 font-black">
      <CheckCircle2 size={24} /> IGAZOLVA
    </div>
    {item.photo_url && (
      <img 
        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/material-photos/${item.photo_url}`}
        alt="Igazoló fotó"
        className="w-full h-48 object-cover rounded-2xl shadow-md border-2 border-white"
      />
    )}
  </div>
) : (
  // Itt marad a régi Camera gombod...
)}
