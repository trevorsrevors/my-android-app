import { Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from './Icon';
import { storageManager, Meal } from '../utils/storage';

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: string;
}

interface QuickAddFoodProps {
  food: FoodItem;
  onClose: () => void;
  onAdded: () => void;
}

export default function QuickAddFood({ food, onClose, onAdded }: QuickAddFoodProps) {
  const [amount, setAmount] = useState('100');

  const calculateNutrition = () => {
    const multiplier = (parseFloat(amount) || 0) / 100;
    return {
      calories: Math.round(food.calories * multiplier),
      protein: Math.round(food.protein * multiplier * 10) / 10,
      carbs: Math.round(food.carbs * multiplier * 10) / 10,
      fat: Math.round(food.fat * multiplier * 10) / 10,
    };
  };

  const addFood = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      const nutrition = calculateNutrition();
      const meal: Meal = {
        id: Date.now().toString(),
        name: `${food.name} (${amount}g)`,
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        servings: 1,
        timestamp: Date.now(),
        type: 'custom',
      };

      await storageManager.saveMeal(meal);
      Alert.alert('Success', `Added ${food.name} to your daily log!`);
      onAdded();
    } catch (error) {
      console.error('Error adding food:', error);
      Alert.alert('Error', 'Failed to add food. Please try again.');
    }
  };

  const nutrition = calculateNutrition();

  return (
    <View style={[commonStyles.card, { marginTop: 16 }]}>
      <View style={[commonStyles.row, { marginBottom: 16 }]}>
        <Text style={[commonStyles.subtitle, { flex: 1, marginBottom: 0 }]}>
          Quick Add: {food.name}
        </Text>
        <TouchableOpacity onPress={onClose}>
          <Icon name="close" size={24} style={{ color: colors.textSecondary }} />
        </TouchableOpacity>
      </View>

      <View style={[commonStyles.row, { marginBottom: 16 }]}>
        <View style={{ flex: 2, marginRight: 8 }}>
          <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Amount</Text>
          <TextInput
            style={commonStyles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="100"
            keyboardType="numeric"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Unit</Text>
          <View style={[commonStyles.input, { justifyContent: 'center' }]}>
            <Text style={commonStyles.text}>g</Text>
          </View>
        </View>
      </View>

      <View style={[commonStyles.card, { backgroundColor: colors.background, marginBottom: 16 }]}>
        <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>
          Nutrition for {amount}g:
        </Text>
        <View style={commonStyles.row}>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={[commonStyles.text, { fontWeight: '600', color: colors.primary }]}>
              {nutrition.calories}
            </Text>
            <Text style={commonStyles.textSecondary}>Calories</Text>
          </View>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={[commonStyles.text, { fontWeight: '600' }]}>
              {nutrition.protein}g
            </Text>
            <Text style={commonStyles.textSecondary}>Protein</Text>
          </View>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={[commonStyles.text, { fontWeight: '600' }]}>
              {nutrition.carbs}g
            </Text>
            <Text style={commonStyles.textSecondary}>Carbs</Text>
          </View>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={[commonStyles.text, { fontWeight: '600' }]}>
              {nutrition.fat}g
            </Text>
            <Text style={commonStyles.textSecondary}>Fat</Text>
          </View>
        </View>
      </View>

      <View style={commonStyles.row}>
        <TouchableOpacity
          style={[commonStyles.input, { 
            flex: 1, 
            marginRight: 8, 
            alignItems: 'center', 
            backgroundColor: colors.grey 
          }]}
          onPress={onClose}
        >
          <Text style={[commonStyles.text, { color: colors.textSecondary }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[commonStyles.input, { 
            flex: 1, 
            marginLeft: 8, 
            alignItems: 'center', 
            backgroundColor: colors.primary 
          }]}
          onPress={addFood}
        >
          <Text style={[commonStyles.text, { color: 'white', fontWeight: '600' }]}>Add to Log</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
