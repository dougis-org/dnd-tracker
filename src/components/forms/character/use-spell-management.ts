import { useState, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import type { CharacterFormInput } from '@/lib/validations/character';
import { getSpellListType } from '@/lib/dnd/spellcasting-utils';

export function useSpellManagement(form: UseFormReturn<CharacterFormInput>) {
  const [isAddingSpell, setIsAddingSpell] = useState(false);
  const [newSpell, setNewSpell] = useState('');

  const handleAddSpell = useCallback((className: string) => {
    if (newSpell.trim()) {
      const spellType = getSpellListType(className);
      const fieldName = spellType === 'known' 
        ? 'spellcasting.spellsKnown' 
        : 'spellcasting.spellsPrepared';
      
      const currentSpells = form.getValues(fieldName) || [];
      const updatedSpells = [...currentSpells, newSpell.trim()];
      
      form.setValue(fieldName, updatedSpells, { shouldValidate: true });
      setNewSpell('');
      setIsAddingSpell(false);
    }
  }, [newSpell, form]);

  const handleRemoveSpell = useCallback((index: number, className: string) => {
    const spellType = getSpellListType(className);
    const fieldName = spellType === 'known' 
      ? 'spellcasting.spellsKnown' 
      : 'spellcasting.spellsPrepared';

    const currentSpells = form.getValues(fieldName) || [];
    const updatedSpells = currentSpells.filter((_, i) => i !== index);
    
    form.setValue(fieldName, updatedSpells, { shouldValidate: true });
  }, [form]);

  return {
    isAddingSpell,
    setIsAddingSpell,
    newSpell,
    setNewSpell,
    handleAddSpell,
    handleRemoveSpell
  };
}