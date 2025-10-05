'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a random recipe.
 *
 * The flow takes no input and returns a recipe with a name, ingredients, and instructions.
 *
 * @fileExport generateRandomRecipe - An async function that calls the generateRandomRecipeFlow and returns the recipe.
 * @fileExport RandomRecipeOutput - The output type for the generateRandomRecipe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RandomRecipeOutputSchema = z.object({
  recipeName: z.string().describe('The name of the recipe.'),
  ingredients: z.array(z.string()).describe('A list of ingredients for the recipe.'),
  instructions: z.array(z.string()).describe('A list of numbered instructions for the recipe.'),
});
export type RandomRecipeOutput = z.infer<typeof RandomRecipeOutputSchema>;

export async function generateRandomRecipe(): Promise<RandomRecipeOutput> {
  return generateRandomRecipeFlow({});
}

const prompt = ai.definePrompt({
  name: 'generateRandomRecipePrompt',
  output: {schema: RandomRecipeOutputSchema},
  prompt: `You are a creative chef. Generate a completely random recipe with the following format:

Recipe Name: (Name of the recipe)

Ingredients:
- (Ingredient 1)
- (Ingredient 2)
- (Ingredient 3)

Instructions:
1.  (Step 1)
2.  (Step 2)
3.  (Step 3)`,
});

const generateRandomRecipeFlow = ai.defineFlow(
  {
    name: 'generateRandomRecipeFlow',
    outputSchema: RandomRecipeOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    return output!;
  }
);
