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

const GenerateImageCaptionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to generate a caption for, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateImageCaptionInput = z.infer<typeof GenerateImageCaptionInputSchema>;

const GenerateImageCaptionOutputSchema = z.object({
  caption: z.string().describe('A relevant caption for the image.'),
});
export type GenerateImageCaptionOutput = z.infer<typeof GenerateImageCaptionOutputSchema>;

export async function generateImageCaption(input: GenerateImageCaptionInput): Promise<GenerateImageCaptionOutput> {
  return generateImageCaptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateImageCaptionPrompt',
  input: {
    schema: z.object({
      photoDataUri: z
        .string()
        .describe(
          "A photo to generate a caption for, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
    }),
  },
  output: {
    schema: z.object({
      caption: z.string().describe('A relevant caption for the image.'),
    }),
  },
  prompt: `You are an expert image captioner. Generate a relevant caption for the image provided.

Image: {{media url=photoDataUri}}`,
});

const generateImageCaptionFlow = ai.defineFlow<
  typeof GenerateImageCaptionInputSchema,
  typeof GenerateImageCaptionOutputSchema
>({
  name: 'generateImageCaptionFlow',
  inputSchema: GenerateImageCaptionInputSchema,
  outputSchema: GenerateImageCaptionOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
