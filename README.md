# Akash Agrawal - Portfolio

A modern, responsive portfolio website built with Next.js 14+, TypeScript, and Tailwind CSS, showcasing my journey as a Full-Stack Software Engineer specializing in AI/ML and Systems at Scale.

## 🌟 Overview

This portfolio represents a complete ground-up rebuild from a static HTML site to a modern web application. It features a clean, professional design with dark mode support, smooth animations, and a mobile-first responsive approach.

**Live Site:** [Coming Soon]  
**Resume:** [View PDF](https://drive.google.com/file/d/1P40RrIwUYP21LqoVb1LpgKvG4eDpeP8o/view?usp=sharing)

## 🛠️ Tech Stack

### Core Technologies
- **Next.js 15+** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library

### Key Features
- ⚡ Server-side rendering (SSR) and static generation
- 🌓 Dark/light theme toggle with localStorage persistence
- 📱 Fully responsive design (mobile-first approach)
- ♿ Accessible UI components
- 🎨 Modern gradient backgrounds and smooth animations
- 🔍 SEO optimized with Next.js metadata

## 📁 Project Structure

```
portfolio/
├── app/
│   ├── layout.tsx              # Root layout with metadata, fonts, theme provider
│   ├── page.tsx                # Home page (renders all sections)
│   └── globals.css             # Tailwind base styles
├── components/
│   ├── Header.tsx              # Sticky navigation header with mobile hamburger menu
│   ├── Hero.tsx                # Hero section with profile photo, tagline, social links
│   ├── About.tsx               # About Me section
│   ├── Skills.tsx              # Skills grouped by category
│   ├── Experience.tsx          # Professional experience timeline
│   ├── Projects.tsx            # Project showcase cards
│   ├── Achievements.tsx        # Awards, ICPC, community involvement
│   ├── Contact.tsx             # Contact form (UI only for now)
│   ├── Footer.tsx              # Footer with social links, copyright
│   ├── ThemeProvider.tsx       # Theme context provider
│   └── ThemeToggle.tsx         # Dark/light mode toggle button
├── lib/
│   ├── resume-data.ts          # Structured resume data as TypeScript constants
│   └── utils.ts                # Utility helpers (e.g., cn() for classnames)
├── data/
│   └── resume.json             # Resume as structured JSON (for RAG pipeline)
├── public/
│   └── images/                 # Image assets
├── tailwind.config.ts          # Tailwind CSS configuration
├── next.config.ts              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sky021/Portfolio.git
cd Portfolio
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🎯 Features

### Sections
1. **Hero** - Introduction with profile photo and social links
2. **About** - Background, education, and career objectives
3. **Skills** - Technical skills organized by category (Languages, AI/ML, Frameworks, DevOps, Databases, Observability)
4. **Experience** - Professional work history with detailed achievements
5. **Projects** - Featured projects with tech stacks and key metrics
6. **Achievements** - Recognition and community involvement
7. **Contact** - Contact form and social links

### Theme System
- Automatic dark mode detection based on system preferences
- Manual theme toggle with localStorage persistence
- Smooth transitions between themes

### Data-Driven Content
All content is centralized in `lib/resume-data.ts` as a single source of truth, ensuring consistency and easy updates. The same data is also available in JSON format (`data/resume.json`) for future integrations.

## 🗺️ Project Roadmap

This portfolio is part of a multi-phase modernization project:

- **Phase 1 (Current)**: Complete Next.js migration with modern UI ✅
- **Phase 2**: Enhanced project pages with detailed case studies
- **Phase 3**: Contact form backend integration with email notifications
- **Phase 4**: Blog integration with MDX support
- **Phase 5**: RAG-powered AI chatbot for resume Q&A

See [Epic #2](https://github.com/sky021/Portfolio/issues/2) for the complete roadmap.

## 📝 License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## 🤝 Connect

- **Email:** agrawal.akash@asu.edu
- **LinkedIn:** [linkedin.com/in/akashagrawal021](https://linkedin.com/in/akashagrawal021)
- **GitHub:** [github.com/sky021](https://github.com/sky021)
- **Location:** Tempe, AZ

---

**Built with ❤️ using Next.js & Tailwind CSS**
