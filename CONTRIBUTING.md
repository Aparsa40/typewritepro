# Contributing to TypeWriterPro

First off, thank you for considering contributing to TypeWriterPro! We appreciate your interest in making this project better.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

---

## Code of Conduct

This project and everyone participating in it are governed by our Code of Conduct. By participating, you are expected to uphold this code.

**Expected Behavior:**
- Use welcoming and inclusive language
- Be respectful of differing opinions and experiences
- Focus on what is best for the community
- Show empathy towards other community members

**Unacceptable Behavior:**
- Harassment or discrimination
- Insulting or derogatory comments
- Private attacks of any kind
- Publishing others' private information

---

## Getting Started

### Prerequisites

- Node.js 18+ (LTS)
- npm or yarn
- Git
- GitHub account

### Fork and Clone

1. **Fork the repository**
   - Go to https://github.com/Aparsa40/typewritepro
   - Click "Fork" in the top-right corner

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/typewritepro.git
   cd typewritepro
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/Aparsa40/typewritepro.git
   ```

---

## Development Setup

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

```bash
# Copy example configuration
cp .env.example .env

# Edit .env and add your configuration
# For local development, defaults should work
```

### Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5050`

### Run Type Checking

```bash
npm run check
```

---

## Making Changes

### Create a Feature Branch

Always create a new branch for your changes:

```bash
# Update from upstream
git fetch upstream
git checkout upstream/main

# Create feature branch
git checkout -b feature/your-feature-name
```

**Branch naming conventions:**
- `feature/` - New features (e.g., `feature/dark-mode-toggle`)
- `fix/` - Bug fixes (e.g., `fix/rtl-detection`)
- `docs/` - Documentation (e.g., `docs/api-guide`)
- `refactor/` - Code refactoring (e.g., `refactor/markdown-parser`)
- `test/` - Tests and coverage (e.g., `test/editor-integration`)

### File Structure Guidelines

When adding new features, follow the project structure:

```
client/src/
├── components/
│   ├── editor/          # Editor-related components
│   │   ├── dialogs/     # Dialog components
│   └── ui/              # Reusable UI components
├── lib/                 # Utilities and helpers
├── hooks/               # Custom React hooks
└── pages/               # Page components

server/
├── routes.ts            # API routes
├── storage.ts           # Data storage
└── app.ts               # Express setup
```

### Code Style

This project uses:
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **ESLint** for code quality (configured in repo)
- **Prettier** for formatting (optional but recommended)

#### TypeScript Guidelines

```typescript
// ✅ Good: Clear types
interface EditorSettings {
  fontSize: number;
  theme: 'light' | 'dark';
  autoDirection: boolean;
}

// ❌ Avoid: Any types
const settings: any = {};

// ✅ Good: Explicit returns
function renderMarkdown(content: string): string {
  return marked.parse(content);
}

// ❌ Avoid: Implicit return types
function renderMarkdown(content) {
  return marked.parse(content);
}
```

#### Component Guidelines

```tsx
// ✅ Good: Proper exports and types
interface MyComponentProps {
  title: string;
  onClick: () => void;
}

export function MyComponent({ title, onClick }: MyComponentProps) {
  return <button onClick={onClick}>{title}</button>;
}

// ✅ Good: Use hooks properly
function Editor() {
  const [content, setContent] = useState('');
  
  useEffect(() => {
    // Side effects here
  }, [content]);
  
  return <textarea value={content} onChange={(e) => setContent(e.target.value)} />;
}
```

#### Styling Guidelines

```tsx
// ✅ Good: Tailwind classes
<div className="p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-200">
  Content
</div>

// ❌ Avoid: Inline styles (unless necessary)
<div style={{ padding: '16px', backgroundColor: 'white' }}>
  Content
</div>
```

---

## Committing Changes

### Commit Message Format

Follow conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - A new feature
- `fix` - A bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, missing semicolons, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `chore` - Build process, dependencies, etc.

### Examples

