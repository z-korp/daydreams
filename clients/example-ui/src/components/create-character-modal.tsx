import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Character {
  name: string;
  bio: string;
  traits: Array<{
    name: string;
    description: string;
    strength: number;
    examples: string[];
  }>;
  voice: {
    tone: string;
    style: string;
    vocabulary: string[];
    commonPhrases: string[];
    emojis: string[];
  };
  instructions: {
    goals: string[];
    constraints: string[];
    topics: string[];
    responseStyle: string[];
    contextRules: string[];
  };
}

interface CreateCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (character: Character) => void;
}

export function CreateCharacterModal({ isOpen, onClose, onSubmit }: CreateCharacterModalProps) {
  const [character, setCharacter] = useState<Character>({
    name: "",
    bio: "",
    traits: [],
    voice: {
      tone: "",
      style: "",
      vocabulary: [],
      commonPhrases: [],
      emojis: []
    },
    instructions: {
      goals: [],
      constraints: [],
      topics: [],
      responseStyle: [],
      contextRules: []
    }
  });

  const [newTrait, setNewTrait] = useState({
    name: "",
    description: "",
    strength: 0.5,
    examples: [""]
  });

  const handleArrayInput = (
    category: 'vocabulary' | 'commonPhrases' | 'emojis' | 'goals' | 'constraints' | 'topics' | 'responseStyle' | 'contextRules',
    parent: 'voice' | 'instructions',
    value: string
  ) => {
    const items = value.split('\n').filter(item => item.trim() !== '');
    setCharacter(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [category]: items
      }
    }));
  };

  const addTrait = () => {
    if (newTrait.name && newTrait.description) {
      setCharacter(prev => ({
        ...prev,
        traits: [...prev.traits, { ...newTrait, examples: newTrait.examples.filter(ex => ex.trim() !== '') }]
      }));
      setNewTrait({
        name: "",
        description: "",
        strength: 0.5,
        examples: [""]
      });
    }
  };

  const removeTrait = (index: number) => {
    setCharacter(prev => ({
      ...prev,
      traits: prev.traits.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    if (!character.name || !character.bio) return;
    onSubmit(character);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle>Create New Character</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="traits">Traits</TabsTrigger>
            <TabsTrigger value="voice">Voice</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <input
              type="text"
              value={character.name}
              onChange={(e) => setCharacter({...character, name: e.target.value})}
              placeholder="Character name..."
              className="w-full px-4 py-2 rounded-lg border bg-background"
            />
            <textarea
              value={character.bio}
              onChange={(e) => setCharacter({...character, bio: e.target.value})}
              placeholder="Character bio..."
              className="w-full px-4 py-2 rounded-lg border bg-background h-32"
            />
          </TabsContent>

          <TabsContent value="traits" className="space-y-4 mt-4">
            <div className="space-y-4 border rounded-lg p-4">
              <input
                type="text"
                value={newTrait.name}
                onChange={(e) => setNewTrait({...newTrait, name: e.target.value})}
                placeholder="Trait name..."
                className="w-full px-4 py-2 rounded-lg border bg-background"
              />
              <textarea
                value={newTrait.description}
                onChange={(e) => setNewTrait({...newTrait, description: e.target.value})}
                placeholder="Trait description..."
                className="w-full px-4 py-2 rounded-lg border bg-background h-20"
              />
              <div className="flex items-center gap-2">
                <span>Strength:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={newTrait.strength}
                  onChange={(e) => setNewTrait({...newTrait, strength: parseFloat(e.target.value)})}
                  className="flex-1"
                />
                <span>{newTrait.strength}</span>
              </div>
              <textarea
                value={newTrait.examples.join('\n')}
                onChange={(e) => setNewTrait({...newTrait, examples: e.target.value.split('\n')})}
                placeholder="Examples (one per line)..."
                className="w-full px-4 py-2 rounded-lg border bg-background h-20"
              />
              <button
                onClick={addTrait}
                className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Add Trait
              </button>
            </div>

            <div className="space-y-2">
              {character.traits.map((trait, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{trait.name}</h3>
                    <button
                      onClick={() => removeTrait(index)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="text-sm mt-1">{trait.description}</p>
                  <div className="text-sm mt-1">Strength: {trait.strength}</div>
                  <div className="text-sm mt-1">Examples: {trait.examples.join(', ')}</div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="voice" className="space-y-4 mt-4">
            <input
              type="text"
              value={character.voice.tone}
              onChange={(e) => setCharacter({...character, voice: {...character.voice, tone: e.target.value}})}
              placeholder="Tone..."
              className="w-full px-4 py-2 rounded-lg border bg-background"
            />
            <input
              type="text"
              value={character.voice.style}
              onChange={(e) => setCharacter({...character, voice: {...character.voice, style: e.target.value}})}
              placeholder="Style..."
              className="w-full px-4 py-2 rounded-lg border bg-background"
            />
            <textarea
              value={character.voice.vocabulary.join('\n')}
              onChange={(e) => handleArrayInput('vocabulary', 'voice', e.target.value)}
              placeholder="Vocabulary (one per line)..."
              className="w-full px-4 py-2 rounded-lg border bg-background h-32"
            />
            <textarea
              value={character.voice.commonPhrases.join('\n')}
              onChange={(e) => handleArrayInput('commonPhrases', 'voice', e.target.value)}
              placeholder="Common phrases (one per line)..."
              className="w-full px-4 py-2 rounded-lg border bg-background h-32"
            />
            <textarea
              value={character.voice.emojis.join('\n')}
              onChange={(e) => handleArrayInput('emojis', 'voice', e.target.value)}
              placeholder="Emojis (one per line)..."
              className="w-full px-4 py-2 rounded-lg border bg-background h-20"
            />
          </TabsContent>

          <TabsContent value="instructions" className="space-y-4 mt-4">
            <textarea
              value={character.instructions.goals.join('\n')}
              onChange={(e) => handleArrayInput('goals', 'instructions', e.target.value)}
              placeholder="Goals (one per line)..."
              className="w-full px-4 py-2 rounded-lg border bg-background h-32"
            />
            <textarea
              value={character.instructions.constraints.join('\n')}
              onChange={(e) => handleArrayInput('constraints', 'instructions', e.target.value)}
              placeholder="Constraints (one per line)..."
              className="w-full px-4 py-2 rounded-lg border bg-background h-32"
            />
            <textarea
              value={character.instructions.topics.join('\n')}
              onChange={(e) => handleArrayInput('topics', 'instructions', e.target.value)}
              placeholder="Topics (one per line)..."
              className="w-full px-4 py-2 rounded-lg border bg-background h-32"
            />
            <textarea
              value={character.instructions.responseStyle.join('\n')}
              onChange={(e) => handleArrayInput('responseStyle', 'instructions', e.target.value)}
              placeholder="Response styles (one per line)..."
              className="w-full px-4 py-2 rounded-lg border bg-background h-32"
            />
            <textarea
              value={character.instructions.contextRules.join('\n')}
              onChange={(e) => handleArrayInput('contextRules', 'instructions', e.target.value)}
              placeholder="Context rules (one per line)..."
              className="w-full px-4 py-2 rounded-lg border bg-background h-32"
            />
          </TabsContent>
        </Tabs>

        <button
          onClick={handleSubmit}
          className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 mt-4"
        >
          Create Character
        </button>
      </DialogContent>
    </Dialog>
  );
} 