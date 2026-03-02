import * as Icons from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Parse from '../lib/parse';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

type Mode = 'login' | 'signup';

export default function LoginScreen() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Wait!', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await Parse.User.logIn(email.toLowerCase().trim(), password);
      router.replace('/weather');
    } catch (err: any) {
      Alert.alert('Login Failed', err.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert('Wait!', 'Please enter your email and password.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const user = new Parse.User();
      user.set('username', email.toLowerCase().trim());
      user.set('email', email.toLowerCase().trim());
      user.set('password', password);
      await user.signUp();
      router.replace('/weather');
    } catch (err: any) {
      Alert.alert('Sign Up Failed', err.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Reset Password', 'Enter your email address above first, then tap Forgot Password.');
      return;
    }
    setLoading(true);
    try {
      await Parse.User.requestPasswordReset(email.toLowerCase().trim());
      Alert.alert('Email Sent', 'Check your inbox for a password reset link.');
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const submit = mode === 'login' ? handleLogin : handleSignup;

  return (
    <SafeAreaProvider>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.inner}
          >
            <View style={styles.headerArea}>
              <Icons.MaterialCommunityIcons name="weather-partly-cloudy" size={80} color="rgba(255,255,255,0.9)" />
              <Text style={styles.title}>MyWeather</Text>
              <Text style={styles.subtitle}>
                {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
              </Text>
            </View>

            {/* Mode toggle */}
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, mode === 'login' && styles.toggleActive]}
                onPress={() => setMode('login')}
              >
                <Text style={[styles.toggleText, mode === 'login' && styles.toggleTextActive]}>LOGIN</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, mode === 'signup' && styles.toggleActive]}
                onPress={() => setMode('signup')}
              >
                <Text style={[styles.toggleText, mode === 'signup' && styles.toggleTextActive]}>SIGN UP</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={styles.inputWrapper}>
                <Icons.MaterialCommunityIcons name="email-outline" size={20} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  onChangeText={setEmail}
                  value={email}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Icons.MaterialCommunityIcons name="lock-outline" size={20} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  secureTextEntry
                  onChangeText={setPassword}
                  value={password}
                />
              </View>

              <TouchableOpacity style={styles.button} onPress={submit} disabled={loading}>
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.buttonText}>{mode === 'login' ? 'LOGIN' : 'CREATE ACCOUNT'}</Text>
                }
              </TouchableOpacity>

              {mode === 'login' && (
                <TouchableOpacity style={styles.forgotBtn} onPress={handleForgotPassword} disabled={loading}>
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>
              )}
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    marginTop: 10,
    letterSpacing: 1
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    marginTop: 5,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 24,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#3b82f6',
  },
  toggleText: {
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 1.5,
  },
  toggleTextActive: {
    color: '#fff',
  },
  form: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 65,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 2
  },
  forgotBtn: {
    alignItems: 'center',
    marginTop: 20,
  },
  forgotText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    fontWeight: '600',
  }
});
