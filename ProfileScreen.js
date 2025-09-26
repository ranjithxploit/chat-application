// ProfileScreen.js
import React, {useState, useEffect} from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { db, storage, auth } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function ProfileScreen({user}){
  const uid = user.uid;
  const [profile, setProfile] = useState(null);

  useEffect(()=> {
    (async ()=>{
      const d = await getDoc(doc(db,'users',uid));
      setProfile(d.data());
    })();
  },[]);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if(!perm.granted){ Alert.alert('permission required'); return; }

    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality:0.7 });
    if(res.cancelled) return;
    const uri = res.uri;
    // upload blob
    try{
      const blob = await (await fetch(uri)).blob();
      const storageRef = ref(storage, `avatars/${uid}_${Date.now()}.jpg`);
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db,'users',uid), { photoURL: url });
      setProfile(p => ({...p, photoURL: url}));
      Alert.alert('updated');
    }catch(err){ console.log(err); Alert.alert('upload error'); }
  };

  if(!profile) return null;

  return (
    <View style={{flex:1,alignItems:'center',padding:20}}>
      <Image source={ profile.photoURL ? {uri:profile.photoURL} : require('./assets/placeholder.png') } style={{width:120,height:120,borderRadius:60}} />
      <Text style={{fontSize:20,fontWeight:'700',marginTop:12}}>{profile.displayName}</Text>
      <Text style={{color:'#666'}}>#{profile.usercode}</Text>

      <TouchableOpacity onPress={pickImage} style={{marginTop:20,padding:12,borderRadius:8,borderWidth:1}}>
        <Text>Change profile picture</Text>
      </TouchableOpacity>
    </View>
  );
}
