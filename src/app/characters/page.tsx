import Link from 'next/link';
import { Button } from '@/components/ui';
import CharacterList from '@/components/characters/character-list';

export const dynamic = 'force-dynamic';

export default function CharactersPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Characters</h1>
        <Link href="/characters/new">
          <Button>Create New Character</Button>
        </Link>
      </div>
      
      <CharacterList />
    </div>
  );
}