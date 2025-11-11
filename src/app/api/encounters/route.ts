import { NextResponse, type NextRequest } from 'next/server';
import adapter from '../../../lib/api/encounters';

// API route for encounters (T010)
export async function GET() {
  try {
    const items = await adapter.list();
    return NextResponse.json(items, { status: 200 });
  } catch (err) {
    console.error('Failed to fetch encounters:', err);
    return NextResponse.json(
      { error: 'Failed to fetch encounters' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const created = await adapter.create(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error('Failed to create encounter:', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
