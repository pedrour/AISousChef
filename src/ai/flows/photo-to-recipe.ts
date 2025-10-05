'use server';

/**
 * @fileOverview A flow to generate a recipe based on a photo of ingredients.
 *
 * - photoToRecipe - A function that handles the recipe generation process from a photo.
 * - PhotoToRecipeInput - The input type for the photoToRecipe function.
 * - PhotoToRecipeOutput - The return type for the photoToRecipe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PhotoToRecipeInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of ingredients, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type PhotoToRecipeInput = z.infer<typeof PhotoToRecipeInputSchema>;

const PhotoToRecipeOutputSchema = z.object({
  recipeName: z.string().describe('The name of the recipe.'),
  ingredients: z.array(z.string()).describe('A list of ingredients for the recipe.'),
  instructions: z.array(z.string()).describe('Step-by-step instructions for the recipe.'),
});
export type PhotoToRecipeOutput = z.infer<typeof PhotoToRecipeOutputSchema>;

export async function photoToRecipe(input: PhotoToRecipeInput): Promise<PhotoToRecipeOutput> {
  return photoToRecipeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'photoToRecipePrompt',
  input: {schema: PhotoToRecipeInputSchema},
  output: {schema: PhotoToRecipeOutputSchema},
  prompt: `You are a world-class chef. You are excellent at creating recipes based on a set of ingredients.

  Based on the photo of ingredients, generate a recipe with the following structure:

  Recipe Name: (The name of the recipe)

  Ingredients:
  - (Ingredient 1)
  - (Ingredient 2)
  - (etc.)

  Instructions:
  1. (Step 1)
  2. (Step 2)
  3. (etc.)

  Here is the photo of ingredients: {{media url=photoDataUri}}`,
});

const photoToRecipeFlow = ai.defineFlow(
  {
    name: 'photoToRecipeFlow',
    inputSchema: PhotoToRecipeInputSchema,
    outputSchema: PhotoToRecipeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
