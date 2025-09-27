// Mock Firebase for testing - bypasses all Firebase Auth issues

// Simple memory storage - no external dependencies
const createAsyncStorage = () => {
  console.log('Using memory storage for mock Firebase');
  const memoryStorage = {
    storage: {},
    async getItem(key) {
      return this.storage[key] || null;
    },
    async setItem(key, value) {
      this.storage[key] = value;
    },
    async removeItem(key) {
      delete this.storage[key];
    }
  };
  return memoryStorage;
};

const asyncStorage = createAsyncStorage();
console.log('Mock Firebase services initialized with storage backend');

// Mock user data storage
let mockUsers = new Map();
let mockFriendRequests = new Map(); // userId -> array of friend requests
let mockNotifications = new Map(); // userId -> array of notifications
let mockChats = new Map(); // chatId -> array of messages
let mockLastMessages = new Map(); // chatId -> last message info
let currentUser = null;
let authListeners = [];

// Initialize mock users from asyncStorage
const initializeMockData = async () => {
  try {
    const storedUsers = await asyncStorage.getItem('mockUsers');
    if (storedUsers) {
      const usersArray = JSON.parse(storedUsers);
      mockUsers = new Map(usersArray);
      console.log('Loaded', mockUsers.size, 'users from storage');
    }

    const storedFriendRequests = await asyncStorage.getItem('mockFriendRequests');
    if (storedFriendRequests) {
      const requestsArray = JSON.parse(storedFriendRequests);
      mockFriendRequests = new Map(requestsArray);
      console.log('Loaded friend requests from storage');
    }

    const storedNotifications = await asyncStorage.getItem('mockNotifications');
    if (storedNotifications) {
      const notificationsArray = JSON.parse(storedNotifications);
      mockNotifications = new Map(notificationsArray);
      console.log('Loaded notifications from storage');
    }

    const storedChats = await asyncStorage.getItem('mockChats');
    if (storedChats) {
      const chatsArray = JSON.parse(storedChats);
      mockChats = new Map(chatsArray);
      console.log('Loaded chats from storage');
    }

    const storedLastMessages = await asyncStorage.getItem('mockLastMessages');
    if (storedLastMessages) {
      const lastMessagesArray = JSON.parse(storedLastMessages);
      mockLastMessages = new Map(lastMessagesArray);
      console.log('Loaded last messages from storage');
    }
  } catch (err) {
    console.log('Error loading mock data:', err);
  }
};

// Save mock users to asyncStorage
const saveMockUsers = async () => {
  try {
    const usersArray = Array.from(mockUsers.entries());
    await asyncStorage.setItem('mockUsers', JSON.stringify(usersArray));
    console.log('Saved', mockUsers.size, 'users to storage');
  } catch (err) {
    console.log('Error saving mock users:', err);
  }
};

// Save friend requests to asyncStorage
const saveFriendRequests = async () => {
  try {
    const requestsArray = Array.from(mockFriendRequests.entries());
    await asyncStorage.setItem('mockFriendRequests', JSON.stringify(requestsArray));
    console.log('Saved friend requests to storage');
  } catch (err) {
    console.log('Error saving friend requests:', err);
  }
};

// Save notifications to asyncStorage
const saveNotifications = async () => {
  try {
    const notificationsArray = Array.from(mockNotifications.entries());
    await asyncStorage.setItem('mockNotifications', JSON.stringify(notificationsArray));
    console.log('Saved notifications to storage');
  } catch (err) {
    console.log('Error saving notifications:', err);
  }
};

// Save chats to asyncStorage
const saveChats = async () => {
  try {
    const chatsArray = Array.from(mockChats.entries());
    await asyncStorage.setItem('mockChats', JSON.stringify(chatsArray));
    console.log('Saved chats to storage');
  } catch (err) {
    console.log('Error saving chats:', err);
  }
};

// Save last messages to asyncStorage
const saveLastMessages = async () => {
  try {
    const lastMessagesArray = Array.from(mockLastMessages.entries());
    await asyncStorage.setItem('mockLastMessages', JSON.stringify(lastMessagesArray));
    console.log('Saved last messages to storage');
  } catch (err) {
    console.log('Error saving last messages:', err);
  }
};

// Notify all auth state change listeners
const notifyAuthListeners = (user) => {
  console.log('Notifying', authListeners.length, 'auth listeners, user:', user ? user.uid : 'null');
  authListeners.forEach(callback => {
    try {
      callback(user);
    } catch (err) {
      console.log('Error in auth listener:', err);
    }
  });
};

