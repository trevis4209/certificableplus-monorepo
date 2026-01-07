'use client';

import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_TEST_CREDENTIALS } from '@/lib/mock-auth-service';

const { width, height } = Dimensions.get('window');
const isLargeScreen = width > 768;

// Check if we're using mock auth
const USE_MOCK_AUTH = process.env.EXPO_PUBLIC_USE_MOCK_AUTH === 'true';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const passwordInputRef = useRef<TextInput>(null);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Errore', 'Inserisci email e password');
      return;
    }

    setLoading(true);
    try {
      // Use AuthContext login which handles both mock and real auth
      await login(email, password);

      // On success, navigate to main app
      router.replace('/(tabs)');
    } catch (error: any) {
      // Show user-friendly error message
      const errorMessage = error?.message || 'Si è verificato un errore durante il login';
      Alert.alert('Errore di Login', errorMessage);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter' && isLargeScreen) {
      handleLogin();
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Show test credentials banner for mock auth mode
  const TestCredentialsBanner = () => {
    if (!USE_MOCK_AUTH) return null;

    return (
      <View className="mb-6 w-full bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <View className="flex-row items-center mb-2">
          <Ionicons name="information-circle" size={20} color="#3B82F6" />
          <Text className="ml-2 text-blue-600 dark:text-blue-400 font-semibold">
            Modalità Test (Mock Auth)
          </Text>
        </View>
        <Text className="text-sm text-blue-600 dark:text-blue-400 mb-2">
          Password per tutti gli utenti: <Text className="font-bold">{MOCK_TEST_CREDENTIALS.password}</Text>
        </Text>
        <TouchableOpacity
          onPress={() => {
            setEmail(MOCK_TEST_CREDENTIALS.users[0].email);
            setPassword(MOCK_TEST_CREDENTIALS.password);
          }}
          className="mt-2 bg-blue-500 rounded-lg py-2 px-4"
        >
          <Text className="text-white text-center text-sm font-medium">
            Usa credenziali test: {MOCK_TEST_CREDENTIALS.users[0].email}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-white dark:bg-black"
      >
        <StatusBar style="auto" />
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, minHeight: '100%' }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={['#2A9D8F', Platform.OS === 'ios' ? '#FFFFFF' : '#FFFFFF']}
            className="items-center justify-center w-full"
            style={{ 
              paddingTop: isLargeScreen ? 120 : 130, 
              paddingBottom: isLargeScreen ? 50 : 60,
              height: height * 0.5
            }}
          >
            <View className="items-center">
              <Image
                source={require('@/assets/images/logo.png')}
                className="rounded-full h-56 w-56 overflow-hidden"
              />
              <Text 
                className="font-bold text-gray-900 mb-3 text-center"
                style={{ fontSize: isLargeScreen ? 52 : 44 }}
              >
                Benvenuto
              </Text>
              <Text 
                className="text-center text-gray-900 px-10"
                style={{ fontSize: isLargeScreen ? 20 : 17 }}
              >
                Accedi al tuo account business
              </Text>
            </View>
          </LinearGradient>

          <View className="flex-1 px-6 pt-8 bg-white dark:bg-black items-center">
            <View className="w-full" style={{ maxWidth: isLargeScreen ? 480 : '100%' }}>
              <TestCredentialsBanner />

              <View className="mb-1 w-full">
                <View className="flex-row items-center px-4 border border-[#DEE2E6] dark:border-[#343A40] rounded-xl bg-white dark:bg-[#1A1A1A]"
                  style={{ paddingVertical: isLargeScreen ? 14 : 12 }}
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={Colors.light.text}
                  />
                  <TextInput
                    className="flex-1 ml-3.5 text-[#1A1A1A] dark:text-[#F8F9FA]"
                    style={{ fontSize: isLargeScreen ? 20 : 18, padding: 3 }}
                    placeholder="Email"
                    placeholderTextColor={Colors.light.text}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onSubmitEditing={() => {
                      if (isLargeScreen) {
                        passwordInputRef.current?.focus();
                      }
                    }}
                  />
                </View>
              </View>

              <View className="mb-2 w-full">
                <View className="flex-row items-center px-4 border border-[#DEE2E6] dark:border-[#343A40] rounded-xl bg-white dark:bg-[#1A1A1A]"
                  style={{ paddingVertical: isLargeScreen ? 14 : 12 }}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={Colors.light.text}
                  />
                  <TextInput
                    ref={passwordInputRef}
                    className="flex-1 ml-3.5 text-[#1A1A1A] dark:text-[#F8F9FA]"
                    style={{ fontSize: isLargeScreen ? 20 : 18, padding: 3 }}
                    placeholder="Password"
                    placeholderTextColor={Colors.light.text}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    onKeyPress={handleKeyPress}
                    onSubmitEditing={handleLogin}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={Colors.light.text}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => router.push('/(auth)/forgot-password' as any)}
                className="items-end mt-2 mb-6 w-full"
              >
                <Text 
                  className="font-medium text-[#2A9D8F]"
                  style={{ fontSize: isLargeScreen ? 18 : 16 }}
                >
                  Password dimenticata?
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`items-center rounded-xl bg-[#2A9D8F] w-full mb-6 ${loading ? 'opacity-70' : ''}`}
                style={{ paddingVertical: isLargeScreen ? 18 : 16 }}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text
                  className="text-white font-semibold"
                  style={{ fontSize: isLargeScreen ? 19 : 17 }}
                >
                  {loading ? 'Accesso in corso...' : 'Accedi'}
                </Text>
              </TouchableOpacity>

              <View className="flex-row justify-center items-center mb-8 w-full">
                <Text 
                  className="text-[#6C757D] dark:text-[#ADB5BD]"
                  style={{ fontSize: isLargeScreen ? 16 : 14 }}
                >
                  Non hai un account?{' '}
                </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/register' as any)}>
                  <Text 
                    className="font-semibold text-[#2A9D8F]"
                    style={{ fontSize: isLargeScreen ? 16 : 14 }}
                  >
                    Registrati
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
} 