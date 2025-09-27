import React, {useState} from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function LoginScreen({navigation}){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if(!username || !password){ Alert.alert('Please fill all fields'); return; }
    
    setLoading(true);
    try{
      console.log('Attempting Firebase login...');
      
      const { auth } = await import('./firebase');
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const fakeEmail = `${username}@chatapp.local`;
      
      await signInWithEmailAndPassword(auth, fakeEmail, password);
      console.log('Firebase login successful!');
    }catch(err){
      console.log('Login error:', err);
      Alert.alert('Login failed', err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <TextInput placeholder="username" value={username} onChangeText={setUsername} style={styles.input} />
      <TextInput placeholder="password" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
      <TouchableOpacity onPress={handleLogin} style={[styles.btn, loading && styles.btnDisabled]} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Logging in...' : 'Login'}</Text>
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
  btnDisabled:{backgroundColor:'#ccc'},
  btnText:{color:'#fff',fontWeight:'700'}
});
