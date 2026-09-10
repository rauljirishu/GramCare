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
  const lat = request.nextUrl.searchParams.get('lat');
  const lon = request.nextUrl.searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (isNaN(latitude) || isNaN(longitude)) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return NextResponse.json({ error: 'Coordinates out of range' }, { status: 400 });
  }

  try {
    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('lat', String(latitude));
    url.searchParams.set('lon', String(longitude));
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('accept-language', 'en');

    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': process.env.GEOCODING_USER_AGENT || 'GramCare/1.0 (healthcare-app)',
        Accept: 'application/json',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Reverse geocoding service unavailable. Please enter address manually.' },
        { status: 502 }
      );
    }

    const data = await res.json();
    const parsed = parseNominatimAddress(data.address || {});

    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(
      { error: 'Reverse geocoding service unavailable. Please enter address manually.' },
      { status: 502 }
    );
  }
}