```bash
# Feature commit
git commit -m "feat(editor): add RTL auto-detection for mixed content"

# Fix commit
git commit -m "fix(export): resolve PDF generation timeout issue"

# Documentation commit
git commit -m "docs(readme): update Google OAuth setup instructions"

# Refactor with longer description
git commit -m "refactor(markdown): simplify renderMarkdown function

- Removed unnecessary async/await
- Combined render and direction detection
- Improved performance for large documents"
```

---

## Submitting Changes

### Before You Submit

1. **Test your changes**
   ```bash
   npm run check     # Type checking
   npm run dev       # Manual testing
   ```

2. **Update documentation** if you changed:
   - Features or functionality
   - APIs or component interfaces
   - Configuration options

3. **Keep commits clean**
   ```bash
   # Before submitting, clean up your commits
   git rebase -i upstream/main
   ```

### Create a Pull Request

1. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create PR on GitHub**
   - Go to https://github.com/YOUR_USERNAME/typewritepro
   - Click "Compare & pull request"
   - Fill in the PR description using the template below

3. **PR Description Template**
   ```markdown
   ## Description
   Brief description of what this PR does.

   ## Type of Change
   - [ ] Bug fix (non-breaking)
   - [ ] New feature (non-breaking)
   - [ ] Breaking change
   - [ ] Documentation update

   ## Related Issues
   Fixes #123 (replace with actual issue number)

   ## Testing
   Describe how you tested this change:
   - [ ] Manual testing
   - [ ] Tested on Windows/Mac/Linux
   - [ ] Tested in light and dark modes

   ## Checklist
   - [ ] My code follows the code style guidelines
   - [ ] I have updated the documentation
   - [ ] I have added tests (if applicable)
   - [ ] All tests pass locally
   - [ ] No new warnings are introduced
   ```

---

## Coding Standards

### General

- Use meaningful variable and function names
- Keep functions small and focused (single responsibility)
- Add comments for complex logic
- Remove console.log statements before submitting

### TypeScript

- Enable strict mode
- No `any` types (use proper types)
- No `@ts-ignore` comments (fix the type issue instead)
- Use interfaces for object shapes

### React

- Use functional components (no class components)
- Hooks only in functional components
- Proper dependency arrays in useEffect
- Avoid prop drilling (use context if needed)

### Styling

- Use Tailwind CSS classes
- Follow the design guidelines in `design_guidelines.md`
- Ensure dark mode support
- Test responsive design

---

## Pull Request Review Process

After submitting:

1. **Automated checks run**
   - TypeScript compilation
   - Linting
   - Basic tests

2. **Code review**
   - Maintainers review your changes
   - Feedback provided
   - Iterate if needed

3. **Approval and merge**
   - Once approved, your PR will be merged
   - Your contribution is now part of TypeWriterPro! 🎉

---

## Areas for Contribution

### High Priority

- 🐛 **Bug Fixes** - Report and fix issues
- 📚 **Documentation** - Improve clarity and examples
- 🧪 **Tests** - Increase test coverage
- 🌍 **Localization** - Translate to other languages

### Medium Priority

- ♿ **Accessibility** - ARIA labels, keyboard navigation
- 📱 **Mobile Support** - Responsive design improvements
- 🎨 **Themes** - New color schemes

### Ideas for New Features

- [ ] Collaborative editing (WebSocket)
- [ ] Syntax highlighting for more languages
- [ ] Custom keyboard shortcuts
- [ ] Document templates
- [ ] Export to more formats (Docx, EPUB)
- [ ] Plugin system

---

## Questions?

- 📖 Check existing issues and discussions
- 💬 Start a new discussion for questions
- 📧 Contact maintainers if needed

---

## License

By contributing, you agree that your contributions will be licensed under the Proprietary License of TypeWriterPro. See `PROPRIETARY_LICENSE` for details.

---

**Thank you for contributing to TypeWriterPro! Your help makes this project better for everyone.** 🚀

---

*Last Updated: December 2024*
