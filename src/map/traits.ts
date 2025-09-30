import { parseNumber } from '../parse';
import { trait, makeUseTrait } from '../traits/live';

export const GeographicTrait = trait({
  long: parseNumber,
  lat: parseNumber,
  zoom: parseNumber,
}, {
  zoom: 1,
});

export const useGeographicTrait = makeUseTrait(GeographicTrait);
