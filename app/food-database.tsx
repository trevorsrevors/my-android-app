import { Text, View, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from '../components/Icon';
import QuickAddFood from '../components/QuickAddFood';

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: string;
}

// Sample food database
const FOOD_DATABASE: FoodItem[] = [
  // Proteins
  { id: '1', name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, category: 'Protein' },
  { id: '2', name: 'Salmon', calories: 208, protein: 22, carbs: 0, fat: 12, category: 'Protein' },
  { id: '3', name: 'Eggs', calories: 155, protein: 13, carbs: 1.1, fat: 11, category: 'Protein' },
  { id: '4', name: 'Greek Yogurt', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, category: 'Protein' },
  { id: '5', name: 'Tofu', calories: 76, protein: 8, carbs: 1.9, fat: 4.8, category: 'Protein' },
  
  // Carbohydrates
  { id: '6', name: 'Brown Rice', calories: 111, protein: 2.6, carbs: 23, fat: 0.9, category: 'Carbs' },
  { id: '7', name: 'Quinoa', calories: 120, protein: 4.4, carbs: 22, fat: 1.9, category: 'Carbs' },
  { id: '8', name: 'Sweet Potato', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, category: 'Carbs' },
  { id: '9', name: 'Oats', calories: 389, protein: 16.9, carbs: 66, fat: 6.9, category: 'Carbs' },
  { id: '10', name: 'Whole Wheat Bread', calories: 247, protein: 13, carbs: 41, fat: 4.2, category: 'Carbs' },
  
  // Vegetables
  { id: '11', name: 'Broccoli', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, category: 'Vegetables' },
  { id: '12', name: 'Spinach', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, category: 'Vegetables' },
  { id: '13', name: 'Bell Peppers', calories: 31, protein: 1, carbs: 7, fat: 0.3, category: 'Vegetables' },
  { id: '14', name: 'Carrots', calories: 41, protein: 0.9, carbs: 10, fat: 0.2, category: 'Vegetables' },
  { id: '15', name: 'Tomatoes', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, category: 'Vegetables' },
  
  // Fats
  { id: '16', name: 'Avocado', calories: 160, protein: 2, carbs: 9, fat: 15, category: 'Fats' },
  { id: '17', name: 'Olive Oil', calories: 884, protein: 0, carbs: 0, fat: 100, category: 'Fats' },
  { id: '18', name: 'Almonds', calories: 579, protein: 21, carbs: 22, fat: 50, category: 'Fats' },
  { id: '19', name: 'Peanut Butter', calories: 588, protein: 25, carbs: 20, fat: 50, category: 'Fats' },
  { id: '20', name: 'Coconut Oil', calories: 862, protein: 0, carbs: 0, fat: 100, category: 'Fats' },
];

const CATEGORIES = ['All', 'Protein', 'Carbs', 'Vegetables', 'Fats'];

export default function FoodDatabase() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  const filteredFoods = FOOD_DATABASE.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const selectFood = (food: FoodItem) => {
    setSelectedFood(food);
  };

  const handleFoodAdded = () => {
    setSelectedFood(null);
    router.back();
  };

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
              Food Database
            </Text>
            <View style={{ width: 24 }} />
          </View>
          <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 8 }]}>
            Browse and search for ingredients
          </Text>
        </View>

        {/* Search */}
        <View style={commonStyles.section}>
          <View style={{ position: 'relative' }}>
            <TextInput
              style={[commonStyles.input, { paddingLeft: 40 }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search foods..."
              placeholderTextColor={colors.textSecondary}
            />
            <Icon 
              name="search" 
              size={20} 
              style={{ 
                position: 'absolute', 
                left: 12, 
                top: 14, 
                color: colors.textSecondary 
              }} 
            />
          </View>
        </View>

        {/* Category Filter */}
        <View style={commonStyles.section}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', paddingHorizontal: 4 }}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    marginHorizontal: 4,
                    borderRadius: 20,
                    backgroundColor: selectedCategory === category ? colors.primary : colors.grey,
                  }}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={{
                    color: selectedCategory === category ? 'white' : colors.text,
                    fontWeight: selectedCategory === category ? '600' : '400',
                  }}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Quick Add Food */}
        {selectedFood && (
          <View style={commonStyles.section}>
            <QuickAddFood
              food={selectedFood}
              onClose={() => setSelectedFood(null)}
              onAdded={handleFoodAdded}
            />
          </View>
        )}

        {/* Results */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.textSecondary, { marginBottom: 12 }]}>
            {filteredFoods.length} result{filteredFoods.length !== 1 ? 's' : ''} found
          </Text>

          {filteredFoods.length === 0 ? (
            <View style={[commonStyles.card, { alignItems: 'center', padding: 32 }]}>
              <Icon name="search-outline" size={48} style={{ color: colors.textSecondary, marginBottom: 12 }} />
              <Text style={[commonStyles.text, { textAlign: 'center' }]}>No foods found</Text>
              <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 4 }]}>
                Try adjusting your search or category filter
              </Text>
            </View>
          ) : (
            filteredFoods.map((food) => (
              <TouchableOpacity
                key={food.id}
                style={[commonStyles.card, { marginBottom: 12 }]}
                onPress={() => selectFood(food)}
              >
                <View style={commonStyles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 4 }]}>
                      {food.name}
                    </Text>
                    <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]}>
                      {food.category} • Per 100g
                    </Text>
                    <View style={commonStyles.row}>
                      <Text style={[commonStyles.textSecondary, { flex: 1 }]}>
                        {food.calories} cal
                      </Text>
                      <Text style={[commonStyles.textSecondary, { flex: 1 }]}>
                        P: {food.protein}g
                      </Text>
                      <Text style={[commonStyles.textSecondary, { flex: 1 }]}>
                        C: {food.carbs}g
                      </Text>
                      <Text style={[commonStyles.textSecondary, { flex: 1 }]}>
                        F: {food.fat}g
                      </Text>
                    </View>
                  </View>
                  <Icon name="add-circle" size={24} style={{ color: colors.primary }} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
