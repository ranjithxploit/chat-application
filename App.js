// App.js
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, ActivityIndicator } from 'react-native';
import { ThemeProvider } from './ThemeContext';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import HomeScreen from './HomeScreen';
import ChatScreen from './ChatScreen';
import ProfileScreen from './ProfileScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    console.log('Setting up mock auth listener...');
    
    const { auth } = require('./firebase');
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Mock auth state changed:', user ? user.uid : 'No user');
      setUser(user);
      setInitializing(false);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  if (initializing || !authReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{ marginTop: 10, fontSize: 16 }}>Initializing ChatApp...</Text>
      </View>
    );
  }

  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {user ? (
            <>
              <Stack.Screen name="Home" options={{title:'Chats'}} >
                {props => <HomeScreen {...props} user={user} />}
              </Stack.Screen>
              <Stack.Screen name="Chat" component={ChatScreen} />
              <Stack.Screen name="Profile">
                {props => <ProfileScreen {...props} user={user} />}
              </Stack.Screen>
            </>
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
