const API_URL = 'http://localhost:5000';

export async function getMonitoring() {
  const res = await fetch(`${API_URL}/monitoring`);
  if (!res.ok) {
    throw new Error('Failed to fetch monitoring data');
  }
  return res.json();
}