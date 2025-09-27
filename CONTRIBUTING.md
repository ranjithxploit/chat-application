# Contributing to Chat Application

Thank you for your interest in contributing to the Chat Application! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues
1. Check existing issues first to avoid duplicates
2. Use the issue template if available
3. Provide clear reproduction steps
4. Include screenshots for UI issues
5. Specify device/platform information

### Suggesting Features
1. Open an issue with the "feature request" label
2. Describe the feature and its benefits
3. Consider backwards compatibility
4. Provide mockups or examples if applicable

### Code Contributions

#### Getting Started
1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/chat-application.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Run setup: `npm run setup`
5. Start development server: `npm start`

#### Development Guidelines

**Code Style**
- Use TypeScript-style JSDoc comments for functions
- Follow React Native best practices
- Use meaningful variable and function names
- Keep components small and focused
- Use theme colors instead of hardcoded values

**File Organization**
- Components: One component per file
- Screens: Place in root directory
- Utils: Create utils folder if needed
- Assets: Use assets folder for images/icons
- Styles: Define styles at bottom of each file

**Theme Support**
- Always use `useTheme()` hook for colors
- Test both light and dark themes
- Ensure proper contrast ratios
- Use semantic color names

**Mock Firebase**
- Add new mock functions to `firebase.mock.js`
- Ensure data persistence with AsyncStorage
- Test offline functionality
- Maintain compatibility with real Firebase API

#### Testing
- Test on both iOS and Android
- Verify theme switching works
- Check offline functionality
- Test with different screen sizes
- Validate image picker permissions

#### Commit Guidelines
Use conventional commit format:
```
type(scope): description

feat(chat): add voice message support
fix(auth): resolve login persistence issue
docs(readme): update installation instructions
style(theme): improve dark mode colors
refactor(firebase): optimize mock data structure
test(chat): add message deletion tests
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style/formatting
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Build/tooling changes

#### Pull Request Process
1. Update documentation if needed
2. Add/update tests for new features
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Create pull request with clear description
6. Link related issues
7. Request review from maintainers

## 🏗️ Project Structure

```
chat-application/
├── App.js                 # Main navigation
├── *Screen.js            # Screen components
├── ThemeContext.js       # Theme management
├── firebase.mock.js      # Mock Firebase implementation
├── firebase.template.js  # Firebase config template
├── assets/              # Images and icons
├── docs/               # Additional documentation
└── README.md           # Main documentation
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 16+
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator

### Environment Setup
1. Copy `.env.example` to `.env`
2. Copy `firebase.template.js` to `firebase.js`
3. Configure settings as needed
4. Run `npm install`
5. Start with `npm start`

### Available Scripts
- `npm start` - Start development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run setup` - Initial project setup
- `npm run build:android` - Build Android APK
- `npm run build:ios` - Build iOS IPA

## 🎯 Feature Roadmap

### High Priority
- [ ] Push notifications
- [ ] Voice messages
- [ ] Group chats
- [ ] Message reactions

### Medium Priority
- [ ] Video calls
- [ ] File sharing
- [ ] User status indicators
- [ ] Message search

### Low Priority
- [ ] Message encryption
- [ ] Chat themes
- [ ] Custom stickers
- [ ] Bot integration

## 📋 Code Review Checklist

### Functionality
- [ ] Feature works as expected
- [ ] No breaking changes
- [ ] Backwards compatible
- [ ] Error handling implemented

### Code Quality
- [ ] Clean, readable code
- [ ] Proper error handling
- [ ] No console.log in production
- [ ] Performance optimized

### UI/UX
- [ ] Responsive design
- [ ] Theme support (light/dark)
- [ ] Accessibility considerations
- [ ] Consistent with app design

### Testing
- [ ] Manual testing completed
- [ ] Edge cases covered
- [ ] Multiple devices tested
- [ ] Offline functionality verified

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment**
   - OS version (iOS/Android)
   - Device model
   - App version
   - Expo SDK version

2. **Steps to Reproduce**
   - Clear, numbered steps
   - Expected behavior
   - Actual behavior
   - Screenshots/videos

3. **Additional Context**
   - Error messages
   - Console logs
   - Network conditions
   - Other relevant information

## 💬 Getting Help

- **Documentation**: Check README.md first
- **Issues**: Search existing GitHub issues
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our community Discord (if available)

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to make this chat app better! 🚀