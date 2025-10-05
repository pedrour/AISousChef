import { config } from 'dotenv';
config();

import '@/ai/flows/text-to-recipe.ts';
import '@/ai/flows/generate-random-recipe.ts';
import '@/ai/flows/photo-to-recipe.ts';