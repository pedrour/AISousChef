import type { Recipe } from '@/app/actions';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from './ui/separator';

interface RecipeDisplayProps {
  recipe: Recipe;
}

export default function RecipeDisplay({ recipe }: RecipeDisplayProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-primary">
          {recipe.recipeName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-headline text-xl font-semibold mb-3">
            Ingredients
          </h3>
          <ul className="list-disc list-inside space-y-1 text-foreground/90 pl-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="pl-1">
                {ingredient.replace(/^- /, '')}
              </li>
            ))}
          </ul>
        </div>
        <Separator />
        <div>
          <h3 className="font-headline text-xl font-semibold mb-3">
            Instructions
          </h3>
          <ol className="list-decimal list-inside space-y-3 text-foreground/90 pl-2">
            {recipe.instructions.map((instruction, index) => (
              <li key={index} className="pl-1 leading-relaxed">
                {instruction.replace(/^\d+\.\s*/, '')}
              </li>
            ))}
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
