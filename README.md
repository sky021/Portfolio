# Portfolio Website

A modern, responsive portfolio website built with HTML, CSS (SASS), and JavaScript. This open-source project showcases a professional portfolio with sections for About, Skills, Experience, Projects, and Contact information.

## 🌟 Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Clean and professional interface with smooth animations
- **SASS Architecture**: Well-organized, modular CSS using SASS preprocessor
- **Easy Customization**: Simple structure makes it easy to personalize
- **Contact Form Integration**: Ready for EmailJS integration
- **Project Showcase**: Dedicated section to display your work with images and descriptions
- **Professional Timeline**: Display your experience and education chronologically

## 📋 Table of Contents

- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Customization Guide](#customization-guide)
- [Build System](#build-system)
- [Deployment](#deployment)
- [License](#license)

## 🔧 How It Works

This portfolio website is a static site that uses:

1. **HTML** for structure - The main content is in `index.html`
2. **SASS/CSS** for styling - Modular SASS files compiled into `css/style.css`
3. **JavaScript** for interactivity - Mobile menu toggle and form handling in `index.js`
4. **Node.js build tools** - For compiling SASS to CSS and adding vendor prefixes

### Architecture Overview

The website follows a component-based architecture:

```
┌─────────────────────────────────────┐
│         index.html (Main)           │
├─────────────────────────────────────┤
│  Header (Navigation)                │
│  Hero (Home Section)                │
│  About Section                      │
│  Skills Section                     │
│  Experience Timeline                │
│  Projects Showcase                  │
│  Contact Form                       │
│  Footer                             │
└─────────────────────────────────────┘
        ↓              ↓
   style.css      index.js
   (Compiled)   (Interactions)
```

## 📁 Project Structure

```
Portfolio/
├── index.html              # Main HTML file
├── index.js               # JavaScript for interactivity
├── package.json           # Node.js dependencies and scripts
├── package-lock.json      # Locked dependency versions
├── README.md              # This file
├── LICENSE                # GPL-3.0 License
├── .gitignore            # Git ignore rules
│
├── css/                   # Compiled CSS
│   ├── style.css         # Main compiled stylesheet
│   ├── about.jpg         # Background image for about section
│   └── cloudBackground.jpg # Background image
│
├── images/                # Image assets
│   ├── Photo.jpeg        # Profile photo
│   ├── symbol.png        # Logo/symbol
│   ├── FaceRec.jpeg      # Project screenshot
│   └── FeedsPersonalization.jpg # Project screenshot
│
├── assets/                # Additional assets (if any)
│
└── sass/                  # SASS source files
    ├── main.scss         # Main SASS entry point
    │
    ├── abstracts/        # SASS variables, mixins, utilities
    │   ├── _variables.scss
    │   ├── _mixins.scss
    │   └── _utilities.scss
    │
    ├── base/             # Base styles and resets
    │   └── _base.scss
    │
    ├── components/       # Reusable component styles
    │   ├── _header.scss
    │   ├── _footer.scss
    │   ├── _skills.scss
    │   └── _mouse-scroll.scss
    │
    └── pages/            # Page-specific styles
        ├── _home.scss
        └── _project-case-study.scss
```

## 🛠️ Technologies Used

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with Flexbox and Grid
- **JavaScript (ES6+)**: Vanilla JS for interactivity
- **SASS**: CSS preprocessor for better organization

### Build Tools
- **node-sass**: Compiles SASS to CSS
- **postcss-cli**: Post-processes CSS
- **autoprefixer**: Adds vendor prefixes automatically
- **npm-run-all**: Runs multiple npm scripts

### External Libraries
- **Font Awesome 6.5.0**: Icon library for social media and UI icons
- **EmailJS** (optional): For contact form email functionality

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sky021/Portfolio.git
   cd Portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Open in browser**
   Simply open `index.html` in your web browser to view the portfolio.

### Development Workflow

1. **Watch SASS files** (auto-compile on changes)
   ```bash
   npm run compile:scss
   ```
   This watches `sass/` directory and auto-compiles to `css/style.css`

2. **Make your changes**
   - Edit HTML in `index.html`
   - Edit styles in `sass/` files
   - Edit JavaScript in `index.js`

3. **Build for production**
   ```bash
   npm run build
   ```
   This adds vendor prefixes and compresses the CSS

## 🎨 Customization Guide

### Personal Information

Edit `index.html` and replace:

1. **Profile Information**
   - Line 6: Page title
   - Line 7: Meta description
   - Line 56: Name
   - Line 57: Professional title
   - Line 58: Resume link

2. **Social Links**
   - Lines 60-61: LinkedIn and GitHub URLs

3. **About Section**
   - Lines 70-72: Your bio and background

4. **Skills**
   - Lines 81-104: Add/remove/modify skills

5. **Experience**
   - Lines 166-199: Update your work history and education

6. **Projects**
   - Lines 212-275: Showcase your projects with images and descriptions

7. **Contact Info**
   - Lines 332-347: Update address, phone, and email

### Styling Customization

1. **Colors & Variables**
   Edit `sass/abstracts/_variables.scss` to change:
   - Primary/secondary colors
   - Font families
   - Spacing units
   - Breakpoints

2. **Component Styles**
   - Header: `sass/components/_header.scss`
   - Footer: `sass/components/_footer.scss`
   - Skills: `sass/components/_skills.scss`

3. **Page Styles**
   - Home page: `sass/pages/_home.scss`
   - Project pages: `sass/pages/_project-case-study.scss`

After making SASS changes, recompile:
```bash
npm run compile:scss
```

### Adding EmailJS Integration

To enable the contact form:

1. Sign up at [EmailJS](https://www.emailjs.com/)
2. Create an email service and template
3. Edit `index.js`:
   - Line 65: Replace `'YOUR_PUBLIC_KEY'` with your EmailJS public key
   - Line 68: Replace `'YOUR_SERVICE_ID'` and `'YOUR_TEMPLATE_ID'`

### Images

Replace images in the `images/` directory:
- `Photo.jpeg`: Your profile photo
- `symbol.png`: Your logo/brand symbol
- `FaceRec.jpeg`, `FeedsPersonalization.jpg`: Project screenshots

Update image references in `index.html` accordingly.

## 🏗️ Build System

The project uses npm scripts for building:

### Available Scripts

```bash
# Watch and compile SASS (development)
npm run compile:scss

# Add vendor prefixes to CSS
npm run prefix:css

# Compress CSS for production
npm run compress:css

# Build for production (prefix + compress)
npm run build
```

### Build Process

1. **SASS Compilation**: `sass/main.scss` → `css/style.css`
   - Imports all partial files (`_*.scss`)
   - Compiles to standard CSS

2. **Autoprefixing**: Adds vendor prefixes for browser compatibility
   - Targets last 10 versions of major browsers
   - Ensures cross-browser compatibility

3. **Compression**: Minifies CSS for production
   - Removes whitespace and comments
   - Reduces file size for faster loading

## 🌐 Deployment

This is a static website and can be deployed to various platforms:

### GitHub Pages
1. Push to GitHub
2. Go to repository Settings → Pages
3. Select branch to deploy
4. Your site will be at `https://<username>.github.io/<repo-name>`

### Netlify
1. Connect your GitHub repository
2. Build command: `npm run build`
3. Publish directory: `/`

### Vercel
1. Import your GitHub repository
2. Build command: `npm run build`
3. Output directory: `/`

### Traditional Hosting
Upload these files to your web server:
- `index.html`
- `css/` directory
- `images/` directory
- `index.js`
- Any other assets

## 📝 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 👤 Author

**Akash Agrawal**
- LinkedIn: [@akashagrawal021](https://linkedin.com/in/akashagrawal021)
- GitHub: [@sky021](https://github.com/sky021)

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!
