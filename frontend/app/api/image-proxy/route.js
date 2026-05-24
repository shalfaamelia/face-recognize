export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const faceLabel = searchParams.get('face_label');
    const filename = searchParams.get('filename');

    if (!faceLabel || !filename) {
      return new Response(
        JSON.stringify({ message: 'face_label dan filename wajib diisi' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const backendUrl = process.env.BACKEND_API_URL;

    if (!backendUrl) {
      return new Response(
        JSON.stringify({ message: 'BACKEND_API_URL belum diatur di .env.local' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const imageUrl = `${backendUrl}/uploads/${encodeURIComponent(faceLabel)}/${encodeURIComponent(filename)}`;

    const response = await fetch(imageUrl, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          message: 'Gagal mengambil gambar dari backend',
          status: response.status,
          imageUrl,
        }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const imageBuffer = await response.arrayBuffer();

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: 'Terjadi error pada image proxy',
        error: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}