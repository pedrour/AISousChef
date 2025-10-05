'use server';

/**
 * @fileOverview Recipe generation flow from a list of ingredients provided as text.
 *
 * - textToRecipe - A function that generates a recipe based on the provided ingredients.
 * - TextToRecipeInput - The input type for the textToRecipe function.
 * - TextToRecipeOutput - The return type for the textToRecipe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TextToRecipeInputSchema = z.object({
  ingredients: z
    .string()
    .describe('A comma-separated list of ingredients to use in the recipe.'),
});
export type TextToRecipeInput = z.infer<typeof TextToRecipeInputSchema>;

const TextToRecipeOutputSchema = z.object({
  recipeName: z.string().describe('The name of the generated recipe.'),
  ingredientsList: z.string().describe('A list of ingredients for the recipe.'),
  instructions: z.string().describe('Step-by-step instructions for preparing the recipe.'),
});
export type TextToRecipeOutput = z.infer<typeof TextToRecipeOutputSchema>;

export async function textToRecipe(input: TextToRecipeInput): Promise<TextToRecipeOutput> {
  return textToRecipeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'textToRecipePrompt',
  input: {schema: TextToRecipeInputSchema},
  output: {schema: TextToRecipeOutputSchema},
  prompt: `You are a world-class chef specializing in creating delicious recipes based on a given list of ingredients.

  Create a recipe using the following ingredients, prioritizing those ingredients:
  {{{ingredients}}}
  
  The recipe should include:
  - A creative and appealing recipe name.
  - A clear and concise list of ingredients with quantities.
  - Numbered, step-by-step instructions for preparing the recipe.
  `,
});

const textToRecipeFlow = ai.defineFlow(
  {
    name: 'textToRecipeFlow',
    inputSchema: TextToRecipeInputSchema,
    outputSchema: TextToRecipeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