// Mock Auth Service
export const mockAuth = {
  currentUser: null,
  
  async signInWithEmailAndPassword(email, password) {
    console.log('Mock login attempt:', email);
    
    // Ensure mock data is loaded
    await initializeMockData();
    
    // Extract username from fake email
    const username = email.replace('@chatapp.local', '');
    
    // Check if user exists
    if (!mockUsers.has(username)) {
      throw new Error('User not found. Please register first.');
    }
    
    const userData = mockUsers.get(username);
    if (userData.password !== password) {
      throw new Error('Invalid password');
    }
    
    // Set current user
    currentUser = {
      uid: userData.uid,
      email: email,
      displayName: username
    };
    
    this.currentUser = currentUser;
    
    // Store in asyncStorage
    await asyncStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Notify auth listeners
    notifyAuthListeners(currentUser);
    
    console.log('Mock login successful:', username);
    return { user: currentUser };
  },
  
  async createUserWithEmailAndPassword(email, password) {
    console.log('Mock registration attempt:', email);
    
    // Ensure mock data is loaded
    await initializeMockData();
    
    const username = email.replace('@chatapp.local', '');
    
    // Check if user already exists
    if (mockUsers.has(username)) {
      throw new Error('User already exists');
    }
    
    // Create new user
    const newUser = {
      uid: `user_${Date.now()}`,
      username: username,
      password: password,
      usercode: Math.floor(100000 + Math.random() * 900000).toString(),
      displayName: username,
      photoURL: null,
      friends: [],
      createdAt: new Date()
    };
    
    mockUsers.set(username, newUser);
    await saveMockUsers(); // Persist to storage
    
    // Set as current user
    currentUser = {
      uid: newUser.uid,
      email: email,
      displayName: username
    };
    
    this.currentUser = currentUser;
    
    // Store in asyncStorage
    await asyncStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Notify auth listeners
    notifyAuthListeners(currentUser);
    
    console.log('Mock registration successful:', username);
    return { user: currentUser };
  },
  
  async signOut() {
    console.log('Mock logout');
    currentUser = null;
    this.currentUser = null;
    await asyncStorage.removeItem('currentUser');
    
    // Notify auth listeners
    notifyAuthListeners(null);
  },
  
  onAuthStateChanged(callback) {
    console.log('Setting up mock auth state listener');
    
    // Add to listeners array
    authListeners.push(callback);
    
    // Check for stored user immediately
    asyncStorage.getItem('currentUser').then(stored => {
      if (stored) {
        currentUser = JSON.parse(stored);
        this.currentUser = currentUser;
        callback(currentUser);
      } else {
        callback(null);
      }
    });
    
    // Return unsubscribe function
    return () => {
      console.log('Mock auth listener unsubscribed');
      const index = authListeners.indexOf(callback);
      if (index > -1) {
        authListeners.splice(index, 1);
      }
    };
  },
  
  // Debug function to clear all data
  async clearAllData() {
    console.log('Clearing all mock data...');
    mockUsers.clear();
    mockFriendRequests.clear();
    mockNotifications.clear();
    mockChats.clear();
    mockLastMessages.clear();
    currentUser = null;
    this.currentUser = null;
    await asyncStorage.multiRemove(['mockUsers', 'currentUser', 'mockFriendRequests', 'mockNotifications', 'mockChats', 'mockLastMessages']);
    console.log('All mock data cleared');
  },

  // Get last message for a chat
  async getLastMessage(chatId) {
    await initializeMockData();
    return mockLastMessages.get(chatId) || null;
  }
};

