const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getMonitoring() {
  const res = await fetch(`${API_URL}/monitoring`);
  if (!res.ok) {
    throw new Error('Failed to fetch monitoring data');
  }
  return res.json();
}