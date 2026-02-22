import { Client, Account, Databases, Storage } from 'appwrite';

const client = new Client();

client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { client };

export const PIXORA_DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '699905ae001555fa4d4e';
export const GENERATIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID || 'generations';
export const PIXORA_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || '699906a80005cbe15f4d';
