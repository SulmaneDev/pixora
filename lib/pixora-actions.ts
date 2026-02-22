'use server'

import { Filter } from 'bad-words';
import axios from 'axios';

const PIXORA_ENGINE_URL = 'https://aisandbox-pa.googleapis.com/v1/whisk:generateImage';
const filter = new Filter();

export interface GenerationSettings {
    prompt: string;
    aspectRatio: string;
    token: string;
}

export async function generatePixoraImage({ prompt, aspectRatio, token }: GenerationSettings) {
    // Safety Filter
    if (filter.isProfane(prompt)) {
        throw new Error('PROMPT_BLOCKED: Restricted content detected in prompt.');
    }

    const maxRetries = 2; // Exact match with Jagga Engine logic
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const sessionId = ";" + Date.now();
            const seed = Math.floor(Math.random() * 2147483647);

            const payload = {
                clientContext: {
                    workflowId: "",
                    tool: "BACKBONE",
                    sessionId: sessionId
                },
                imageModelSettings: {
                    imageModel: "IMAGEN_3_5",
                    aspectRatio: aspectRatio
                },
                prompt: prompt,
                mediaCategory: "MEDIA_CATEGORY_BOARD",
                seed: seed
            };

            // Server-side call: Restricted headers like 'Origin' are allowed here
            const response = await axios.post(PIXORA_ENGINE_URL, payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Origin': 'https://labs.google',
                    'X-Kl-Ajax-Request': 'Ajax_Request',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
                },
                timeout: 60000 // 60s timeout matching Jagga
            });

            const imagePanels = response.data?.imagePanels;
            if (!imagePanels || imagePanels.length === 0) {
                throw new Error('No image panels returned');
            }

            const generatedImages = imagePanels[0].generatedImages;
            if (!generatedImages || generatedImages.length === 0) {
                throw new Error('Generated images array is empty');
            }

            return generatedImages[0].encodedImage; // Base64 Success

        } catch (error: any) {
            lastError = error;
            const status = error.response?.status;

            // If it's an auth error, don't retry, just fail to signal expiration
            if (status === 401 || status === 403) {
                throw new Error('CONNECTION_EXPIRED');
            }

            console.error(`[Pixora Server] Attempt ${attempt} failed:`, error.message);

            if (attempt < maxRetries) {
                // Short wait before retry like in Jagga main.py
                await new Promise(resolve => setTimeout(resolve, 2000));
                continue;
            }
        }
    }

    // If we reach here, all retries failed
    const errorMsg = lastError?.response?.data?.error?.message || lastError?.message || 'Failed after retries';
    throw new Error(`Pixora Engine: ${errorMsg}`);
}
