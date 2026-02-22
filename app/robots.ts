import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard/', '/profile/', '/api/'],
        },
        sitemap: 'https://pixora.vercel.app/sitemap.xml',
    };
}
