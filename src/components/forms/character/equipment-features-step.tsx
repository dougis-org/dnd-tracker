"use client";

import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
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
import {
  EQUIPMENT_CATEGORIES,
  CLASS_STARTING_EQUIPMENT,
  BACKGROUND_STARTING_EQUIPMENT
} from '@/lib/dnd-data';

// Simple hash function for creating stable keys
const hashString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
};

export function EquipmentFeaturesStep() {
  const form = useFormContext<CharacterFormInput>();
  const [isAddingEquipment, setIsAddingEquipment] = useState(false);
  const [isAddingFeature, setIsAddingFeature] = useState(false);
  const [newEquipment, setNewEquipment] = useState({ name: '', quantity: 1, category: '' });
  const [newFeature, setNewFeature] = useState('');
  
  // Get data from form context
  const classes = form.watch('classes') || [];
  const background = form.watch('background') || '';
  const equipment = form.watch('equipment') || [];
  const features = form.watch('features') || [];
  const notes = form.watch('notes') || '';
  
  // Handle equipment directly through form values to avoid useFieldArray infinite loops
  const addEquipment = (item: { name: string; quantity: number; category: string }) => {
    const currentEquipment = form.getValues('equipment') || [];
    form.setValue('equipment', [...currentEquipment, item]);
  };

  const removeEquipment = (index: number) => {
    const currentEquipment = form.getValues('equipment') || [];
    const updatedEquipment = currentEquipment.filter((_, i) => i !== index);
    form.setValue('equipment', updatedEquipment);
  };

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
      addEquipment(newEquipment);
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
        {equipment.length > 0 && (
          <div className="space-y-2">
            {equipment.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                      <span>Quantity: {item.quantity}</span>
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEquipment(index)}
                  aria-label={`Remove ${item.name}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {equipment.length === 0 && !isAddingEquipment && (
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
              <div key={`feature-${hashString(feature)}`} className="flex items-start justify-between p-3 border rounded-lg">
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