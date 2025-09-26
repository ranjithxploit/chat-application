// LoginScreen.js
import React, {useState} from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
// Local-only login (no Firebase) for now

export default function LoginScreen({navigation}){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if(!username || !password){ Alert.alert('fill fields'); return; }
    // create a local user object and navigate to Home
    const user = { uid: Date.now().toString(), username };
    navigation.replace('Home', { user });
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
