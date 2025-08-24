'use client';

import { useRouter } from 'next/navigation';
import { CharacterCreationForm } from '@/components/forms/character';

export default function NewCharacterPage() {
  const router = useRouter();

  const handleComplete = (character: { id: string }) => {
    router.push(('/characters/' + character.id) as any);
  };

  const handleCancel = () => {
    router.push('/characters');
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Character</h1>
        <p className="text-muted-foreground mt-2">
          Create your D&D character with our step-by-step form.
        </p>
      </div>
      
      <CharacterCreationForm 
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </div>
  );
}