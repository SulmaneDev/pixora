# ✦ PIXORA AI ✦

### Next-Gen Neural Image Generation Studio

![Pixora Banner](https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=1200)

**Pixora** is a high-fidelity, professional-grade AI image generation platform. Built for elite creators, it bridges the gap between neural complexity and seamless creative workflow.

---

## 🚀 Key Features

- **Hyper-Latency Engine**: Sub-2s generation cycles optimized for RTX 4090 clusters.
- **Parallel Matrix Processing**: Batch-execute multiple prompts simultaneously for rapid iteration.
- **Community Showcase**: Real-time inspiration feed with full prompt transparency.
- **Pixora Sync (Extension)**: Automated session synchronization via Chrome Extension — zero manual copy-pasting.
- **Enterprise-Grade SEO**: Fully optimized for Google, Gemini, and Perplexity with Schema.org markup.
- **Premium UI**: Sleek, glassmorphic dark mode interface built with React & Tailwind CSS.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Database/Auth**: [Appwrite](https://appwrite.io/)
- **UI/UX**: Tailwind CSS, Shadcn/UI, Lucide Icons
- **State Management**: TanStack Query (React Query)
- **Engine**: Pixora Latent Diffusion Matrix Architecture

---

## 🏁 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (Recommended)

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-username/pixora-ai.git
   cd pixora-ai
   ```

2. **Install Dependencies**

   ```bash
   pnpm install
   ```

3. **Environment Setup**
   Copy `.env.example` to `.env` and fill in your Appwrite credentials:

   ```env
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=XXXX
   NEXT_PUBLIC_APPWRITE_DB_ID=XXXX
   ...
   ```

4. **Run Development Server**
   ```bash
   pnpm dev
   ```

---

## 🧩 Pixora Sync Extension

To utilize the full power of the Pixora Engine, you must install the Sync Extension:

1. Navigate to `chrome://extensions`.
2. Enable **Developer Mode**.
3. Click **Load Unpacked** and select the `extension/` directory from this repository.
4. Click the Pixora icon in your toolbar to sync your session.

---

## 📈 SEO & Performance

Pixora is built with a 100% SEO strategy:

- **Core Web Vitals**: Optimized for LCP and FID.
- **Metadata**: Dynamic server-side metadata for every page.
- **Sitemap**: Automated XML sitemaps via `app/sitemap.ts`.
- **Schema**: Integrated `SoftwareApplication` and `ImageGallery` JSON-LD markup.

---

## 🤝 Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to get started and our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ✦ by the Pixora Team. 2026.
