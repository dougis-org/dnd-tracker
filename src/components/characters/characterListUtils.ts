import type { Character } from '../../../types/character';

export function filterCharacters(
  characters: Character[],
  query: string,
  classFilter: string
): Character[] {
  const q = query.trim().toLowerCase();

  return characters.filter((c: Character) => {
    if (classFilter && c.className !== classFilter) return false;
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.className.toLowerCase().includes(q) ||
      c.race.toLowerCase().includes(q)
    );
  });
}

export function getUniqueClasses(characters: Character[]): string[] {
  return [...new Set(characters.map((c: Character) => c.className))];
}
