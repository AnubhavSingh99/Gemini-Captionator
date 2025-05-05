/**
 * @fileOverview Defines the input and output types for the image caption generation flow.
 */

import { z } from 'genkit';

export const GenerateImageCaptionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to be captioned, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateImageCaptionInput = z.infer<typeof GenerateImageCaptionInputSchema>;


export const GenerateImageCaptionOutputSchema = z.object({
  caption: z.string().describe('The generated caption for the image.'),
});
export type GenerateImageCaptionOutput = z.infer<typeof GenerateImageCaptionOutputSchema>;
