// Shared image analysis helper for Phase 2 & 3.
// Tries multiple payload key formats to accommodate backend variations.

export async function analyzeImage(base64OrDataUrl) {
  const isDataUrl = base64OrDataUrl.startsWith('data:');
  const pureBase64 = isDataUrl ? base64OrDataUrl.split(',')[1] : base64OrDataUrl;
  const endpoint = 'https://us-central1-api-skinstric-ai.cloudfunctions.net/skinstricPhaseTwo';
  const attempts = [
    { body: { image: pureBase64 }, desc: 'lowercase image' },
    { body: { Image: pureBase64 }, desc: 'uppercase Image' },
    { body: { Image: isDataUrl ? base64OrDataUrl : `data:image/jpeg;base64,${pureBase64}` }, desc: 'full data URL' },
  ];

  let lastError;
  for (const attempt of attempts) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attempt.body)
      });
      if (!res.ok) {
        lastError = new Error(`${attempt.desc} failed: ${res.status}`);
        continue;
      }
      const json = await res.json();
      return normalizeDemographics(json);
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError || new Error('Image analysis failed');
}

export function normalizeDemographics(result) {
  const data = result.data || result; // backend may wrap data
  if (!data) throw new Error('No data field in response');
  const { race, age, gender } = data;
  return {
    race: race || {},
    age: age || {},
    gender: gender || {},
    _raw: result
  };
}

export function sortCategory(catObj) {
  if (!catObj) return [];
  return Object.entries(catObj)
    .sort((a,b) => b[1]-a[1])
    .map(([label, value]) => ({ label, value, percent: (value*100).toFixed(2) }));
}
