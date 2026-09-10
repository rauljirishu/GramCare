import { NextRequest, NextResponse } from 'next/server';

interface NominatimAddress {
  village?: string;
  town?: string;
  city?: string;
  hamlet?: string;
  suburb?: string;
  county?: string;
  state_district?: string;
  state?: string;
  postcode?: string;
  road?: string;
  house_number?: string;
  neighbourhood?: string;
}

function parseNominatimAddress(addr: NominatimAddress) {
  const village =
    addr.village || addr.hamlet || addr.town || addr.city || addr.suburb || addr.neighbourhood || '';
  const taluka = addr.county || addr.state_district || '';
  const district = addr.state_district || addr.county || '';
  const state = addr.state || '';
  const pincode = addr.postcode || '';
  const addressParts = [addr.house_number, addr.road, village].filter(Boolean);
  const address = addressParts.join(', ');

  return { address, village, taluka, district, state, pincode };
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ error: 'Search query must be at least 2 characters' }, { status: 400 });
  }

  try {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', q);
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('countrycodes', 'in');
    url.searchParams.set('limit', '8');
    url.searchParams.set('accept-language', 'en');

    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': process.env.GEOCODING_USER_AGENT || 'GramCare/1.0 (healthcare-app)',
        Accept: 'application/json',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Location search unavailable.' }, { status: 502 });
    }

    const data = await res.json();

    const results = (data as Array<{ display_name: string; lat: string; lon: string; address?: NominatimAddress }>).map(
      (item) => ({
        displayName: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        address: parseNominatimAddress(item.address || {}),
      })
    );

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: 'Location search unavailable.' }, { status: 502 });
  }
}
