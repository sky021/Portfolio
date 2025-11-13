# Contributing to Portfolio Website

Thank you for your interest in contributing to this portfolio website project! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone. Please:

- Be respectful and considerate in your communication
- Welcome newcomers and help them get started
- Accept constructive criticism gracefully
- Focus on what is best for the community and project

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Portfolio.git
   cd Portfolio
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## How to Contribute

There are many ways to contribute:

### Reporting Bugs

If you find a bug, please open an issue with:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior vs actual behavior
- Screenshots (if applicable)
- Browser and OS information

### Suggesting Enhancements

Have an idea for improvement? Open an issue with:
- A clear description of the enhancement
- Why it would be useful
- Example implementation (if possible)

### Code Contributions

Areas where contributions are welcome:
- Bug fixes
- UI/UX improvements
- Responsive design enhancements
- Performance optimizations
- Accessibility improvements
- Documentation improvements
- New features (discuss in an issue first)

## Development Workflow

### Setting Up Your Development Environment

1. Ensure you have Node.js (v14+) and npm installed
2. Install dependencies: `npm install`
3. Start SASS watcher: `npm run compile:scss`

### Making Changes

1. **HTML Changes**: Edit `index.html`
   - Maintain semantic HTML structure
   - Ensure accessibility (use proper ARIA labels)
   - Test on different screen sizes

2. **Style Changes**: Edit files in `sass/` directory
   - Follow the existing SASS architecture
   - Use variables from `sass/abstracts/_variables.scss`
   - Run `npm run compile:scss` to compile
   - Don't edit `css/style.css` directly

3. **JavaScript Changes**: Edit `index.js`
   - Use vanilla JavaScript (no frameworks)
   - Ensure browser compatibility
   - Add comments for complex logic

### Testing Your Changes

Before submitting:

1. **Visual Testing**
   - Open `index.html` in multiple browsers (Chrome, Firefox, Safari)
   - Test on different screen sizes (mobile, tablet, desktop)
   - Verify all links work
   - Check that images load correctly

2. **Code Quality**
   - Validate HTML: Use [W3C Validator](https://validator.w3.org/)
   - Validate CSS: Use [CSS Validator](https://jigsaw.w3.org/css-validator/)
   - Check JavaScript: Use browser console for errors

3. **Performance**
   - Build for production: `npm run build`
   - Check file sizes (CSS should be minified)
   - Ensure images are optimized

## Coding Standards

### HTML
- Use semantic HTML5 elements
- Maintain proper indentation (2 spaces)
- Use descriptive class names
- Add alt text to all images
- Ensure proper heading hierarchy (h1, h2, h3...)

### CSS/SASS
- Follow the existing SASS architecture
- Use BEM naming convention where appropriate
- Mobile-first responsive design
- Use variables for colors, fonts, and spacing
- Keep specificity low
- Add comments for complex selectors

Example:
```scss
// Component: Project Card
.project-card {
  display: flex;
  margin: $spacing-large 0;
  
  &__image {
    flex: 0 0 40%;
  }
  
  &__content {
    flex: 1;
    padding: $spacing-medium;
  }
}
```

### JavaScript
- Use ES6+ features
- Use meaningful variable names
- Add comments for complex logic
- Handle errors gracefully
- Avoid global variables
- Use event delegation when appropriate

Example:
```javascript
// Good
const menuIcon = document.querySelector('.menu-icon');
const handleMenuToggle = () => {
  navList.classList.toggle('active');
};

// Avoid
var a = document.querySelector('.menu-icon');
a.onclick = function() { ... }
```

## Commit Guidelines

### Commit Message Format

Follow the conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no code change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(contact): add EmailJS integration for contact form

docs: update README with build instructions

fix(mobile): resolve navigation menu toggle issue on iOS

style(sass): reorganize component styles for better maintainability
```

### Commit Best Practices

- Make small, focused commits
- Write clear, descriptive commit messages
- Commit related changes together
- Don't commit commented-out code
- Don't commit temporary files or build artifacts

## Pull Request Process

### Before Submitting

1. ✅ Test your changes thoroughly
2. ✅ Update documentation if needed
3. ✅ Run the build: `npm run build`
4. ✅ Ensure no console errors
5. ✅ Write clear commit messages
6. ✅ Rebase on latest main branch

### Submitting a Pull Request

1. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a Pull Request** on GitHub with:
   - Clear title describing the change
   - Description of what changed and why
   - Screenshots (for UI changes)
   - Reference to related issues (if any)

3. **Pull Request Template:**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation update
   - [ ] Code refactoring
   
   ## Testing Done
   - Tested on Chrome, Firefox, Safari
   - Tested on mobile, tablet, desktop
   - Verified responsive design
   
   ## Screenshots (if applicable)
   [Add screenshots here]
   
   ## Related Issues
   Fixes #(issue number)
   ```

### Review Process

- Maintainers will review your PR
- Address any feedback or requested changes
- Once approved, your PR will be merged
- Your contribution will be acknowledged

## Questions?

If you have questions:
- Open an issue for discussion
- Check existing issues for answers
- Reach out to maintainers

## Recognition

All contributors will be recognized in the project. Thank you for helping improve this portfolio website! 🎉
