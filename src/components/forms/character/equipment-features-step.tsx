"use client";

import React, { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Package, Scroll } from 'lucide-react';
import { 
  type CharacterFormInput,
  type EquipmentFormData 
} from '@/lib/validations/character';

// Equipment categories
const EQUIPMENT_CATEGORIES = [
  'Weapon',
  'Armor',
  'Shield',
  'Ammunition',
  'Adventuring Gear',
  'Tool',
  'Mount',
  'Vehicle',
  'Treasure',
  'Magic Item'
] as const;

// Starting equipment by class
const CLASS_STARTING_EQUIPMENT: Record<string, string[]> = {
  'Artificer': ['Light crossbow and 20 bolts', 'Scale mail or leather armor', 'Shield', 'Thieves\' tools', 'Dungeoneer\'s pack'],
  'Barbarian': ['Greataxe or any martial melee weapon', 'Two handaxes or any simple weapon', 'Explorer\'s pack', 'Four javelins'],
  'Bard': ['Rapier or longsword or any simple weapon', 'Diplomat\'s pack or entertainer\'s pack', 'Lute or any other musical instrument', 'Leather armor', 'Dagger'],
  'Cleric': ['Mace or warhammer', 'Scale mail or leather armor or chain mail', 'Shield', 'Light crossbow and 20 bolts or any simple weapon', 'Priest\'s pack or explorer\'s pack'],
  'Druid': ['Shield or any simple weapon', 'Scimitar or any simple melee weapon', 'Leather armor', 'Explorer\'s pack', 'Druidcraft focus'],
  'Fighter': ['Chain mail or leather armor', 'Shield', 'Martial weapon and shield or two martial weapons', 'Light crossbow and 20 bolts or two handaxes', 'Dungeoneer\'s pack or explorer\'s pack'],
  'Monk': ['Shortsword or any simple weapon', 'Dungeoneer\'s pack or explorer\'s pack', '10 darts'],
  'Paladin': ['Chain mail', 'Shield', 'Martial weapon', 'Five javelins or any simple melee weapon', 'Priest\'s pack or explorer\'s pack'],
  'Ranger': ['Scale mail or leather armor', 'Shield', 'Shortsword or any simple melee weapon', 'Longbow and quiver with 20 arrows', 'Dungeoneer\'s pack or explorer\'s pack'],
  'Rogue': ['Rapier or shortsword', 'Shortbow and quiver with 20 arrows', 'Burglar\'s pack or dungeoneer\'s pack or explorer\'s pack', 'Leather armor', 'Two daggers', 'Thieves\' tools'],
  'Sorcerer': ['Light crossbow and 20 bolts or any simple weapon', 'Component pouch or arcane focus', 'Dungeoneer\'s pack or explorer\'s pack', 'Two daggers'],
  'Warlock': ['Light armor', 'Simple weapon', 'Two daggers', 'Simple weapon', 'Dungeoneer\'s pack or scholar\'s pack'],
  'Wizard': ['Quarterstaff or dagger', 'Component pouch or arcane focus', 'Scholar\'s pack or explorer\'s pack', 'Spellbook', 'Two daggers']
};