// Mock Database Service
export const mockDb = {
  collection(path) {
    return {
      doc(id) {
        return {
          async set(data) {
            console.log('Mock doc set:', path, id, data);
            
            if (path === 'users') {
              // Ensure mock data is loaded
              await initializeMockData();
              
              // Update user data in mockUsers
              for (let [username, userData] of mockUsers.entries()) {
                if (userData.uid === id) {
                  mockUsers.set(username, { ...userData, ...data });
                  await saveMockUsers();
                  break;
                }
              }
            }
            return Promise.resolve();
          },
          async get() {
            console.log('Mock doc get:', path, id);
            
            if (path === 'users') {
              // Ensure mock data is loaded
              await initializeMockData();
              
              // Find user by uid
              for (let [username, userData] of mockUsers.entries()) {
                if (userData.uid === id) {
                  return userData;
                }
              }
            }
            
            // Return null if not found
            return null;
          },
          async delete() {
            console.log('Mock doc delete:', path, id);
            
            if (path.includes('chats/') && path.includes('/messages')) {
              // Handle message deletion: chats/{chatId}/messages/{messageId}
              const pathParts = path.split('/');
              const chatId = pathParts[1];
              const messageId = id;
              
              await initializeMockData();
              
              if (mockChats.has(chatId)) {
                const messages = mockChats.get(chatId);
                const filteredMessages = messages.filter(msg => msg.id !== messageId);
                mockChats.set(chatId, filteredMessages);
                await saveChats();
                
                // Update last message if we deleted the last one
                if (filteredMessages.length > 0) {
                  const lastMessage = filteredMessages[filteredMessages.length - 1];
                  mockLastMessages.set(chatId, {
                    text: lastMessage.text,
                    timestamp: lastMessage.createdAt,
                    senderId: lastMessage.senderId,
                    senderName: lastMessage.senderName
                  });
                } else {
                  mockLastMessages.delete(chatId);
                }
                await saveLastMessages();
              }
            }
            
            return Promise.resolve();
          },
          collection(subPath) {
            // Handle subcollections like users/{userId}/friendRequests
            return {
              async add(data) {
                console.log('Mock subcollection add:', path, id, subPath, data);
                await initializeMockData();
                
                if (path === 'users' && subPath === 'friendRequests') {
                  // Add friend request
                  const requestId = `request_${Date.now()}`;
                  const requestData = { id: requestId, ...data };
                  
                  if (!mockFriendRequests.has(id)) {
                    mockFriendRequests.set(id, []);
                  }
                  mockFriendRequests.get(id).push(requestData);
                  await saveFriendRequests();
                  
                  return { id: requestId };
                } else if (path === 'users' && subPath === 'notifications') {
                  // Add notification
                  const notificationId = `notification_${Date.now()}`;
                  const notificationData = { id: notificationId, ...data };
                  
                  if (!mockNotifications.has(id)) {
                    mockNotifications.set(id, []);
                  }
                  mockNotifications.get(id).push(notificationData);
                  await saveNotifications();
                  
                  return { id: notificationId };
                }
                
                return { id: `mock_${Date.now()}` };
              },
              async get() {
                console.log('Mock subcollection get:', path, id, subPath);
                await initializeMockData();
                
                if (path === 'users' && subPath === 'friendRequests') {
                  return mockFriendRequests.get(id) || [];
                } else if (path === 'users' && subPath === 'notifications') {
                  return mockNotifications.get(id) || [];
                }
                
                return [];
              },
              onSnapshot(callback) {
                console.log('Mock subcollection listener:', path, id, subPath);
                
                // Return current data immediately
                setTimeout(async () => {
                  await initializeMockData();
                  let data = [];
                  
                  if (path === 'users' && subPath === 'friendRequests') {
                    data = mockFriendRequests.get(id) || [];
                  } else if (path === 'users' && subPath === 'notifications') {
                    data = mockNotifications.get(id) || [];
                  }
                  
                  const mockSnapshot = {
                    forEach: (fn) => {
                      data.forEach(item => {
                        fn({
                          id: item.id,
                          data: () => item
                        });
                      });
                    }
                  };
                  
                  callback(mockSnapshot);
                }, 100);
                
                // Return unsubscribe function
                return () => {
                  console.log('Mock subcollection listener unsubscribed');
                };
              }
            };
          }
        };
      },
      where(field, op, value) {
        return {
          async get() {
            console.log('Mock query:', path, field, op, value);
            
            if (path === 'users') {
              // Ensure mock data is loaded
              await initializeMockData();
              
              const results = [];
              for (let [username, userData] of mockUsers.entries()) {
                if (op === '==' && userData[field] === value) {
                  results.push(userData);
                }
              }
              return results;
            }
            
            return [];
          }
        };
      },
      async get() {
        console.log('Mock collection get:', path);
        
        if (path === 'users') {
          // Ensure mock data is loaded
          await initializeMockData();
          
          // Return all users as an array
          const allUsers = [];
          for (let [username, userData] of mockUsers.entries()) {
            allUsers.push({ id: userData.uid, ...userData });
          }
          return allUsers;
        } else if (path.startsWith('chats/') && path.includes('/messages')) {
          // Handle chat messages: chats/{chatId}/messages
          const chatId = path.split('/')[1];
          await initializeMockData();
          
          const messages = mockChats.get(chatId) || [];
          return messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        }
        
        return [];
      },
      async add(data) {
        console.log('Mock collection add:', path, data);
        
        if (path.startsWith('chats/') && path.includes('/messages')) {
          // Handle adding message to chat: chats/{chatId}/messages
          const chatId = path.split('/')[1];
          await initializeMockData();
          
          const messageId = `msg_${Date.now()}`;
          const messageData = { 
            id: messageId, 
            ...data,
            createdAt: data.createdAt || new Date()
          };
          
          if (!mockChats.has(chatId)) {
            mockChats.set(chatId, []);
          }
          mockChats.get(chatId).push(messageData);
          await saveChats();
          
          // Update last message for chat
          mockLastMessages.set(chatId, {
            text: messageData.text,
            timestamp: messageData.createdAt,
            senderId: messageData.senderId,
            senderName: messageData.senderName
          });
          await saveLastMessages();
          
          return { id: messageId };
        }
        
        return Promise.resolve({ id: `mock_${Date.now()}` });
      },
      onSnapshot(callback) {
        console.log('Mock collection listener:', path);
        
        if (path.startsWith('chats/') && path.includes('/messages')) {
          // Handle chat messages listener: chats/{chatId}/messages
          const chatId = path.split('/')[1];
          
          const sendData = async () => {
            await initializeMockData();
            const messages = mockChats.get(chatId) || [];
            const sortedMessages = messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            
            const mockSnapshot = {
              forEach: (fn) => {
                sortedMessages.forEach(message => {
                  fn({
                    id: message.id,
                    data: () => message
                  });
                });
              }
            };
            
            callback(mockSnapshot);
          };
          
          // Send initial data
          setTimeout(sendData, 100);
          
          // Store callback for future updates (simplified)
          const intervalId = setInterval(sendData, 1000);
          
          // Return unsubscribe
          return () => {
            console.log('Mock collection listener unsubscribed');
            clearInterval(intervalId);
          };
        }
        
        // Default behavior
        setTimeout(() => {
          callback({
            forEach: () => {}
          });
        }, 100);
        
        // Return unsubscribe
        return () => {
          console.log('Mock collection listener unsubscribed');
        };
      }
    };
  },

  // Friend request management functions
  async addFriendRequest(fromUserId, toUserId, fromUsername) {
    await initializeMockData();
    try {
      const userRequests = mockFriendRequests.get(toUserId) || [];
      const requestExists = userRequests.some(req => req.fromUid === fromUserId);
      
      if (!requestExists) {
        const newRequest = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          fromUid: fromUserId,
          fromUsername: fromUsername,
          timestamp: new Date().toISOString()
        };
        
        userRequests.push(newRequest);
        mockFriendRequests.set(toUserId, userRequests);
        await asyncStorage.setItem('mockFriendRequests', JSON.stringify([...mockFriendRequests]));
        console.log('Friend request added successfully:', newRequest);
        return newRequest;
      }
      return null;
    } catch (error) {
      console.error('Error adding friend request:', error);
      throw error;
    }
  },

  async removeFriendRequest(userId, requestId) {
    await initializeMockData();
    try {
      const userRequests = mockFriendRequests.get(userId) || [];
      const updatedRequests = userRequests.filter(req => req.id !== requestId);
      mockFriendRequests.set(userId, updatedRequests);
      await asyncStorage.setItem('mockFriendRequests', JSON.stringify([...mockFriendRequests]));
      console.log('Friend request removed successfully');
      return true;
    } catch (error) {
      console.error('Error removing friend request:', error);
      throw error;
    }
  },

  async getFriendRequests(userId) {
    await initializeMockData();
    try {
      return mockFriendRequests.get(userId) || [];
    } catch (error) {
      console.error('Error getting friend requests:', error);
      return [];
    }
  }
};

// Mock Storage Service
export const mockStorage = {
  ref(path) {
    return {
      async putString(data) {
        console.log('Mock storage upload:', path);
        return Promise.resolve();
      },
      async getDownloadURL() {
        console.log('Mock storage download URL:', path);
        return 'https://via.placeholder.com/150/0000FF/808080?text=Mock+Image';
      }
    };
  }
};

// Initialize mock data when module loads
initializeMockData();

// Export mock services as if they were real Firebase
export const auth = mockAuth;
export const db = mockDb;
export const storage = mockStorage;

console.log('Mock Firebase services initialized');
export default { auth: mockAuth, db: mockDb, storage: mockStorage };
