import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dice6, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DiceResult {
  dice: number[];
  modifier: number;
  total: number;
  diceType: number;
  diceCount: number;
}

interface DiceRollerProps {
  className?: string;
  onRoll?: (result: DiceResult) => void;
}

const DICE_TYPES = [4, 6, 8, 10, 12, 20, 100];

export function DiceRoller({ className, onRoll }: DiceRollerProps) {
  const [diceType, setDiceType] = useState(20);
  const [diceCount, setDiceCount] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [result, setResult] = useState<DiceResult | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const rollDice = () => {
    setIsRolling(true);
    
    // Animate the rolling
    setTimeout(() => {
      const dice = Array.from({ length: diceCount }, () => 
        Math.floor(Math.random() * diceType) + 1
      );
      
      const total = dice.reduce((sum, roll) => sum + roll, 0) + modifier;
      
      const rollResult: DiceResult = {
        dice,
        modifier,
        total,
        diceType,
        diceCount
      };
      
      setResult(rollResult);
      setIsRolling(false);
      onRoll?.(rollResult);
    }, 600);
  };

  const formatDiceNotation = () => {
    let notation = `${diceCount}d${diceType}`;
    if (modifier > 0) notation += `+${modifier}`;
    else if (modifier < 0) notation += modifier;
    return notation;
  };

  return (
    <Card className={cn('w-full max-w-md', className)}>
      <CardHeader>
        <CardTitle className="font-fantasy text-center">Dice Roller</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dice Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Dice Type</label>
          <div className="flex flex-wrap gap-2">
            {DICE_TYPES.map(type => (
              <Button
                key={type}
                variant={diceType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setDiceType(type)}
                className="text-xs"
              >
                d{type}
              </Button>
            ))}
          </div>
        </div>

        {/* Dice Count */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Number of Dice</label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDiceCount(Math.max(1, diceCount - 1))}
              disabled={diceCount <= 1}
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="font-mono text-lg w-8 text-center">{diceCount}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDiceCount(Math.min(10, diceCount + 1))}
              disabled={diceCount >= 10}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Modifier */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Modifier</label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModifier(modifier - 1)}
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="font-mono text-lg w-12 text-center">
              {modifier >= 0 ? `+${modifier}` : modifier}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModifier(modifier + 1)}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Roll Button */}
        <div className="text-center space-y-2">
          <div className="text-lg font-mono font-bold">
            {formatDiceNotation()}
          </div>
          <Button
            onClick={rollDice}
            disabled={isRolling}
            className={cn(
              'w-full',
              isRolling && 'dice-roll'
            )}
          >
            <Dice6 className="w-4 h-4 mr-2" />
            {isRolling ? 'Rolling...' : 'Roll Dice'}
          </Button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-3 p-3 bg-muted rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold font-mono">
                {result.total}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDiceNotation()}
              </div>
            </div>
            
            {/* Individual Dice */}
            <div className="flex flex-wrap gap-1 justify-center">
              {result.dice.map((roll, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className={cn(
                    'font-mono',
                    roll === diceType && 'bg-green-500 text-white',
                    roll === 1 && diceType === 20 && 'bg-red-500 text-white'
                  )}
                >
                  {roll}
                </Badge>
              ))}
              {result.modifier !== 0 && (
                <Badge variant="outline" className="font-mono">
                  {result.modifier >= 0 ? `+${result.modifier}` : result.modifier}
                </Badge>
              )}
            </div>

            {/* Special Results */}
            {diceType === 20 && diceCount === 1 && (
              <div className="text-center text-sm">
                {result.dice[0] === 20 && (
                  <Badge className="bg-green-500">Natural 20!</Badge>
                )}
                {result.dice[0] === 1 && (
                  <Badge className="bg-red-500">Natural 1!</Badge>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}