// ThemeContext.js - Theme management for light/dark mode
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem('theme');
      if (storedTheme !== null) {
        setIsDarkMode(storedTheme === 'dark');
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const theme = {
    isDarkMode,
    colors: isDarkMode ? darkColors : lightColors,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

const lightColors = {
  background: '#f5f5f5',
  surface: '#ffffff',
  primary: '#007AFF',
  secondary: '#34C759',
  danger: '#FF3B30',
  text: '#000000',
  textSecondary: '#666666',
  border: '#e5e5e5',
  inputBackground: '#f8f9fa',
  messageBackground: '#ffffff',
  myMessageBackground: '#007AFF',
  timestamp: '#999999',
  searchBackground: '#ffffff',
  headerBackground: '#3b82f6',
  headerText: '#ffffff',
};

const darkColors = {
  background: '#000000',
  surface: '#1c1c1e',
  primary: '#0A84FF',
  secondary: '#32D74B',
  danger: '#FF453A',
  text: '#ffffff',
  textSecondary: '#8E8E93',
  border: '#38383a',
  inputBackground: '#2c2c2e',
  messageBackground: '#2c2c2e',
  myMessageBackground: '#0A84FF',
  timestamp: '#8E8E93',
  searchBackground: '#1c1c1e',
  headerBackground: '#1c1c1e',
  headerText: '#ffffff',
};