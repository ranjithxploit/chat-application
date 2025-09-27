// HomeScreen.js - Simplified version with mock data
import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, 
  StyleSheet, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from './firebase';
import { signOut } from 'firebase/auth';
import { useTheme } from './ThemeContext';

export default function HomeScreen({ navigation, user }) {
  const theme = useTheme();
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [lastMessages, setLastMessages] = useState({});
  
  useEffect(() => {
    loadCurrentUser();
    loadFriendRequests();
    loadLastMessages();
  }, []);

  const loadLastMessages = async () => {
    try {
      if (!user?.uid) return;
      
      const userData = await db.collection('users').doc(user.uid).get();
      const friendIds = userData?.friends || [];
      
      const messages = {};
      for (const friendId of friendIds) {
        const lastMessage = await db.getLastMessage(user.uid, friendId);
        if (lastMessage) {
          messages[friendId] = lastMessage;
        }
      }
      
      setLastMessages(messages);
    } catch (err) {
      console.log('Error loading last messages:', err);
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - messageDate) / (1000 * 60));
      return diffInMinutes < 1 ? 'now' : `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return diffInDays === 1 ? '1d' : `${diffInDays}d`;
    }
  };

  const loadFriendRequests = async () => {
    try {
      const requests = await db.getFriendRequests(user.uid);
      setFriendRequests(requests);
    } catch (err) {
      console.log('Error loading friend requests:', err);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const userData = await db.collection('users').doc(user.uid).get();
      if (userData) {
        setCurrentUser({ id: user.uid, ...userData });
        await loadFriendsData(userData.friends || []);
      }
    } catch (err) {
      console.log('Error loading user:', err);
    }
  };

  const loadFriendsData = async (friendIds) => {
    try {
      if (friendIds.length === 0) {
        setFriends([]);
        return;
      }

      const allUsers = await db.collection('users').get();
      const friendsData = allUsers.filter(userData => 
        friendIds.includes(userData.id)
      );
      
      setFriends(friendsData);
    } catch (err) {
      console.log('Error loading friends data:', err);
      setFriends([]);
    }
  };

  const searchUsers = async () => {
    if (!searchText.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      // Search by username or usercode
      const allUsers = await db.collection('users').get();
      const results = allUsers.filter(userData => {
        return (
          userData.id !== user.uid &&
          (userData.username?.toLowerCase().includes(searchText.toLowerCase()) ||
           userData.usercode === searchText)
        );
      });

      setSearchResults(results);
    } catch (err) {
      console.log('Search error:', err);
      Alert.alert('Error', 'Failed to search users');
    }
  };

  const sendFriendRequest = async (targetUserId, targetUsername) => {
    try {
      // Check if already friends
      if (currentUser.friends && currentUser.friends.includes(targetUserId)) {
        Alert.alert('Info', 'Already friends with this user');
        return;
      }

      // Add friend request using the proper database method
      await db.addFriendRequest(
        user.uid, 
        targetUserId, 
        currentUser.username || currentUser.displayName
      );

      // Add notification to target user
      await db.collection('users').doc(targetUserId).collection('notifications').add({
        type: 'friend_request',
        text: `${currentUser.username || currentUser.displayName} sent you a friend request`,
        fromUid: user.uid,
        createdAt: new Date()
      });

      Alert.alert('Success', `Friend request sent to ${targetUsername}!`);
    } catch (err) {
      console.log('Friend request error:', err);
      Alert.alert('Error', 'Failed to send friend request');
    }
  };

  const startChat = (friendData) => {
    navigation.navigate('Chat', { 
      friendId: friendData.id, 
      friendName: friendData.username || friendData.displayName 
    });
  };

  const acceptFriendRequest = async (request) => {
    try {
      // Add to current user's friends
      const updatedFriends = [...(currentUser.friends || []), request.fromUid];
      await db.collection('users').doc(user.uid).set({
        ...currentUser,
        friends: updatedFriends
      });

      // Add current user to requester's friends
      const requesterData = await db.collection('users').doc(request.fromUid).get();
      if (requesterData) {
        const requesterFriends = [...(requesterData.friends || []), user.uid];
        await db.collection('users').doc(request.fromUid).set({
          ...requesterData,
          friends: requesterFriends
        });
      }

      // Remove the friend request from database
      await db.removeFriendRequest(user.uid, request.id);

      // Update local state
      const updatedRequests = friendRequests.filter(req => req.id !== request.id);
      setFriendRequests(updatedRequests);

      // Update current user state
      setCurrentUser(prev => ({ ...prev, friends: updatedFriends }));
      
      // Reload friends data
      await loadFriendsData(updatedFriends);
      
      Alert.alert('Success', `You are now friends with ${request.fromUsername}!`);
    } catch (err) {
      console.log('Error accepting friend request:', err);
      Alert.alert('Error', 'Failed to accept friend request');
    }
  };

  const rejectFriendRequest = async (request) => {
    try {
      // Remove the friend request from database
      await db.removeFriendRequest(user.uid, request.id);
      
      // Update local state
      const updatedRequests = friendRequests.filter(req => req.id !== request.id);
      setFriendRequests(updatedRequests);
      
      Alert.alert('Rejected', `Friend request from ${request.fromUsername} rejected`);
    } catch (err) {
      console.log('Error rejecting friend request:', err);
      Alert.alert('Error', 'Failed to reject friend request');
    }
  };

  const renderSearchResult = ({ item }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.usercode}>Code: {item.usercode}</Text>
      </View>
      <TouchableOpacity 
        style={styles.addBtn}
        onPress={() => sendFriendRequest(item.id, item.username)}
      >
        <Text style={styles.addBtnText}>Add Friend</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFriend = ({ item }) => {
    const lastMessage = lastMessages[item.id];
    const hasNewMessage = lastMessage && !lastMessage.read;
    
    return (
      <TouchableOpacity 
        style={[styles.friendItem, { 
          backgroundColor: theme.colors.surface, 
          borderBottomColor: theme.colors.border 
        }]}
        onPress={() => startChat(item)}
      >
        <View style={styles.friendInfo}>
          <View style={styles.friendHeader}>
            <Text style={[styles.friendName, { color: theme.colors.text }]}>
              {item.username || item.displayName}
            </Text>
            {hasNewMessage && (
              <View style={styles.unreadBadge}>
                <Ionicons name="ellipse" size={8} color={theme.colors.primary} />
              </View>
            )}
          </View>
          <Text 
            style={[
              styles.lastMessage, 
              { color: theme.colors.textSecondary },
              hasNewMessage && { fontWeight: '600', color: theme.colors.text }
            ]}
            numberOfLines={1}
          >
            {lastMessage ? lastMessage.text : 'Tap to start chatting'}
          </Text>
          {lastMessage && (
            <Text style={[styles.messageTime, { color: theme.colors.textSecondary }]}>
              {formatMessageTime(lastMessage.timestamp)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderFriendRequest = ({ item }) => (
    <View style={styles.requestItem}>
      <View style={styles.requestInfo}>
        <Text style={styles.requestUsername}>{item.fromUsername}</Text>
        <Text style={styles.requestText}>wants to be your friend</Text>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity 
          style={styles.acceptBtn}
          onPress={() => acceptFriendRequest(item)}
        >
          <Text style={styles.acceptBtnText}>✓</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.rejectBtn}
          onPress={() => rejectFriendRequest(item)}
        >
          <Text style={styles.rejectBtnText}>✗</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { 
        backgroundColor: theme.colors.surface, 
        borderBottomColor: theme.colors.border 
      }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Chat App</Text>
        <TouchableOpacity 
          style={[styles.profileBtn, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.profileBtnText}>Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.searchSection, { backgroundColor: theme.colors.surface }]}>
        <TextInput
          style={[styles.searchInput, { 
            backgroundColor: theme.colors.inputBackground,
            borderColor: theme.colors.border,
            color: theme.colors.text
          }]}
          placeholder="Search by username or user code"
          placeholderTextColor={theme.colors.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={searchUsers}
        />
        <TouchableOpacity style={[styles.searchBtn, { backgroundColor: theme.colors.primary }]} onPress={searchUsers}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      {searchResults.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Search Results</Text>
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={(item) => item.id}
            style={styles.list}
          />
        </View>
      )}

      {friendRequests.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Friend Requests ({friendRequests.length})</Text>
          <FlatList
            data={friendRequests}
            renderItem={renderFriendRequest}
            keyExtractor={(item) => item.id}
            style={styles.list}
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Friends ({friends.length})</Text>
        {friends.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No friends yet. Search and add some!</Text>
        ) : (
          <FlatList
            data={friends}
            renderItem={renderFriend}
            keyExtractor={(item) => item.id || item}
            style={styles.list}
          />
        )}
      </View>

      <TouchableOpacity 
        style={styles.logoutBtn}
        onPress={() => {
          signOut(auth);
          Alert.alert('Logged out', 'You have been logged out');
        }}
      >
        <Text style={styles.logoutBtnText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#3b82f6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 6,
  },
  profileBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  searchSection: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginRight: 10,
  },
  searchBtn: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  usercode: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: '#10b981',
    padding: 8,
    borderRadius: 6,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  friendItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  list: {
    maxHeight: 200,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
  logoutBtn: {
    backgroundColor: '#ef4444',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  requestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  requestInfo: {
    flex: 1,
  },
  requestUsername: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  requestText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptBtn: {
    backgroundColor: '#10b981',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  rejectBtn: {
    backgroundColor: '#ef4444',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  friendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  unreadBadge: {
    marginLeft: 8,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 2,
  },
});