'use server';

import { z } from 'zod';
import {
  textToRecipe,
  TextToRecipeOutput,
} from '@/ai/flows/text-to-recipe';
import {
  photoToRecipe,
  PhotoToRecipeOutput,
} from '@/ai/flows/photo-to-recipe';
import {
  generateRandomRecipe,
  RandomRecipeOutput,
} from '@/ai/flows/generate-random-recipe';

// Define a unified Recipe type for consistent data structure across the app
export interface Recipe {
  recipeName: string;
  ingredients: string[];
  instructions: string[];
}

// Helper to normalize the output from the text-to-recipe flow
const normalizeTextRecipe = (recipe: TextToRecipeOutput): Recipe => {
  return {
    recipeName: recipe.recipeName,
    ingredients: recipe.ingredientsList
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
    instructions: recipe.instructions
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
  };
};

// Helper to normalize other recipe formats (which are already arrays)
const normalizeArrayRecipe = (
  recipe: PhotoToRecipeOutput | RandomRecipeOutput
): Recipe => {
  return {
    recipeName: recipe.recipeName,
    ingredients: recipe.ingredients.map((s) => s.trim()).filter(Boolean),
    instructions: recipe.instructions.map((s) => s.trim()).filter(Boolean),
  };
};

const handleActionError = (
  error: unknown,
  context: string
): { recipe: null; error: string } => {
  console.error(`Error in ${context}:`, error);
  const message =
    error instanceof Error ? error.message : 'An unknown error occurred.';
  return { recipe: null, error: `Failed to generate recipe. ${message}` };
};

export async function generateRecipeFromText(ingredients: string) {
  const schema = z.string().min(3, 'Please provide some ingredients.');
  const validation = schema.safeParse(ingredients);
  if (!validation.success) {
    return {
      recipe: null,
      error: validation.error.errors.map((e) => e.message).join(' '),
    };
  }

  try {
    const rawRecipe = await textToRecipe({ ingredients: validation.data });
    const recipe = normalizeTextRecipe(rawRecipe);
    return { recipe, error: null };
  } catch (error) {
    return handleActionError(error, 'generateRecipeFromText');
  }
}

export async function generateRecipeFromPhoto(photoDataUri: string) {
  const schema = z.string().startsWith('data:image', 'Invalid image format.');
  const validation = schema.safeParse(photoDataUri);

  if (!validation.success) {
    return {
      recipe: null,
      error: validation.error.errors.map((e) => e.message).join(' '),
    };
  }

  try {
    const rawRecipe = await photoToRecipe({ photoDataUri: validation.data });
    const recipe = normalizeArrayRecipe(rawRecipe);
    return { recipe, error: null };
  } catch (error) {
    return handleActionError(error, 'generateRecipeFromPhoto');
  }
}

export async function generateRandomRecipeAction() {
  try {
    const rawRecipe = await generateRandomRecipe();
    const recipe = normalizeArrayRecipe(rawRecipe);
    return { recipe, error: null };
  } catch (error) {
    return handleActionError(error, 'generateRandomRecipeAction');
  }
}
