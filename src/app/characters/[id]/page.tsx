'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Badge,
  Separator,
  Alert,
  AlertDescription
} from '@/components/ui';
import { ArrowLeft, Edit, Trash2, Heart, Shield, Zap } from 'lucide-react';

interface Character {
  _id: string;
  userId: string;
  name: string;
  race: string;
  subrace?: string;
  background: string;
  alignment: string;
  experiencePoints: number;
  classes: Array<{
    className: string;
    level: number;
    subclass?: string;
    hitDiceSize: number;
    hitDiceUsed: number;
  }>;
  totalLevel: number;
  abilities: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  abilityModifiers?: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  proficiencyBonus?: number;
  skillProficiencies?: string[];
  savingThrowProficiencies?: string[];
  hitPoints?: {
    maximum: number;
    current: number;
    temporary: number;
  };
  armorClass?: number;
  speed?: number;
  initiative?: number;
  passivePerception?: number;
  spellcasting?: {
    ability: string;
    spellAttackBonus: number;
    spellSaveDC: number;
    spellSlots: {
      [key: string]: { total: number; used: number };
    };
    spellsKnown?: string[];
    spellsPrepared?: string[];
  };
  equipment?: Array<{
    name: string;
    quantity: number;
    category: string;
  }>;
  features?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface CharacterDetailPageProps {
  params: { id: string };
}

function formatModifier(modifier: number): string {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

function formatExperiencePoints(xp: number): string {
  return xp.toLocaleString();
}

function isValidObjectId(id: string): boolean {
  // Basic MongoDB ObjectId validation
  return /^[0-9a-fA-F]{24}$/.test(id);
}

export default function CharacterDetailPage({ params }: CharacterDetailPageProps) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const router = useRouter();
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCharacter = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/characters/${params.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Character not found');
          return;
        }
        throw new Error('Failed to fetch character');
      }

