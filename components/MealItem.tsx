import { Text, View, TouchableOpacity, Alert, Platform } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from './Icon';
import { Meal } from '../utils/storage';

interface MealItemProps {
  meal: Meal;
  onDelete: (mealId: string) => void;
}

export default function MealItem({ meal, onDelete }: MealItemProps) {
  const handleDelete = () => {
    console.log('handleDelete called for meal:', meal.name);
    
    // Use window.confirm for web, Alert.alert for native
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Are you sure you want to delete "${meal.name}"?`);
      if (confirmed) {
        console.log('Deleting meal with ID:', meal.id);
        onDelete(meal.id);
      }
    } else {
      Alert.alert(
        'Delete Meal',
        `Are you sure you want to delete "${meal.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: () => {
              console.log('Deleting meal with ID:', meal.id);
              onDelete(meal.id);
            }
          }
        ]
      );
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <View style={[commonStyles.card, { marginBottom: 12 }]}>
      <View style={commonStyles.row}>
        <View style={{ flex: 1 }}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 4 }]}>
            {meal.name}
          </Text>
          <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]}>
            {formatTime(meal.timestamp)} • {meal.type === 'custom' ? 'Custom meal' : 'Prepped meal'}
          </Text>
          <View style={commonStyles.row}>
            <Text style={[commonStyles.textSecondary, { flex: 1 }]}>
              {meal.calories} cal
            </Text>
            <Text style={[commonStyles.textSecondary, { flex: 1 }]}>
              P: {meal.protein}g
            </Text>
            <Text style={[commonStyles.textSecondary, { flex: 1 }]}>
              C: {meal.carbs}g
            </Text>
            <Text style={[commonStyles.textSecondary, { flex: 1 }]}>
              F: {meal.fat}g
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleDelete} style={{ padding: 8 }}>
          <Icon name="trash-outline" size={20} style={{ color: colors.error }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
