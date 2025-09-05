import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, Heart, Zap } from 'lucide-react';
import { IEnhancedCharacter } from '@/models/EnhancedCharacter';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface CharacterCardProps {
  character: IEnhancedCharacter;
  onClick?: () => void;
  className?: string;
}

export function CharacterCard({ character, onClick, className }: CharacterCardProps) {
  const hpPercentage = character.hitPoints.maximum > 0
    ? (character.hitPoints.current / character.hitPoints.maximum) * 100
    : 0;
  
  const getHPStatus = (percentage: number) => {
    if (percentage === 0) return 'hp-unconscious';
    if (percentage <= 25) return 'hp-critical';
    if (percentage <= 50) return 'hp-wounded';
    if (percentage <= 75) return 'hp-healthy';
    return 'hp-full';
  };

  const getCharacterTypeClass = (type: string) => {
    switch (type) {
      case 'pc': return 'character-pc';
      case 'npc': return 'character-npc';
      default: return 'character-monster';
    }
  };

  const totalLevel = character.classes.reduce((sum, cls) => sum + cls.level, 0);

  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-fantasy text-lg">{character.name}</CardTitle>
          <Badge className={getCharacterTypeClass(character.type)}>
            {character.type.toUpperCase()}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-body">
            Level {totalLevel} {character.race}
          </span>
          {character.customRace && (
            <span className="text-xs">({character.customRace})</span>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Character Classes */}
        <div className="flex flex-wrap gap-1">
          {character.classes.map((cls, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {cls.class} {cls.level}
              {cls.subclass && <span className="ml-1 opacity-75">({cls.subclass})</span>}
            </Badge>
          ))}
        </div>

        {/* HP Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>HP</span>
            </div>
            <span className="font-mono">
              {character.hitPoints.current}/{character.hitPoints.maximum}
              {character.hitPoints.temporary > 0 && (
                <span className="text-blue-500"> (+{character.hitPoints.temporary})</span>
              )}
            </span>
          </div>
          <div className="relative">
            <Progress 
              value={hpPercentage} 
              className={cn('h-2', getHPStatus(hpPercentage))}
            />
            {character.hitPoints.temporary > 0 && (
              <div 
                className="absolute top-0 left-0 h-2 bg-blue-400 rounded-full opacity-60"
                style={{
                  width: `${character.hitPoints.maximum > 0 ? Math.min(100, (character.hitPoints.temporary / character.hitPoints.maximum) * 100) : 0}%`
                }}
              />
            )}
          </div>
        </div>

        {/* Combat Stats */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>AC {character.armorClass}</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>Init +{character.getInitiativeModifier?.() || 0}</span>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            {!character.isAlive?.() && (
              <Badge variant="destructive" className="text-xs">Unconscious</Badge>
            )}
            {character.isPublic && (
              <Badge variant="outline" className="text-xs">Public</Badge>
            )}
            {character.partyId && (
              <Badge variant="secondary" className="text-xs">In Party</Badge>
            )}
          </div>
          
          {character.imageUrl && (
            <Image 
              src={character.imageUrl} 
              alt={character.name}
              width={32}
              height={32}
              className="rounded-full object-cover border-2 border-primary"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}