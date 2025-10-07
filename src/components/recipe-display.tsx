import type { Recipe } from '@/app/actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from './ui/separator';
import { Salad, Soup } from 'lucide-react';

interface RecipeDisplayProps {
  recipe: Recipe;
}

export default function RecipeDisplay({ recipe }: RecipeDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-primary">
          {recipe.recipeName}
        </CardTitle>
        <CardDescription>
          Here's a delicious recipe based on what you have.
        </CardDescription>
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
