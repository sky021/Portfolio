# Quick Setup Guide

This guide will help you get the portfolio website up and running quickly.

## Prerequisites

Before you begin, ensure you have:
- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- A code editor (VS Code, Sublime Text, etc.)
- A web browser

## Installation Steps

### 1. Get the Code

**Option A: Clone from GitHub**
```bash
git clone https://github.com/sky021/Portfolio.git
cd Portfolio
```

**Option B: Download ZIP**
- Download the ZIP file from GitHub
- Extract to your desired location
- Navigate to the folder in terminal

### 2. Install Dependencies

```bash
npm install
```

This installs the required packages for SASS compilation.

### 3. View the Website

Simply open `index.html` in your web browser:

**Option A: Double-click**
- Double-click `index.html` in your file explorer

**Option B: Via Command Line (macOS/Linux)**
```bash
open index.html
```

**Option C: Via Command Line (Windows)**
```bash
start index.html
```

**Option D: Using a Live Server**
If you have VS Code:
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

## Development Setup

If you want to modify styles:

### 1. Start SASS Compiler

This watches for changes and auto-compiles SASS to CSS:

```bash
npm run compile:scss
```

Keep this running in a terminal while you work.

### 2. Edit Files

- **HTML**: Edit `index.html`
- **Styles**: Edit files in `sass/` directory
- **JavaScript**: Edit `index.js`

### 3. View Changes

Refresh your browser to see changes (or use Live Server for auto-refresh).

## Customization Quick Start

### Change Personal Information

Edit `index.html`:
1. Search for "Akash Agrawal" and replace with your name
2. Update the professional title (line 57)
3. Change resume link (line 58)
4. Update social media links (lines 60-61)

### Change Colors

Edit `sass/abstracts/_variables.scss`:
```scss
$primary-color: #your-color;
$secondary-color: #your-color;
```

Then recompile:
```bash
npm run compile:scss
```

### Add Your Projects

In `index.html`, find the projects section (around line 212):
1. Duplicate a project card `<div class="project-card">...</div>`
2. Update the image, title, description, and link
3. Add technology tags

### Replace Images

1. Add your images to the `images/` folder
2. Update image references in `index.html`:
   - `images/Photo.jpeg` - Your profile photo
   - `images/symbol.png` - Your logo
   - Project screenshots

## Building for Production

When ready to deploy:

```bash
npm run build
```

This will:
- Add vendor prefixes to CSS
- Minify CSS for better performance

## Deployment

### GitHub Pages (Easiest)

1. Create a GitHub repository
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
3. Go to repository Settings → Pages
4. Select main branch
5. Your site will be live at `https://YOUR_USERNAME.github.io/YOUR_REPO`

### Netlify

1. Create account at [Netlify](https://www.netlify.com/)
2. Drag and drop your project folder
3. Your site is live!

### Other Hosting

Upload these files/folders to your web host:
- `index.html`
- `index.js`
- `css/` folder
- `images/` folder
- `assets/` folder (if any)

## Troubleshooting

### SASS won't compile

**Problem**: `npm run compile:scss` fails

**Solutions**:
1. Delete `node_modules/` and `package-lock.json`
2. Run `npm install` again
3. If still failing, the CSS is already compiled in `css/style.css` and you can edit it directly

### Images not showing

**Problem**: Images don't display

**Solutions**:
1. Check file paths in `index.html`
2. Ensure images are in the `images/` folder
3. Check image file names match exactly (case-sensitive)

### Contact form not working

**Problem**: Form submission doesn't work

**Solution**: 
The contact form requires EmailJS setup:
1. Sign up at [EmailJS](https://www.emailjs.com/)
2. Create an email service
3. Update `index.js` with your credentials (lines 65, 68)

### Mobile menu not working

**Problem**: Hamburger menu doesn't open

**Solutions**:
1. Check browser console for JavaScript errors
2. Ensure `index.js` is loaded (check `<script>` tag at end of HTML)
3. Verify the menu icon class matches (`.menu-icon`)

## Next Steps

1. ✅ Customize personal information
2. ✅ Add your own projects
3. ✅ Replace placeholder images
4. ✅ Update colors to match your brand
5. ✅ Test on different devices
6. ✅ Deploy your portfolio!

## Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Review [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
- Open an issue on GitHub if you encounter problems

Happy building! 🚀
