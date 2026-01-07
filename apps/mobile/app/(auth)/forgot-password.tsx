'use client';

import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
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

const { width, height } = Dimensions.get('window');
const isLargeScreen = width > 768;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Errore', 'Inserisci la tua email');
      return;
    }

    setLoading(true);
    try {
      // Simuliamo un delay per il mock
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert(
        'Email inviata', 
        'Abbiamo inviato le istruzioni per il recupero password alla tua email', 
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Errore', 'Si è verificato un errore durante l\'invio dell\'email');
    } finally {
      setLoading(false);
    }
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
            className="relative items-center justify-center w-full"
            style={{ 
              paddingTop: isLargeScreen ? 120 : 130, 
              paddingBottom: isLargeScreen ? 50 : 60,
              height: height * 0.5
            }}
          >
            <TouchableOpacity 
              onPress={() => router.back()} 
              className="absolute top-14 left-5 z-10"
            >
              <Ionicons name="chevron-back" size={28} color="#333" />
            </TouchableOpacity>
            
            <View className="items-center">
              <Image
                source={require('@/assets/images/logo.png')}
                className="rounded-full overflow-hidden"
                style={{ 
                  width: isLargeScreen ? 140 : width * 0.35, 
                  height: isLargeScreen ? 140 : width * 0.35,
                  marginBottom: 30
                }}
              />
              <Text 
                className="font-bold text-gray-900 mb-3 text-center"
                style={{ fontSize: isLargeScreen ? 42 : 36 }}
              >
                Recupera Password
              </Text>
              <Text 
                className="text-center text-gray-700 px-10"
                style={{ fontSize: isLargeScreen ? 18 : 16 }}
              >
                Inserisci la tua email e ti invieremo le istruzioni per reimpostare la password
              </Text>
            </View>
          </LinearGradient>

          <View className="flex-1 px-6 pt-8 bg-white dark:bg-black items-center">
            <View className="w-full" style={{ maxWidth: isLargeScreen ? 480 : '100%' }}>
              <View className="mb-6 w-full">
                <View className="flex-row items-center px-4 border border-[#DEE2E6] dark:border-[#343A40] rounded-xl bg-white dark:bg-[#1A1A1A]"
                  style={{ paddingVertical: isLargeScreen ? 14 : 12 }}
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={Colors.light.icon}
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
                    onSubmitEditing={handleResetPassword}
                  />
                </View>
              </View>

              <TouchableOpacity
                className={`items-center rounded-xl bg-[#2A9D8F] w-full mb-8 ${loading ? 'opacity-70' : ''}`}
                style={{ paddingVertical: isLargeScreen ? 18 : 16 }}
                onPress={handleResetPassword}
                disabled={loading}
              >
                <Text 
                  className="text-white font-semibold"
                  style={{ fontSize: isLargeScreen ? 19 : 17 }}
                >
                  {loading ? 'Invio in corso...' : 'Invia Email di Reset'}
                </Text>
              </TouchableOpacity>

              <View className="flex-row justify-center items-center w-full">
                <Text 
                  className="text-[#6C757D] dark:text-[#ADB5BD]"
                  style={{ fontSize: isLargeScreen ? 16 : 14 }}
                >
                  Ricordi la password?{' '}
                </Text>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text 
                    className="font-semibold text-[#2A9D8F]"
                    style={{ fontSize: isLargeScreen ? 16 : 14 }}
                  >
                    Accedi
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