      const characterData = await response.json();
      setCharacter(characterData);
    } catch (err) {
      setError('Failed to load character');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!isSignedIn) {
      return;
    }

    if (!isValidObjectId(params.id)) {
      setError('Invalid character ID');
      setLoading(false);
      return;
    }

    fetchCharacter();
  }, [isLoaded, isSignedIn, params.id, fetchCharacter]);

  const handleDelete = async () => {
    if (!character || !confirm(`Are you sure you want to delete ${character.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/characters/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete character');
      }

      router.push('/characters');
    } catch (err) {
      alert('Failed to delete character. Please try again.');
    }
  };

  if (!isLoaded) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!isSignedIn) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-lg mb-4">Please sign in to view character details</p>
          <Link href="/sign-in">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading character details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Alert className="mb-6">
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <div className="flex gap-2">
              {error === 'Failed to load character' && (
                <Button variant="outline" size="sm" onClick={fetchCharacter}>
                  Retry
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => router.push('/characters')}>
                Back to Characters
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!character) {
    return null;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/characters')}
            aria-label="Back to character list"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">{character.name}</h1>
        </div>
        
        <div className="flex gap-2">
          <Link href={`/characters/${character._id}/edit`}>
            <Button 
              variant="outline" 
              size="sm"
              aria-label={`Edit ${character.name}`}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Character
            </Button>
          </Link>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDelete}
            aria-label={`Delete ${character.name}`}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Character
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="font-semibold text-sm text-muted-foreground">Race</p>
                  <p>{character.subrace ? `${character.subrace}` : character.race}</p>
                </div>
                <div>
                  <p className="font-semibold text-sm text-muted-foreground">Background</p>
                  <p>{character.background}</p>
                </div>
                <div>
                  <p className="font-semibold text-sm text-muted-foreground">Alignment</p>
                  <p>{character.alignment}</p>
                </div>
                <div>
                  <p className="font-semibold text-sm text-muted-foreground">Experience Points</p>
                  <p>{formatExperiencePoints(character.experiencePoints)}</p>
                </div>
                <div>
                  <p className="font-semibold text-sm text-muted-foreground">Total Level</p>
                  <p>Total Level: {character.totalLevel}</p>
                </div>
              </div>

              <Separator />

              {/* Classes */}
              <div>
                <h3 className="font-semibold mb-2">Classes</h3>
                <div className="flex flex-wrap gap-2">
                  {character.classes.map((cls, index) => (
                    <Badge key={index} variant="secondary">
                      {cls.className} Level {cls.level}
                      {cls.subclass && ` (${cls.subclass})`}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Combat Stats */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Combat Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {character.hitPoints && (
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="font-semibold text-sm text-muted-foreground">Hit Points</p>
                    <p className="text-lg">{character.hitPoints.current} / {character.hitPoints.maximum}</p>
                  </div>
                </div>
              )}
              
              {character.armorClass && (
                <div>
                  <p className="font-semibold text-sm text-muted-foreground">Armor Class</p>
                  <p className="text-lg">{character.armorClass}</p>
                </div>
              )}
              
              {character.speed && (
                <div>
                  <p className="font-semibold text-sm text-muted-foreground">Speed</p>
                  <p>{character.speed} ft</p>
                </div>
              )}
              
              {character.initiative !== undefined && (
                <div>
                  <p className="font-semibold text-sm text-muted-foreground">Initiative</p>
                  <p>{formatModifier(character.initiative)}</p>
                </div>
              )}
              
              {character.proficiencyBonus && (
                <div>
                  <p className="font-semibold text-sm text-muted-foreground">Proficiency Bonus</p>
                  <p>{character.proficiencyBonus}</p>
                </div>
              )}
              
              {character.passivePerception && (
                <div>
                  <p className="font-semibold text-sm text-muted-foreground">Passive Perception</p>
                  <p>{character.passivePerception}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ability Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Ability Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(character.abilities).map(([ability, score]) => (
              <div key={ability} className="text-center p-4 border rounded-lg">
                <p className="font-semibold text-sm text-muted-foreground capitalize mb-1">
                  {ability}
                </p>
                <p className="text-2xl font-bold">{score}</p>
                {character.abilityModifiers && (
                  <p className="text-sm text-muted-foreground">
                    {formatModifier(character.abilityModifiers[ability as keyof typeof character.abilityModifiers])}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Proficiencies */}
      {(character.skillProficiencies?.length || character.savingThrowProficiencies?.length) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {character.skillProficiencies && character.skillProficiencies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skill Proficiencies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {character.skillProficiencies.map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {character.savingThrowProficiencies && character.savingThrowProficiencies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Saving Throw Proficiencies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {character.savingThrowProficiencies.map((save) => (
                    <Badge key={save} variant="outline">
                      {save}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Spellcasting */}
      {character.spellcasting && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Spellcasting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="font-semibold text-sm text-muted-foreground">Spellcasting Ability</p>
                <p>{character.spellcasting.ability}</p>
              </div>
              <div>
                <p className="font-semibold text-sm text-muted-foreground">Spell Attack Bonus</p>
                <p>{formatModifier(character.spellcasting.spellAttackBonus)}</p>
              </div>
              <div>
                <p className="font-semibold text-sm text-muted-foreground">Spell Save DC</p>
                <p>{character.spellcasting.spellSaveDC}</p>
              </div>
            </div>

            {/* Spell Slots */}
            {Object.keys(character.spellcasting.spellSlots).length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Spell Slots</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
                  {Object.entries(character.spellcasting.spellSlots).map(([level, slots]) => (
                    <div key={level} className="text-center p-2 border rounded">
                      <p className="font-semibold text-sm">Level {level}</p>
                      <p className="text-lg">{slots.used} / {slots.total}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Known Spells */}
            {character.spellcasting.spellsKnown && character.spellcasting.spellsKnown.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Spells Known</h4>
                <div className="flex flex-wrap gap-2">
                  {character.spellcasting.spellsKnown.map((spell) => (
                    <Badge key={spell} variant="outline">
                      {spell}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Equipment and Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Equipment */}
        {character.equipment && character.equipment.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Equipment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {character.equipment.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-1">
                    <span>{item.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.quantity > 1 ? `${item.name} (${item.quantity})` : item.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        {character.features && character.features.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Features & Traits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {character.features.map((feature, index) => (
                  <div key={index} className="py-1">
                    {feature}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Notes */}
      {character.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{character.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}