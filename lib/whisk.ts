import axios from 'axios';
import { storage, PIXORA_BUCKET_ID, databases, PIXORA_DB_ID, GENERATIONS_COLLECTION_ID } from './appwrite';
import { ID, Query } from 'appwrite';

// Image generation logic moved to @/lib/pixora-actions for Server-Action support (CORS bypass)

export async function saveGenerationToAppwrite(userId: string, userName: string, prompt: string, aspectRatio: string, base64Image: string) {
    try {
        // 1. Convert base64 to File
        const byteString = atob(base64Image);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: 'image/png' });
        const file = new File([blob], `pixora_${Date.now()}.png`, { type: 'image/png' });

        // 2. Upload to Appwrite Storage
        const storageFile = await storage.createFile(PIXORA_BUCKET_ID, ID.unique(), file);

        // 3. Save Metadata to Database
        const document = await databases.createDocument(
            PIXORA_DB_ID,
            GENERATIONS_COLLECTION_ID,
            ID.unique(),
            {
                prompt: prompt,
                image_id: storageFile.$id,
                user_id: userId,
                user_name: userName,
                created_at: new Date().toISOString(),
                aspect_ratio: aspectRatio,
                is_public: true
            }
        );
        return document;
    } catch (error: any) {
        console.error('Appwrite Save Error:', error);
        throw new Error('Failed to save to Pixora Archive');
    }
}

export async function getDailyGenerationCount(userId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const response = await databases.listDocuments(
        PIXORA_DB_ID,
        GENERATIONS_COLLECTION_ID,
        [
            Query.equal('user_id', userId),
            Query.greaterThanEqual('created_at', startOfDay.toISOString())
        ]
    );

    return response.total;
}

export async function deleteGeneration(docId: string, imageId: string) {
    try {
        // 1. Delete file from storage
        await storage.deleteFile(PIXORA_BUCKET_ID, imageId);
        // 2. Delete document from database
        await databases.deleteDocument(PIXORA_DB_ID, GENERATIONS_COLLECTION_ID, docId);
        return true;
    } catch (error) {
        console.error('Delete Error:', error);
        throw new Error('Failed to delete generation');
    }
}

export async function cleanupOldGenerations() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const response = await databases.listDocuments(
        PIXORA_DB_ID,
        GENERATIONS_COLLECTION_ID,
        [Query.lessThan('created_at', sevenDaysAgo.toISOString())]
    );

    for (const doc of response.documents) {
        // Delete file from storage
        try {
            await storage.deleteFile(PIXORA_BUCKET_ID, doc.image_id);
        } catch (e) {
            console.error(`Failed to delete storage file ${doc.image_id}`, e);
        }
        // Delete document
        await databases.deleteDocument(PIXORA_DB_ID, GENERATIONS_COLLECTION_ID, doc.$id);
    }
}
