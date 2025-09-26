// HomeScreen.js
import React, {useEffect, useState} from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, StyleSheet, Alert } from 'react-native';
import { collection, query, where, getDocs, doc, setDoc, addDoc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';

// helper to build chat id
const makeChatId = (a,b) => (a < b ? `${a}_${b}` : `${b}_${a}`);

export default function HomeScreen({navigation, user}){
  const uid = user.uid;
  const [queryText, setQueryText] = useState('');
  const [results, setResults] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // listen notifications
    const notifRef = collection(db, 'users', uid, 'notifications');
    const unsub = onSnapshot(notifRef, snap => {
      const arr = [];
      snap.forEach(d => arr.push({id: d.id, ...d.data()}));
      setNotifications(arr.sort((a,b)=> b.createdAt?.toDate?.()-a.createdAt?.toDate?.()));
    });
    return unsub;
  }, []);

  const handleSearch = async () => {
    if(!queryText) return;
    // search by username or usercode
    const usersRef = collection(db, 'users');
    let q;
    if(/^\d+$/.test(queryText)) {
      q = query(usersRef, where('usercode','==', queryText));
    } else {
      q = query(usersRef, where('username','==', queryText));
    }
    const snap = await getDocs(q);
    const res = [];
    snap.forEach(d => {
      res.push({id: d.id, ...d.data()});
    });
    // remove self
    setResults(res.filter(r => r.id !== uid));
  };

  const sendFriendRequest = async (target) => {
    try{
      // add a friendRequest doc to target's friendRequests
      await addDoc(collection(db, 'users', target.id, 'friendRequests'), {
        fromUid: uid,
        fromUsername: (await (await getDoc(doc(db,'users',uid))).data()).username,
        status: 'pending',
        createdAt: new Date()
      });
      // also add a notification
      await addDoc(collection(db, 'users', target.id, 'notifications'), {
        type: 'friend_request',
        text: `${(await (await getDoc(doc(db,'users',uid))).data()).username} sent you a friend request`,
        data: {fromUid: uid},
        read: false,
        createdAt: new Date()
      });
      Alert.alert('request sent');
    }catch(err){
      console.log(err); Alert.alert('error', err.message || String(err));
    }
  };

  const openChat = (other) => {
    const chatId = makeChatId(uid, other.id);
    navigation.navigate('Chat', { chatId, other });
  };

  return (
    <View style={{flex:1,padding:12}}>
      <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
        <Text style={{fontSize:18,fontWeight:'700'}}>Hello hacker 👾</Text>
        <View style={{flexDirection:'row',gap:10}}>
          <TouchableOpacity onPress={()=>navigation.navigate('Profile')} style={{marginRight:8}}>
            <Text>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>signOut(auth)}>
            <Text style={{color:'red'}}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{marginTop:12}}>
        <TextInput placeholder="search by username or usercode" value={queryText} onChangeText={setQueryText} style={styles.input} />
        <TouchableOpacity onPress={handleSearch} style={styles.btn}>
          <Text style={{color:'#fff'}}>Search</Text>
        </TouchableOpacity>
      </View>

      <FlatList data={results} keyExtractor={item=>item.id} renderItem={({item}) => (
        <View style={styles.userRow}>
          <Image source={ item.photoURL ? {uri:item.photoURL} : require('./assets/placeholder.png') } style={styles.avatar} />
          <View style={{flex:1,marginLeft:8}}>
            <Text style={{fontWeight:'700'}}>{item.username}</Text>
            <Text style={{color:'#666'}}>#{item.usercode}</Text>
          </View>
          <TouchableOpacity onPress={()=>sendFriendRequest(item)} style={styles.smallBtn}><Text>Send</Text></TouchableOpacity>
          <TouchableOpacity onPress={()=>openChat(item)} style={styles.smallBtn}><Text>Chat</Text></TouchableOpacity>
        </View>
      )} />

      <Text style={{marginTop:12,fontWeight:'700'}}>Notifications</Text>
      <FlatList data={notifications} keyExtractor={i=>i.id} renderItem={({item}) => (
        <View style={{padding:8,borderWidth:1,borderRadius:8,marginTop:6}}>
          <Text>{item.text}</Text>
        </View>
      )} />
    </View>
  );
}

import { getDoc } from 'firebase/firestore';

const styles = StyleSheet.create({
  input:{borderWidth:1,padding:10,borderRadius:8},
  btn:{backgroundColor:'#2563eb',padding:10,marginTop:8,borderRadius:8,alignItems:'center'},
  userRow:{flexDirection:'row',alignItems:'center',padding:8,borderBottomWidth:1},
  avatar:{width:48,height:48,borderRadius:24,backgroundColor:'#ddd'},
  smallBtn:{padding:8,borderWidth:1,borderRadius:8,marginLeft:8}
});
