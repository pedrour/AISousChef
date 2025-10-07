'use client';

import type { Recipe } from '@/app/actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from './ui/separator';
import { Salad, Soup, Volume2, X } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';

interface RecipeDisplayProps {
  recipe: Recipe;
}

export default function RecipeDisplay({ recipe }: RecipeDisplayProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  // Effect to load and select a preferred voice
  useEffect(() => {
    const getVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const femaleVoice = voices.find(
          (voice) => voice.lang === 'en-US' && voice.name.includes('Female')
        );
        setSelectedVoice(femaleVoice || voices.find(v => v.lang === 'en-US') || voices[0]);
      }
    };

    // Voices are loaded asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = getVoices;
    }
    getVoices(); // Initial call in case voices are already loaded

    // Cleanup speech synthesis on component unmount
    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const handleToggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const recipeText = `
        Recipe: ${recipe.recipeName}.
        Ingredients: ${recipe.ingredients.join(', ')}.
        Instructions: ${recipe.instructions.join(' ')}
      `;
      const utterance = new SpeechSynthesisUtterance(recipeText);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      utterance.onerror = () => {
        // Also reset state on error
        setIsSpeaking(false);
      };
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-primary">
          {recipe.recipeName}
        </CardTitle>
        <div className="flex justify-between items-center">
          <CardDescription>
            Here's a delicious recipe based on what you have.
          </CardDescription>
          <Button onClick={handleToggleSpeech} size="icon" variant="ghost">
            {isSpeaking ? <X /> : <Volume2 />}
            <span className="sr-only">{isSpeaking ? 'Stop reading' : 'Read recipe aloud'}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <h3 className="flex items-center gap-3 font-headline text-xl font-semibold mb-4">
            <Salad className="text-accent-foreground" />
            Ingredients
          </h3>
          <ul className="list-disc list-inside space-y-2 text-foreground/80 pl-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="pl-2">
                {ingredient.replace(/^- /, '')}
              </li>
            ))}
          </ul>
        </div>
        <Separator />
        <div>
          <h3 className="flex items-center gap-3 font-headline text-xl font-semibold mb-4">
            <Soup className="text-accent-foreground" />
            Instructions
          </h3>
          <ol className="list-decimal list-inside space-y-4 text-foreground/80 pl-2">
            {recipe.instructions.map((instruction, index) => (
              <li key={index} className="pl-2 leading-relaxed">
                <span className="font-semibold">Step {index + 1}</span>
                <p className="ml-1 inline">
                  {instruction.replace(/^\d+\.\s*/, '')}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
