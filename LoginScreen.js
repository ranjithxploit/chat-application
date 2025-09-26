import React, {useState} from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

export default function LoginScreen({navigation}){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if(!username || !password){ Alert.alert('fill fields'); return; }
    try{
      const fakeEmail = `${username}@chatapp.local`;
      await signInWithEmailAndPassword(auth, fakeEmail, password);
    }catch(err){
      console.log(err);
      Alert.alert('Login failed', err.message || String(err));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <TextInput placeholder="username" value={username} onChangeText={setUsername} style={styles.input} />
      <TextInput placeholder="password" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
      <TouchableOpacity onPress={handleLogin} style={styles.btn}>
        <Text style={styles.btnText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={()=>navigation.navigate('Register')} style={{marginTop:12}}>
        <Text>Create new account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,alignItems:'center',justifyContent:'center',padding:20},
  title:{fontSize:22,marginBottom:20},
  input:{width:'100%',padding:12,borderWidth:1,borderRadius:8,marginVertical:8},
  btn:{backgroundColor:'#10b981',padding:12,borderRadius:8,width:'100%',alignItems:'center'},
  btnText:{color:'#fff',fontWeight:'700'}
});
