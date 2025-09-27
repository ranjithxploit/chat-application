# Chat App - React Native with Firebase

A full-featured real-time chat application built with React Native and Expo, featuring authentication, friend requests, messaging, image sharing, and dark/light theme support.

## 🚀 Features

### Authentication
- ✅ User Registration & Login
- ✅ Unique User Codes for easy friend discovery
- ✅ Persistent authentication state
- ✅ Secure password handling

### Social Features
- ✅ Friend request system (send, accept, reject)
- ✅ User search by username or user code
- ✅ Friends list with online status
- ✅ Profile management with display name updates

### Messaging
- ✅ Real-time text messaging
- ✅ Image sharing with gallery picker
- ✅ Message deletion (sender only)
- ✅ Last message previews in friends list
- ✅ Message timestamps and read receipts
- ✅ Chat notifications

### User Experience
- ✅ Light/Dark theme toggle
- ✅ Responsive keyboard handling
- ✅ Smooth animations and transitions
- ✅ Cross-platform compatibility (iOS/Android)
- ✅ Offline data persistence

## 🛠️ Tech Stack

- **Frontend**: React Native with Expo SDK ~54.0.10
- **Navigation**: React Navigation v7
- **State Management**: React Hooks & Context API
- **Storage**: AsyncStorage for offline persistence
- **Image Handling**: Expo ImagePicker
- **Styling**: React Native StyleSheet with theme system
- **Backend**: Firebase (Firestore, Auth, Storage)

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/ranjithxploit/chat-application.git
   cd chat-application
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   
   **Option A: Mock Firebase (Development)**
   - No additional setup required
   - Uses local AsyncStorage for data persistence
   - Perfect for development and testing

   **Option B: Real Firebase (Production)**
   ```bash
   # Copy the template file
   cp firebase.template.js firebase.js
   ```
   
   Then edit `firebase.js` with your Firebase configuration:
   ```javascript
   // Uncomment and configure your Firebase settings
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id"
   };
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app for physical device

## 📱 Usage

### Getting Started
1. **Register**: Create a new account with username and password
2. **Login**: Sign in with your credentials
3. **Add Friends**: Search by username or user code, send friend requests
4. **Start Chatting**: Accept friend requests and start messaging
5. **Customize**: Toggle between light/dark themes in Profile settings

### Key Features Usage

**Sending Friend Requests**
- Search for users by username or 6-digit user code
- Tap "Add Friend" to send request
- View sent/received requests in the home screen

**Messaging**
- Tap on any friend to open chat
- Type messages or tap 📷 to send images
- Long-press your messages to delete them
- Messages sync in real-time

**Profile Management**
- Update display name
- View your user code for sharing
- Toggle light/dark theme
- See friends count

## 🏗️ Project Structure

```
chat-application/
├── App.js                 # Main app component with navigation
├── LoginScreen.js         # Authentication screens
├── RegisterScreen.js      
├── HomeScreen.js          # Friends list and search
├── ChatScreen.js          # Real-time messaging
├── ProfileScreen.js       # User profile and settings
├── ThemeContext.js        # Theme management (light/dark)
├── firebase.mock.js       # Mock Firebase for development
├── firebase.template.js   # Firebase configuration template
├── assets/               # App icons and images
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## 🎨 Customization

### Themes
The app supports light and dark themes. Colors are centrally managed in `ThemeContext.js`:

```javascript
const lightColors = {
  background: '#f5f5f5',
  surface: '#ffffff',
  primary: '#007AFF',
  text: '#000000',
  // ... more colors
};

const darkColors = {
  background: '#000000',
  surface: '#1c1c1e', 
  primary: '#0A84FF',
  text: '#ffffff',
  // ... more colors
};
```

### Styling
Each screen uses theme-aware styling:

```javascript
const theme = useTheme();

<View style={[styles.container, { backgroundColor: theme.colors.background }]}>
  <Text style={[styles.text, { color: theme.colors.text }]}>
    Hello World
  </Text>
</View>
```

## 🔧 Development

### Mock vs Real Firebase

**Mock Firebase (Default)**
- Uses local AsyncStorage for data persistence
- No internet connection required
- Perfect for development and testing
- All features work offline

**Real Firebase**
- Requires Firebase project setup
- Real-time synchronization across devices
- Cloud storage for images
- Production-ready scaling

### Adding New Features

1. **New Screen**: Create in root directory, add to navigation
2. **New Component**: Add to components folder (create if needed)
3. **Theme Support**: Use `useTheme()` hook for consistent styling
4. **Database Operations**: Add to `firebase.mock.js` or configure real Firebase

## 🚀 Deployment

### Building for Production

**iOS**
```bash
npx expo build:ios
```

**Android**
```bash
npx expo build:android
```

**Web** (if supported)
```bash
npx expo build:web
```

### Environment Setup
- Configure Firebase for production environment
- Update app.json with proper app identifiers
- Test on real devices before publishing

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, email your-email@example.com or create an issue on GitHub.

## 🎯 Roadmap

- [ ] Voice messages
- [ ] Video calls
- [ ] Group chats
- [ ] Message reactions
- [ ] Push notifications
- [ ] File sharing
- [ ] User status (online/offline)
- [ ] Message encryption

---

**Made with ❤️ using React Native and Expo**