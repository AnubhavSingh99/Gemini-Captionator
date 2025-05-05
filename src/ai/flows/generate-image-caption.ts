'use server';
/**
 * @fileOverview An AI agent to generate captions for images.
 *
 * - generateImageCaption - A function that generates an image caption.
 * - GenerateImageCaptionInput - The input type for the generateImageCaption function.
 * - GenerateImageCaptionOutput - The return type for the generateImageCaption function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import type { GenerateImageCaptionInput, GenerateImageCaptionOutput } from '@/ai/types/caption-types'; // Import types

// Use imported types for schema validation
import { GenerateImageCaptionInputSchema, GenerateImageCaptionOutputSchema } from '@/ai/types/caption-types';

// Wrapper function remains the same
export async function generateImageCaption(input: GenerateImageCaptionInput): Promise<GenerateImageCaptionOutput> {
  return generateImageCaptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateImageCaptionPrompt',
  input: {
    // Use the imported schema directly
    schema: GenerateImageCaptionInputSchema,
  },
  output: {
    // Use the imported schema directly
    schema: GenerateImageCaptionOutputSchema,
  },
  prompt: `You are an expert image captioner. Generate a relevant, concise, and engaging caption for the image provided.

Image: {{media url=photoDataUri}}

Style Guide:
- Keep captions relatively short (1-2 sentences).
- Be descriptive but avoid stating the obvious unless it's poetic.
- Match the tone of the image (e.g., playful, serene, dramatic).
- Consider including relevant emotions or actions if depicted.
`,
});


const generateImageCaptionFlow = ai.defineFlow<
  typeof GenerateImageCaptionInputSchema,
  typeof GenerateImageCaptionOutputSchema
>({
  name: 'generateImageCaptionFlow',
  inputSchema: GenerateImageCaptionInputSchema,
  outputSchema: GenerateImageCaptionOutputSchema,
}, async input => {
   try {
    console.log(`[generateImageCaptionFlow] Received request for image captioning.`); // Log start
    const { output } = await prompt(input);
    if (!output) {
      // Handle cases where the prompt might return null/undefined output unexpectedly
      console.error('[generateImageCaptionFlow] Prompt returned null or undefined output.');
      throw new Error('Caption generation failed: No output received from AI model.');
    }
     // Ensure the output structure matches the schema before returning
    if (typeof output.caption !== 'string') {
       console.error('[generateImageCaptionFlow] Invalid output format received from AI model:', output);
       throw new Error('Caption generation failed: Invalid output format from AI model.');
    }
    console.log('[generateImageCaptionFlow] Caption generated successfully.'); // Log success
    return output;
  } catch (error) {
    // Log the detailed error on the server
    console.error('[generateImageCaptionFlow] Error during caption generation:', error);

    // Prepare a more informative error message for the client, including a digest if available
    let clientErrorMessage = 'Failed to process image or generate caption.';
    if (error instanceof Error) {
        // Include a generic server error message for the client
        clientErrorMessage += ' An internal server error occurred.';
        // If the error object has a digest (common in Next.js server component errors), include it
        // This helps Vercel logs link back to the specific server-side error instance.
        const digest = (error as any).digest;
        if (digest) {
             clientErrorMessage += ` (Digest: ${digest})`;
             console.error(`[generateImageCaptionFlow] Error Digest: ${digest}`);
        }
    }


    // Throw a new error with the client-safe message (and potentially the digest)
    // The original error with full stack trace is logged above for server-side debugging.
    throw new Error(clientErrorMessage);
  }
});
