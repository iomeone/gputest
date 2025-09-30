import { parseNumber } from '@use-gpu/parse';
import { trait, makeUseTrait } from '@use-gpu/traits/live';

export const GeographicTrait = trait({
  long: parseNumber,
  lat: parseNumber,
  zoom: parseNumber,
}, {
  zoom: 1,
});

export const useGeographicTrait = makeUseTrait(GeographicTrait);
