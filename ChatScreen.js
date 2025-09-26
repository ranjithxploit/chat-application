import React, {useState, useEffect, useRef} from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { db, storage } from './firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Audio } from 'expo-av';

export default function ChatScreen({route}){
  const { chatId, other } = route.params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt','asc'));
    const unsub = onSnapshot(q, snap => {
      const arr = [];
      snap.forEach(d => arr.push({id: d.id, ...d.data()}));
      setMessages(arr);
    });
    return unsub;
  }, [chatId]);

  const sendText = async () => {
    if(!text) return;
    setSending(true);
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      type: 'text',
      text,
      from: route.params.currentUid || 'unknown',
      createdAt: serverTimestamp()
    });
    setText('');
    setSending(false);
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({allowsRecordingIOS: true, playsInSilentModeIOS: true});
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await rec.startAsync();
      setRecording(rec);
    } catch (err) {
      console.error('failed to start recording', err);
    }
  };

  const stopAndUpload = async () => {
    if(!recording) return;
    try{
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      const blob = await (await fetch(uri)).blob();
      const storageRef = ref(storage, `audio/${chatId}_${Date.now()}.m4a`);
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);
      await addDoc(collection(db,'chats',chatId,'messages'), {
        type: 'audio',
        audioURL: url,
        from: route.params.currentUid || 'unknown',
        createdAt: serverTimestamp()
      });
    }catch(err){ console.log(err); }
  };

  const renderItem = ({item}) => {
    if(item.type === 'text') return <View style={styles.msg}><Text>{item.text}</Text></View>;
    if(item.type === 'audio') return <AudioMessage url={item.audioURL} />;
    return null;
  };

  return (
    <View style={{flex:1,padding:12}}>
      <Text style={{fontSize:18,fontWeight:'700',marginBottom:12}}>{other.username}</Text>

      <FlatList data={messages} keyExtractor={m=>m.id} renderItem={renderItem} />

      <View style={{flexDirection:'row',alignItems:'center',marginTop:12}}>
        <TextInput value={text} onChangeText={setText} placeholder="type..." style={styles.input} />
        <TouchableOpacity onPress={sendText} style={styles.sendBtn}><Text>Send</Text></TouchableOpacity>
      </View>

      <View style={{flexDirection:'row',marginTop:8}}>
        {!recording ? (
          <TouchableOpacity onPress={startRecording} style={styles.recBtn}><Text>Record</Text></TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={stopAndUpload} style={styles.recBtn}><Text>Stop & Upload</Text></TouchableOpacity>
        )}
      </View>

      {sending && <ActivityIndicator />}
    </View>
  );
}

// small audio player component
function AudioMessage({url}){
  const [sound, setSound] = useState(null);
  const [loading, setLoading] = useState(false);

  const play = async () => {
    setLoading(true);
    try{
      const { sound: s } = await Audio.Sound.createAsync({ uri: url });
      setSound(s);
      await s.playAsync();
      s.setOnPlaybackStatusUpdate(status => {
        if(status.didJustFinish) { s.unloadAsync(); setSound(null); }
      });
    }catch(err){ console.log(err); }
    setLoading(false);
  };

  return (
    <TouchableOpacity onPress={play} style={{padding:8,borderWidth:1,borderRadius:8,marginVertical:6}}>
      <Text>{loading ? 'loading...' : 'Play voice message'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  input:{flex:1,borderWidth:1,padding:10,borderRadius:8},
  sendBtn:{padding:10,marginLeft:8,borderRadius:8,borderWidth:1},
  recBtn:{padding:12,borderRadius:8,borderWidth:1,marginRight:8},
  msg:{padding:8,borderWidth:1,borderRadius:8,marginVertical:6}
});
