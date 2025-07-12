import { Text, View, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { useState, useCallback } from 'react';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from '../components/Icon';
import MealItem from '../components/MealItem';
import { useFocusEffect } from '@react-navigation/native';
import { storageManager, DailyLog } from '../utils/storage';

export default function Dashboard() {
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [todayLog, setTodayLog] = useState<DailyLog>({
    date: new Date().toISOString().split('T')[0],
    meals: [],
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
  });

  const loadTodayData = useCallback(async () => {
    try {
      console.log('Loading today\'s data...');
      const today = new Date().toISOString().split('T')[0];
      const [dailyLog, settings] = await Promise.all([
        storageManager.getDailyLog(today),
        storageManager.getUserSettings(),
      ]);
      
      setTodayLog(dailyLog);
      setDailyGoal(settings.dailyCalorieGoal);
      console.log('Loaded daily log:', dailyLog);
    } catch (error) {
      console.error('Error loading today\'s data:', error);
    }
  }, []);

  useFocusEffect(loadTodayData);

  const handleDeleteMeal = async (mealId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await storageManager.removeMeal(today, mealId);
      await loadTodayData(); // Reload data after deletion
    } catch (error) {
      console.error('Error deleting meal:', error);
    }
  };

  const handleVaultData = async () => {
    if (todayLog.meals.length === 0) {
      if (Platform.OS === 'web') {
        window.alert('Nothing to Vault - No meals logged today to save to history.');
      } else {
        Alert.alert('Nothing to Vault', 'No meals logged today to save to history.');
      }
      return;
    }

    const confirmed = Platform.OS === 'web' 
      ? window.confirm('This will save today\'s progress to history and reset your daily log. Continue?')
      : await new Promise(resolve => {
          Alert.alert(
            'Vault Today\'s Data',
            'This will save today\'s progress to history and reset your daily log. Continue?',
            [
              { text: 'Cancel', onPress: () => resolve(false) },
              { text: 'Vault', onPress: () => resolve(true) }
            ]
          );
        });

    if (confirmed) {
      try {
        await storageManager.vaultTodayAndReset();
        await loadTodayData(); // Reload to show reset state
        if (Platform.OS === 'web') {
          window.alert('Success! Today\'s data has been saved to history and daily log reset!');
        } else {
          Alert.alert('Success', 'Today\'s data has been saved to history and daily log reset!');
        }
      } catch (error) {
        console.error('Error vaulting data:', error);
        if (Platform.OS === 'web') {
          window.alert('Error: Failed to vault data. Please try again.');
        } else {
          Alert.alert('Error', 'Failed to vault data. Please try again.');
        }
      }
    }
  };

  const remainingCalories = dailyGoal - todayLog.totalCalories;
  const progressPercentage = Math.min((todayLog.totalCalories / dailyGoal) * 100, 100);

  const getProgressColor = () => {
    if (progressPercentage < 50) return colors.primary;
    if (progressPercentage < 90) return colors.secondary;
    return colors.error;
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[commonStyles.section, { paddingTop: 20 }]}>
          <View style={commonStyles.row}>
            <View style={{ flex: 1 }}>
              <Text style={commonStyles.title}>Calorie Tracker</Text>
              <Text style={commonStyles.textSecondary}>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => router.push('/history')} style={{ marginRight: 16 }}>
                <Icon name="time-outline" size={24} style={{ color: colors.accent }} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleVaultData} style={{ marginRight: 16 }}>
                <Icon name="archive-outline" size={24} style={{ color: colors.primary }} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/settings')}>
                <Icon name="settings-outline" size={24} style={{ color: colors.text }} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Daily Progress Card */}
        <View style={commonStyles.section}>
          <View style={commonStyles.card}>
            <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>Daily Progress</Text>
            
            {/* Calorie Progress */}
            <View style={{ marginBottom: 16 }}>
              <View style={commonStyles.row}>
                <Text style={commonStyles.text}>Calories</Text>
                <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                  {todayLog.totalCalories} / {dailyGoal}
                </Text>
              </View>
              <View style={{
                height: 8,
                backgroundColor: colors.grey,
                borderRadius: 4,
                marginTop: 8,
                overflow: 'hidden',
              }}>
                <View style={{
                  height: '100%',
                  width: `${progressPercentage}%`,
                  backgroundColor: getProgressColor(),
                  borderRadius: 4,
                }} />
              </View>
              <Text style={[commonStyles.textSecondary, { marginTop: 4 }]}>
                {remainingCalories > 0 ? `${remainingCalories} remaining` : `${Math.abs(remainingCalories)} over goal`}
              </Text>
            </View>

            {/* Macros */}
            <View style={commonStyles.row}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={[commonStyles.text, { fontWeight: '600' }]}>{todayLog.totalProtein}g</Text>
                <Text style={commonStyles.textSecondary}>Protein</Text>
              </View>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={[commonStyles.text, { fontWeight: '600' }]}>{todayLog.totalCarbs}g</Text>
                <Text style={commonStyles.textSecondary}>Carbs</Text>
              </View>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={[commonStyles.text, { fontWeight: '600' }]}>{todayLog.totalFat}g</Text>
                <Text style={commonStyles.textSecondary}>Fat</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={[commonStyles.card, { marginBottom: 12 }]}
            onPress={() => router.push('/create-meal')}
          >
            <View style={[commonStyles.row, { alignItems: 'center' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Icon name="add-circle" size={24} style={{ marginRight: 12, color: colors.primary }} />
                <View>
                  <Text style={commonStyles.text}>Create Recipe</Text>
                  <Text style={commonStyles.textSecondary}>Save meal recipes for later use</Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={20} style={{ color: colors.textSecondary }} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[commonStyles.card, { marginBottom: 12 }]}
            onPress={() => router.push('/prep-meal')}
          >
            <View style={[commonStyles.row, { alignItems: 'center' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Icon name="restaurant" size={24} style={{ marginRight: 12, color: colors.secondary }} />
                <View>
                  <Text style={commonStyles.text}>Log Prepped Meal</Text>
                  <Text style={commonStyles.textSecondary}>Break down large meals into servings</Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={20} style={{ color: colors.textSecondary }} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={commonStyles.card}
            onPress={() => router.push('/food-database')}
          >
            <View style={[commonStyles.row, { alignItems: 'center' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Icon name="search" size={24} style={{ marginRight: 12, color: colors.accent }} />
                <View>
                  <Text style={commonStyles.text}>Food Database</Text>
                  <Text style={commonStyles.textSecondary}>Browse and search ingredients</Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={20} style={{ color: colors.textSecondary }} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Today's Meals */}
        <View style={[commonStyles.section, { paddingBottom: 40 }]}>
          <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>Today's Meals</Text>
          
          {todayLog.meals.length === 0 ? (
            <View style={[commonStyles.card, { alignItems: 'center', padding: 32 }]}>
              <Icon name="restaurant-outline" size={48} style={{ color: colors.textSecondary, marginBottom: 12 }} />
              <Text style={[commonStyles.text, { textAlign: 'center' }]}>No meals logged today</Text>
              <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 4 }]}>
                Start by creating a custom meal or logging a prepped meal
              </Text>
            </View>
          ) : (
            todayLog.meals.map((meal) => (
              <MealItem
                key={meal.id}
                meal={meal}
                onDelete={handleDeleteMeal}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
