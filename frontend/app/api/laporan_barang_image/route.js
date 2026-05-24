export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return Response.json(
      { message: 'filename wajib diisi' },
      { status: 400 }
    );
  }

  const backendApiUrl = process.env.BACKEND_API_URL;

  if (!backendApiUrl) {
    return Response.json(
      {
        message: 'BACKEND_API_URL belum terbaca di Next.js',
        hint: 'Cek file .env di folder frontend, lalu restart npm run dev',
      },
      { status: 500 }
    );
  }

  const cleanBackendApiUrl = backendApiUrl.replace(/\/$/, '');
  const cleanFilename = String(filename).split(/[\\/]/).pop();

  const imageUrls = [
    `${cleanBackendApiUrl}/uploads/laporan_barang/${encodeURIComponent(cleanFilename)}`,
    `${cleanBackendApiUrl}/laporan-barang/uploads/${encodeURIComponent(cleanFilename)}`,
  ];

  const errors = [];

  for (const imageUrl of imageUrls) {
    console.log('COBA AMBIL FOTO:', imageUrl);

    try {
      const res = await fetch(imageUrl, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'image/*,*/*',
        },
        cache: 'no-store',
      });

      const contentType = res.headers.get('content-type') || '';
      console.log('STATUS:', res.status);
      console.log('CONTENT TYPE:', contentType);

      if (res.ok) {
        const buffer = await res.arrayBuffer();

        return new Response(buffer, {
          status: 200,
          headers: {
            'Content-Type': contentType || 'image/jpeg',
            'Cache-Control': 'no-store',
          },
        });
      }

      const text = await res.text();

      errors.push({
        imageUrl,
        status: res.status,
        contentType,
        detail: text.slice(0, 500),
      });
    } catch (err) {
      errors.push({
        imageUrl,
        error: err.message,
      });
    }
  }

  return Response.json(
    {
      message: 'Gagal mengambil foto dari backend',
      filename: cleanFilename,
      backendApiUrl,
      tried: errors,
    },
    { status: 404 }
  );
}