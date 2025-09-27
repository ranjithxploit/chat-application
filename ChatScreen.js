// ChatScreen.js - Enhanced with real messaging functionality
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, 
  StyleSheet, Alert, KeyboardAvoidingView, Platform, Modal, Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { auth, db } from './firebase';
import { useTheme } from './ThemeContext';

export default function ChatScreen({ route, navigation }) {
  const { friendId, friendName } = route.params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const flatListRef = useRef(null);
  const unsubscribeRef = useRef(null);
  
  const theme = useTheme();
  
  const currentUid = auth.currentUser?.uid;
  
  // Generate consistent chat ID for both users
  const getChatId = (uid1, uid2) => {
    return [uid1, uid2].sort().join('_');
  };
  
  const chatId = getChatId(currentUid, friendId);

  useEffect(() => {
    navigation.setOptions({ 
      title: friendName || 'Chat',
      headerTitleStyle: {
        fontSize: 18,
        fontWeight: 'bold'
      }
    });

    loadMessages();
    
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [friendId]);

  const loadMessages = async () => {
    try {
      console.log('Loading messages for chat:', chatId);
      
      // Set up real-time listener for messages
      unsubscribeRef.current = db
        .collection(`chats/${chatId}/messages`)
        .onSnapshot((snapshot) => {
          const messagesList = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            messagesList.push({ 
              id: doc.id, 
              ...data,
              createdAt: data.createdAt || new Date()
            });
          });
          
          console.log('Loaded', messagesList.length, 'messages');
          setMessages(messagesList);
          setLoading(false);
          
          // Auto-scroll to bottom when new messages arrive
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        });
        
    } catch (err) {
      console.log('Error loading messages:', err);
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!text.trim() || sending) return;
    
    const messageText = text.trim();
    setText(''); // Clear input immediately for better UX
    setSending(true);
    
    try {
      await db.collection(`chats/${chatId}/messages`).add({
        text: messageText,
        senderId: currentUid,
        senderName: auth.currentUser?.displayName || 'You',
        createdAt: new Date(),
        type: 'text'
      });
      
      console.log('Message sent successfully');
    } catch (err) {
      console.log('Send error:', err);
      Alert.alert('Error', 'Failed to send message');
      setText(messageText); // Restore text on error
    } finally {
      setSending(false);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await db.collection(`chats/${chatId}/messages`).doc(messageId).delete();
      setShowDeleteModal(false);
      setSelectedMessage(null);
      console.log('Message deleted successfully');
    } catch (err) {
      console.log('Delete error:', err);
      Alert.alert('Error', 'Failed to delete message');
    }
  };

  const handleLongPress = (message) => {
    if (message.senderId === currentUid) {
      setSelectedMessage(message);
      setShowDeleteModal(true);
    }
  };

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please grant camera roll permissions to send images');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await sendImageMessage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const sendImageMessage = async (imageUri) => {
    try {
      setSending(true);
      
      const messageData = {
        type: 'image',
        imageUri: imageUri,
        senderId: currentUid,
        senderName: auth.currentUser?.displayName || 'You',
        createdAt: new Date(),
      };

      await db.collection(`chats/${chatId}/messages`).add(messageData);
      console.log('Image message sent successfully');
    } catch (error) {
      console.error('Error sending image:', error);
      Alert.alert('Error', 'Failed to send image');
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item, index }) => {
    const isMyMessage = item.senderId === currentUid;
    const showTimestamp = index === 0 || 
      (messages[index - 1] && 
       new Date(item.createdAt).getTime() - new Date(messages[index - 1].createdAt).getTime() > 300000); // 5 minutes
    
    return (
      <View>
        {showTimestamp && (
          <View style={styles.timestampContainer}>
            <Text style={[styles.timestamp, { color: theme.colors.timestamp }]}>
              {new Date(item.createdAt).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        )}
        <TouchableOpacity
          onLongPress={() => handleLongPress(item)}
          delayLongPress={500}
          activeOpacity={isMyMessage ? 0.7 : 1}
        >
          <View style={[
            styles.messageContainer,
            {
              backgroundColor: isMyMessage ? theme.colors.myMessageBackground : theme.colors.messageBackground,
              alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
            }
          ]}>
            {item.type === 'image' ? (
              <View style={styles.imageMessageContainer}>
                <Image 
                  source={{ uri: item.imageUri }} 
                  style={styles.messageImage}
                  resizeMode="cover"
                />
                <Text style={[
                  styles.messageTime,
                  {
                    color: isMyMessage ? 'rgba(255,255,255,0.7)' : theme.colors.timestamp,
                    alignSelf: 'flex-end',
                    marginTop: 5,
                  }
                ]}>
                  {new Date(item.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            ) : (
              <>
                <Text style={[
                  styles.messageText,
                  {
                    color: isMyMessage ? '#ffffff' : theme.colors.text,
                  }
                ]}>
                  {item.text}
                </Text>
                <Text style={[
                  styles.messageTime,
                  {
                    color: isMyMessage ? 'rgba(255,255,255,0.7)' : theme.colors.timestamp,
                    alignSelf: 'flex-end',
                  }
                ]}>
                  {new Date(item.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>Start a conversation</Text>
      <Text style={styles.emptySubtitle}>
        Send a message to {friendName} to get started!
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={[
            styles.messagesContent,
            messages.length === 0 && styles.emptyContentContainer
          ]}
          ListEmptyComponent={renderEmptyState}
          onContentSizeChange={() => {
            if (messages.length > 0) {
              flatListRef.current?.scrollToEnd({ animated: false });
            }
          }}
        />
        
        <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
          <TouchableOpacity 
            style={[styles.imageButton, { backgroundColor: theme.colors.inputBackground }]}
            onPress={pickImage}
            disabled={sending}
          >
            <Ionicons name="image" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <TextInput
            style={[styles.textInput, { 
              backgroundColor: theme.colors.inputBackground, 
              borderColor: theme.colors.border,
              color: theme.colors.text
            }]}
            value={text}
            onChangeText={setText}
            placeholder={`Message ${friendName}...`}
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            maxLength={1000}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
            blurOnSubmit={false}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              { backgroundColor: (!text.trim() || sending) ? '#ccc' : theme.colors.primary }
            ]}
            onPress={sendMessage}
            disabled={!text.trim() || sending}
          >
            {sending ? (
              <Ionicons name="hourglass" size={20} color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {/* Delete Message Modal */}
        <Modal
          visible={showDeleteModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Delete Message</Text>
              <Text style={[styles.modalMessage, { color: theme.colors.textSecondary }]}>
                Are you sure you want to delete this message?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowDeleteModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.deleteButton]}
                  onPress={() => deleteMessage(selectedMessage?.id)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  emptyContentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  timestampContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 2,
    padding: 12,
    borderRadius: 18,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  myMessageTime: {
    color: 'rgba(255,255,255,0.7)',
    alignSelf: 'flex-end',
  },
  otherMessageTime: {
    color: '#999',
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: 16,
    marginRight: 10,
    backgroundColor: '#f8f9fa',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    margin: 20,
    minWidth: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    minWidth: 80,
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  imageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  imageMessageContainer: {
    maxWidth: 250,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
});