// Starting equipment by background
const BACKGROUND_STARTING_EQUIPMENT: Record<string, string[]> = {
  'Acolyte': ['Holy symbol', 'Prayer book', 'Incense (5 sticks)', 'Vestments', 'Common clothes', 'Pouch (15 gp)'],
  'Criminal': ['Crowbar', 'Dark common clothes with hood', 'Pouch (15 gp)'],
  'Folk Hero': ['Smith\'s tools', 'Brewer\'s supplies or Mason\'s tools', 'Shovel', 'Iron pot', 'Common clothes', 'Pouch (10 gp)'],
  'Noble': ['Signet ring', 'Scroll of pedigree', 'Fine clothes', 'Pouch (25 gp)'],
  'Sage': ['Bottle of black ink', 'Quill', 'Small knife', 'Scroll case with spiritual writings', 'Common clothes', 'Pouch (10 gp)'],
  'Soldier': ['Insignia of rank', 'Trophy from fallen enemy', 'Deck of cards', 'Common clothes', 'Pouch (10 gp)'],
  'Charlatan': ['Disguise kit', 'Forgery kit', 'Signet ring (fake)', 'Fine clothes', 'Pouch (15 gp)'],
  'Entertainer': ['Musical instrument', 'Disguise kit', 'Costume clothes', 'Pouch (15 gp)'],
  'Guild Artisan': ['Artisan\'s tools', 'Letter of introduction from guild', 'Traveler\'s clothes', 'Pouch (15 gp)'],
  'Hermit': ['Herbalism kit', 'Scroll case with spiritual writings', 'Winter blanket', 'Common clothes', 'Pouch (5 gp)'],
  'Outlander': ['Staff', 'Hunting trap', 'Traveler\'s clothes', 'Pouch (10 gp)'],
  'Sailor': ['Navigator\'s tools', '50 feet of silk rope', 'Lucky charm', 'Common clothes', 'Pouch (10 gp)']
};

