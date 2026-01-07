import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('Mario Rossi');
  const [email, setEmail] = useState('mario.rossi@company.com');



  const recentActivity = [
    { id: 1, action: 'Manutenzione completata', target: 'Estintore A001', time: '2 ore fa', icon: 'checkmark-circle', color: 'text-green-600' },
    { id: 2, action: 'Verifica eseguita', target: 'Idrante B045', time: '1 giorno fa', icon: 'eye', color: 'text-blue-600' },
    { id: 3, action: 'Installazione completata', target: 'Sensore C012', time: '2 giorni fa', icon: 'construct', color: 'text-purple-600' },
    { id: 4, action: 'Sostituzione eseguita', target: 'Porta D089', time: '3 giorni fa', icon: 'swap-horizontal', color: 'text-orange-600' },
    { id: 5, action: 'Dismissione completata', target: 'Estintore E067', time: '4 giorni fa', icon: 'trash', color: 'text-red-600' },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Fixed Header with Profile Info */}
      <View className="bg-teal-600 pt-12 pb-8 px-4">
        <View className="items-center">
          <View className="bg-white p-4 rounded-full mb-4 shadow-lg">
            <Ionicons name="person" size={48} color="#0D9488" />
          </View>
          
          {isEditing ? (
            <View className="w-full">
              <TextInput
                value={name}
                onChangeText={setName}
                className="text-white text-xl font-bold text-center bg-white/20 rounded-lg p-2 mb-2"
                placeholder="Nome completo"
                placeholderTextColor="rgba(255,255,255,0.7)"
              />
              <TextInput
                value={email}
                onChangeText={setEmail}
                className="text-teal-100 text-base text-center bg-white/20 rounded-lg p-2"
                placeholder="Email"
                placeholderTextColor="rgba(255,255,255,0.7)"
                keyboardType="email-address"
              />
            </View>
          ) : (
            <>
              <Text className="text-white text-xl font-bold">{name}</Text>
              <Text className="text-teal-100 text-base">{email}</Text>
            </>
          )}
          
          <TouchableOpacity
            onPress={() => setIsEditing(!isEditing)}
            className="mt-4 bg-white/20 px-4 py-2 rounded-lg flex-row items-center"
          >
            <Ionicons name={isEditing ? "checkmark" : "create"} size={16} color="white" />
            <Text className="text-white font-medium ml-2">
              {isEditing ? 'Salva' : 'Modifica'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

      {/* Account Settings */}
      <View className="mx-4 mt-6 mb-6">
        <Text className="text-gray-800 text-lg font-semibold mb-3">Impostazioni Account</Text>
        <View className="bg-white rounded-xl shadow-sm overflow-hidden">
          <View className="p-4 border-b border-gray-100 flex-row items-center justify-between">
            <View>
              <Text className="text-gray-800 font-medium">Status</Text>
              <Text className="text-green-600 text-sm">Attivo</Text>
            </View>
            <View className="bg-green-100 p-2 rounded-full">
              <Ionicons name="checkmark-circle" size={20} color="#059669" />
            </View>
          </View>
          
          <View className="p-4 border-b border-gray-100 flex-row items-center justify-between">
            <View>
              <Text className="text-gray-800 font-medium">Data Registrazione</Text>
              <Text className="text-gray-500 text-sm">15 Marzo 2024</Text>
            </View>
            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
          </View>
          
          <View className="p-4 flex-row items-center justify-between">
            <View>
              <Text className="text-gray-800 font-medium">ID Dipendente</Text>
              <Text className="text-gray-500 text-sm">#EMP-2024-0056</Text>
            </View>
            <Ionicons name="id-card-outline" size={20} color="#6B7280" />
          </View>
        </View>
      </View>



      {/* Recent Activity */}
      <View className="mx-4 mb-6">
        <Text className="text-gray-800 text-lg font-semibold mb-3">Attività Recente</Text>
        <View className="bg-white rounded-xl shadow-sm overflow-hidden">
          {recentActivity.map((activity, index) => (
            <View key={activity.id} className={`p-4 ${index < recentActivity.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <View className="flex-row items-center">
                <Ionicons name={activity.icon as any} size={20} color="#0D9488" />
                <View className="flex-1 ml-3">
                  <Text className="text-gray-800 font-medium">{activity.action}</Text>
                  <Text className="text-gray-600 text-sm">{activity.target}</Text>
                </View>
                <Text className="text-gray-400 text-xs">{activity.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Logout Button */}
      <View className="mx-4 mb-8">
        <TouchableOpacity className="bg-red-500 p-4 rounded-xl flex-row items-center justify-center shadow-sm">
          <Ionicons name="log-out" size={20} color="white" />
          <Text className="text-white font-semibold ml-2">Disconnetti</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </View>
  );
}