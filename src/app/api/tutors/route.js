import { searchPublicTutors } from '../../../lib/tutors';

export async function GET(request) {
  try {
    const params = new URL(request.url).searchParams;
    const page = Number(params.get('page') || 1);
    const pageSize = Number(params.get('pageSize') || 12);
    const minPrice = params.has('minPrice') ? Number(params.get('minPrice')) : undefined;
    const maxPrice = params.has('maxPrice') ? Number(params.get('maxPrice')) : undefined;
    if (!Number.isInteger(page) || page < 1 || page > 100000 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 50) {
      return Response.json({ error: 'page must be positive and pageSize must be between 1 and 50.' }, { status: 400 });
    }
    if ([minPrice, maxPrice].some((price) => price !== undefined && (!Number.isInteger(price) || price < 0 || price > 1000000))) {
      return Response.json({ error: 'Price filters must be between 0 and 1000000 ETB.' }, { status: 400 });
    }
    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      return Response.json({ error: 'minPrice cannot exceed maxPrice.' }, { status: 400 });
    }
    const filters = {};
    for (const key of ['search', 'subject', 'language', 'mode']) {
      const value = params.get(key)?.trim();
      if (value) {
        if (value.length > 120) return Response.json({ error: `${key} must be at most 120 characters.` }, { status: 400 });
        filters[key] = value;
      }
    }
    return Response.json(await searchPublicTutors({ page, pageSize, minPrice, maxPrice, ...filters }));
  } catch (error) {
    console.error('Failed to load tutors:', error);
    return Response.json({ error: 'Unable to load tutors.' }, { status: 500 });
  }
}