export function EquipmentFeaturesStep() {
  const form = useFormContext<CharacterFormInput>();
  const [isAddingEquipment, setIsAddingEquipment] = useState(false);
  const [isAddingFeature, setIsAddingFeature] = useState(false);
  const [newEquipment, setNewEquipment] = useState({ name: '', quantity: 1, category: '' });
  const [newFeature, setNewFeature] = useState('');
  
  const formData = form.watch();
  const { classes, background, equipment = [], features = [], notes = '' } = formData;
  
  const { 
    fields: equipmentFields, 
    append: appendEquipment, 
    remove: removeEquipment 
  } = useFieldArray({
    control: form.control,
    name: 'equipment'
  });

  // Handle features as simple string array
  const addFeature = (feature: string) => {
    const currentFeatures = form.getValues('features') || [];
    form.setValue('features', [...currentFeatures, feature]);
  };

  const removeFeature = (index: number) => {
    const currentFeatures = form.getValues('features') || [];
    const updatedFeatures = currentFeatures.filter((_, i) => i !== index);
    form.setValue('features', updatedFeatures);
  };

  // Get starting equipment suggestions
  const primaryClass = classes[0]?.className;
  const classEquipment = primaryClass ? CLASS_STARTING_EQUIPMENT[primaryClass] || [] : [];
  const backgroundEquipment = background ? BACKGROUND_STARTING_EQUIPMENT[background] || [] : [];

  // Handle adding new equipment
  const handleAddEquipment = () => {
    if (newEquipment.name.trim() && newEquipment.category) {
      appendEquipment(newEquipment);
      setNewEquipment({ name: '', quantity: 1, category: '' });
      setIsAddingEquipment(false);
    }
  };

  // Handle adding new feature
  const handleAddFeature = () => {
    if (newFeature.trim()) {
      addFeature(newFeature.trim());
      setNewFeature('');
      setIsAddingFeature(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Starting Equipment Information */}
      {(classEquipment.length > 0 || backgroundEquipment.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Starting Equipment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {classEquipment.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">
                  {primaryClass} Starting Equipment:
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {classEquipment.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}
            {backgroundEquipment.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">
                  {background} Background Equipment:
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {backgroundEquipment.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="text-sm text-muted-foreground border-l-4 border-muted pl-3">
              <p>
                <strong>Note:</strong> Starting equipment is automatically provided based on your class and background.
                Add additional equipment below that your character has acquired.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Equipment Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Equipment
            </h3>
            <p className="text-sm text-muted-foreground">
              Additional equipment your character owns beyond starting gear.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAddingEquipment(true)}
            disabled={isAddingEquipment}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Equipment
          </Button>
        </div>

        {/* Add Equipment Form */}
        {isAddingEquipment && (
          <Card className="mb-4">
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <FormLabel htmlFor="equipment-name">Item Name *</FormLabel>
                  <Input
                    id="equipment-name"
                    placeholder="Enter item name"
                    value={newEquipment.name}
                    onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                    maxLength={100}
                  />
                  {!newEquipment.name.trim() && (
                    <p className="text-sm text-destructive mt-1">Item name is required</p>
                  )}
                </div>
                
                <div>
                  <FormLabel htmlFor="equipment-quantity">Quantity</FormLabel>
                  <Input
                    id="equipment-quantity"
                    type="number"
                    min="0"
                    value={newEquipment.quantity}
                    onChange={(e) => setNewEquipment({ ...newEquipment, quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <FormLabel htmlFor="equipment-category">Category *</FormLabel>
                  <Select
                    value={newEquipment.category}
                    onValueChange={(value) => setNewEquipment({ ...newEquipment, category: value })}
                  >
                    <SelectTrigger id="equipment-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {EQUIPMENT_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!newEquipment.category && (
                    <p className="text-sm text-destructive mt-1">Category is required</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddEquipment}
                  disabled={!newEquipment.name.trim() || !newEquipment.category}
                >
                  Save Item
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddingEquipment(false);
                    setNewEquipment({ name: '', quantity: 1, category: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Equipment List */}
        {equipmentFields.length > 0 && (
          <div className="space-y-2">
            {equipmentFields.map((field, index) => (
              <div key={field.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium">{equipment[index]?.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {equipment[index]?.category}
                      </Badge>
                      <span>Quantity: {equipment[index]?.quantity}</span>
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEquipment(index)}
                  aria-label={`Remove ${equipment[index]?.name}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {equipmentFields.length === 0 && !isAddingEquipment && (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No additional equipment added yet.</p>
            <p className="text-sm">Click &quot;Add Equipment&quot; to add items your character owns.</p>
          </div>
        )}
      </div>

      {/* Features & Traits Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Scroll className="h-5 w-5" />
              Features & Traits
            </h3>
            <p className="text-sm text-muted-foreground">
              Special abilities, racial traits, class features, and other character traits.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAddingFeature(true)}
            disabled={isAddingFeature}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Feature
          </Button>
        </div>

        {/* Add Feature Form */}
        {isAddingFeature && (
          <Card className="mb-4">
            <CardContent className="pt-4">
              <FormLabel htmlFor="new-feature">Feature or Trait</FormLabel>
              <Textarea
                id="new-feature"
                placeholder="Enter feature name and description (e.g., 'Darkvision: Can see in darkness up to 60 feet')"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                maxLength={500}
                className="mt-1"
              />
              <div className="flex gap-2 mt-3">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddFeature}
                  disabled={!newFeature.trim()}
                >
                  Save Feature
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddingFeature(false);
                    setNewFeature('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features List */}
        {features.length > 0 && (
          <div className="space-y-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="text-sm whitespace-pre-wrap">{feature}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFeature(index)}
                  className="ml-2 flex-shrink-0"
                  aria-label="Remove feature"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {features.length === 0 && !isAddingFeature && (
          <div className="text-center py-8 text-muted-foreground">
            <Scroll className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No features or traits added yet.</p>
            <p className="text-sm">Add racial traits, class features, and special abilities.</p>
          </div>
        )}
      </div>

      {/* Additional Notes */}
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional Notes</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Add any additional notes about your character, backstory, personality, or other details..."
                className="min-h-[100px]"
                maxLength={2000}
              />
            </FormControl>
            <FormDescription>
              {notes.length}/2000 characters. Include backstory, personality traits, goals, or other character details.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Form completion hint */}
      <div className="text-sm text-muted-foreground border-l-4 border-muted pl-4">
        <p>
          <strong>Equipment & Features:</strong> Add items and abilities that make your character unique.
        </p>
        <p className="mt-1">
          Equipment includes weapons, armor, tools, and other gear. Features include racial traits, 
          class abilities, and special powers.
        </p>
      </div>
    </div>
  );
}