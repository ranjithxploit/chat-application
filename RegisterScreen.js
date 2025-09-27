import React, {useState} from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';

const genUsercode = () => {
  const size = Math.random() > 0.5 ? 6 : 7;
  let code = '';
  for(let i=0;i<size;i++) code += Math.floor(Math.random()*10);
  return code;
};
export default function RegisterScreen({navigation}){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const checkUsernameUnique = async (usernameVal) => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', usernameVal));
    const users = await getDocs(q);
    return users.empty;
  };
  const createUniqueUsercode = async () => {
    for(let i=0;i<8;i++){
      const code = genUsercode();
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('usercode', '==', code));
      const users = await getDocs(q);
      if(users.empty) return code;
    }
    return String(Date.now()).slice(-8);
  };

  const handleRegister = async () => {
    if(!username || !password){ Alert.alert('fill fields'); return; }
    try{
      const ok = await checkUsernameUnique(username);
      if(!ok){ Alert.alert('username taken'); return; }
      const fakeEmail = `${username}@chatapp.local`;
      const userCred = await createUserWithEmailAndPassword(auth, fakeEmail, password);
      const uid = userCred.user.uid;

      const usercode = await createUniqueUsercode();

      await setDoc(doc(db, 'users', uid), {
        username,
        usercode,
        displayName: username,
        photoURL: null,
        friends: [],
        createdAt: new Date()
      });

      Alert.alert('Success!', 'Account created successfully!');
    }catch(err){
      console.log(err);
      Alert.alert('Error', err.message || String(err));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>
      <TextInput placeholder="username" value={username} onChangeText={setUsername} style={styles.input} />
      <TextInput placeholder="password" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
      <TouchableOpacity onPress={handleRegister} style={styles.btn}>
        <Text style={styles.btnText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={()=>navigation.navigate('Login')} style={{marginTop:12}}>
        <Text>Already have account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,alignItems:'center',justifyContent:'center',padding:20},
  title:{fontSize:22,marginBottom:20},
  input:{width:'100%',padding:12,borderWidth:1,borderRadius:8,marginVertical:8},
  btn:{backgroundColor:'#3b82f6',padding:12,borderRadius:8,width:'100%',alignItems:'center'},
  btnText:{color:'#fff',fontWeight:'700'}
});
