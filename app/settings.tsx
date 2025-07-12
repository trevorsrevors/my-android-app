import { Text, View, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from '../components/Icon';
import Button from '../components/Button';
import { storageManager } from '../utils/storage';

export default function Settings() {
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState('2000');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await storageManager.getUserSettings();
      setDailyCalorieGoal(settings.dailyCalorieGoal.toString());
      setLoading(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    const goal = parseInt(dailyCalorieGoal);
    
    if (!goal || goal < 500 || goal > 5000) {
      Alert.alert('Error', 'Please enter a valid calorie goal between 500 and 5000');
      return;
    }

    try {
      await storageManager.saveUserSettings({ dailyCalorieGoal: goal });
      Alert.alert('Success', 'Settings saved successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={commonStyles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[commonStyles.section, { paddingTop: 20 }]}>
          <View style={commonStyles.row}>
            <TouchableOpacity onPress={() => router.back()}>
              <Icon name="arrow-back" size={24} style={{ color: colors.text }} />
            </TouchableOpacity>
            <Text style={[commonStyles.title, { flex: 1, textAlign: 'center', marginBottom: 0 }]}>
              Settings
            </Text>
            <View style={{ width: 24 }} />
          </View>
        </View>

        {/* Daily Calorie Goal */}
        <View style={commonStyles.section}>
          <View style={commonStyles.card}>
            <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Daily Calorie Goal</Text>
            
            <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>
              Target Calories per Day
            </Text>
            <TextInput
              style={commonStyles.input}
              value={dailyCalorieGoal}
              onChangeText={setDailyCalorieGoal}
              placeholder="2000"
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
            />
            <Text style={[commonStyles.textSecondary, { marginTop: 8 }]}>
              Recommended range: 1200-3000 calories per day
            </Text>
          </View>
        </View>

        {/* About */}
        <View style={commonStyles.section}>
          <View style={commonStyles.card}>
            <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>About This App</Text>
            
            <Text style={[commonStyles.text, { marginBottom: 12 }]}>
              This calorie tracking app helps you:
            </Text>
            
            <View style={{ marginLeft: 16 }}>
              <Text style={[commonStyles.text, { marginBottom: 8 }]}>
                • Create custom meals from individual ingredients
              </Text>
              <Text style={[commonStyles.text, { marginBottom: 8 }]}>
                • Break down large prepped meals into servings
              </Text>
              <Text style={[commonStyles.text, { marginBottom: 8 }]}>
                • Track daily calorie and macro intake
              </Text>
              <Text style={[commonStyles.text, { marginBottom: 8 }]}>
                • Use nutrition labels exactly as they appear
              </Text>
            </View>
          </View>
        </View>

        {/* Save Button */}
        <View style={[commonStyles.section, { paddingBottom: 40 }]}>
          <Button
            text="Save Settings"
            onPress={saveSettings}
            style={{ backgroundColor: colors.primary }}
          />
        </View>
      </ScrollView>
    </View>
  );
}
