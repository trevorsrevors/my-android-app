import { Text, View, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from '../components/Icon';
import Button from '../components/Button';
import { storageManager, SavedRecipe } from '../utils/storage';

interface Ingredient {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  amount: number;
  unit: string;
}

export default function CreateMeal() {
  const [mealName, setMealName] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  
  // New ingredient form
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    amount: '',
    unit: 'g',
    labelServing: '',
    labelWeight: '',
  });

  const calculateTotals = (ingredientList: Ingredient[]) => {
    return ingredientList.reduce(
      (totals, ingredient) => {
        // Use the actual nutrition values already calculated when ingredient was added
        return {
          calories: totals.calories + ingredient.calories,
          protein: totals.protein + ingredient.protein,
          carbs: totals.carbs + ingredient.carbs,
          fat: totals.fat + ingredient.fat,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const addIngredient = () => {
    if (!newIngredient.name || !newIngredient.calories || !newIngredient.amount || !newIngredient.labelWeight) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Calculate actual nutrition based on label info and amount used
    const labelCalories = parseFloat(newIngredient.calories) || 0;
    const labelProtein = parseFloat(newIngredient.protein) || 0;
    const labelCarbs = parseFloat(newIngredient.carbs) || 0;
    const labelFat = parseFloat(newIngredient.fat) || 0;
    const labelWeight = parseFloat(newIngredient.labelWeight) || 1;
    const amountUsed = parseFloat(newIngredient.amount) || 0;

    // Calculate nutrition per gram from label, then multiply by amount used
    const actualCalories = (labelCalories / labelWeight) * amountUsed;
    const actualProtein = (labelProtein / labelWeight) * amountUsed;
    const actualCarbs = (labelCarbs / labelWeight) * amountUsed;
    const actualFat = (labelFat / labelWeight) * amountUsed;

    const ingredient: Ingredient = {
      id: Date.now().toString(),
      name: newIngredient.name,
      calories: Math.round(actualCalories * 10) / 10,
      protein: Math.round(actualProtein * 10) / 10,
      carbs: Math.round(actualCarbs * 10) / 10,
      fat: Math.round(actualFat * 10) / 10,
      amount: amountUsed,
      unit: newIngredient.unit,
    };

    setIngredients([...ingredients, ingredient]);
    setNewIngredient({
      name: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      amount: '',
      unit: 'g',
      labelServing: '',
      labelWeight: '',
    });
    setShowAddIngredient(false);
  };

  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  const saveMeal = async () => {
    if (!mealName.trim()) {
      Alert.alert('Error', 'Please enter a meal name');
      return;
    }

    if (ingredients.length === 0) {
      Alert.alert('Error', 'Please add at least one ingredient');
      return;
    }

    try {
      const totals = calculateTotals(ingredients);
      const recipe: SavedRecipe = {
        id: Date.now().toString(),
        name: mealName,
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein * 10) / 10,
        carbs: Math.round(totals.carbs * 10) / 10,
        fat: Math.round(totals.fat * 10) / 10,
        ingredients: ingredients,
        createdAt: Date.now(),
      };

      await storageManager.saveRecipe(recipe);
      Alert.alert('Success', `Recipe "${mealName}" saved! You can now find it in the Prep Meal section.`, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error saving recipe:', error);
      Alert.alert('Error', 'Failed to save recipe. Please try again.');
    }
  };

  const totals = calculateTotals(ingredients);

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
              Create Recipe
            </Text>
            <View style={{ width: 24 }} />
          </View>
        </View>

        {/* Meal Name */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Recipe Name</Text>
          <TextInput
            style={commonStyles.input}
            value={mealName}
            onChangeText={setMealName}
            placeholder="Enter recipe name..."
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Nutrition Summary */}
        {ingredients.length > 0 && (
          <View style={commonStyles.section}>
            <View style={commonStyles.card}>
              <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>Total Recipe Nutrition</Text>
              <View style={commonStyles.row}>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={[commonStyles.text, { fontWeight: '600', fontSize: 18 }]}>
                    {Math.round(totals.calories)}
                  </Text>
                  <Text style={commonStyles.textSecondary}>Calories</Text>
                </View>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                    {Math.round(totals.protein * 10) / 10}g
                  </Text>
                  <Text style={commonStyles.textSecondary}>Protein</Text>
                </View>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                    {Math.round(totals.carbs * 10) / 10}g
                  </Text>
                  <Text style={commonStyles.textSecondary}>Carbs</Text>
                </View>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                    {Math.round(totals.fat * 10) / 10}g
                  </Text>
                  <Text style={commonStyles.textSecondary}>Fat</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Ingredients List */}
        <View style={commonStyles.section}>
          <View style={commonStyles.row}>
            <Text style={[commonStyles.subtitle, { marginBottom: 0 }]}>Ingredients</Text>
            <TouchableOpacity onPress={() => setShowAddIngredient(true)}>
              <Icon name="add-circle" size={24} style={{ color: colors.primary }} />
            </TouchableOpacity>
          </View>

          {ingredients.length === 0 ? (
            <View style={[commonStyles.card, { alignItems: 'center', padding: 32, marginTop: 12 }]}>
              <Icon name="nutrition-outline" size={48} style={{ color: colors.textSecondary, marginBottom: 12 }} />
              <Text style={[commonStyles.text, { textAlign: 'center' }]}>No ingredients added</Text>
              <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 4 }]}>
                Tap the + button to add ingredients
              </Text>
            </View>
          ) : (
            ingredients.map((ingredient) => (
              <View key={ingredient.id} style={[commonStyles.card, { marginTop: 12 }]}>
                <View style={commonStyles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={[commonStyles.text, { fontWeight: '600' }]}>{ingredient.name}</Text>
                    <Text style={commonStyles.textSecondary}>
                      {ingredient.amount}{ingredient.unit} • {Math.round(ingredient.calories)} cal
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => removeIngredient(ingredient.id)}>
                    <Icon name="trash-outline" size={20} style={{ color: colors.error }} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Add Ingredient Form */}
        {showAddIngredient && (
          <View style={commonStyles.section}>
            <View style={commonStyles.card}>
              <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Add Ingredient</Text>
              
              <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Name *</Text>
              <TextInput
                style={[commonStyles.input, { marginBottom: 16 }]}
                value={newIngredient.name}
                onChangeText={(text) => setNewIngredient({...newIngredient, name: text})}
                placeholder="Ingredient name..."
                placeholderTextColor={colors.textSecondary}
              />

              <View style={[commonStyles.row, { marginBottom: 16 }]}>
                <View style={{ flex: 2, marginRight: 8 }}>
                  <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Amount Used *</Text>
                  <TextInput
                    style={commonStyles.input}
                    value={newIngredient.amount}
                    onChangeText={(text) => setNewIngredient({...newIngredient, amount: text})}
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

              <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>
                Nutrition Facts (as shown on label) *
              </Text>
              
              <View style={[commonStyles.row, { marginBottom: 16 }]}>
                <View style={{ flex: 1, marginRight: 4 }}>
                  <TextInput
                    style={commonStyles.input}
                    value={newIngredient.calories}
                    onChangeText={(text) => setNewIngredient({...newIngredient, calories: text})}
                    placeholder="Calories"
                    keyboardType="numeric"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                <View style={{ flex: 1, marginHorizontal: 4 }}>
                  <TextInput
                    style={commonStyles.input}
                    value={newIngredient.protein}
                    onChangeText={(text) => setNewIngredient({...newIngredient, protein: text})}
                    placeholder="Protein (g)"
                    keyboardType="numeric"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>

              <View style={[commonStyles.row, { marginBottom: 16 }]}>
                <View style={{ flex: 1, marginRight: 4 }}>
                  <TextInput
                    style={commonStyles.input}
                    value={newIngredient.carbs}
                    onChangeText={(text) => setNewIngredient({...newIngredient, carbs: text})}
                    placeholder="Carbs (g)"
                    keyboardType="numeric"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 4 }}>
                  <TextInput
                    style={commonStyles.input}
                    value={newIngredient.fat}
                    onChangeText={(text) => setNewIngredient({...newIngredient, fat: text})}
                    placeholder="Fat (g)"
                    keyboardType="numeric"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>

              <View style={[commonStyles.row, { marginBottom: 20 }]}>
                <View style={{ flex: 2, marginRight: 8 }}>
                  <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Label Serving Size *</Text>
                  <TextInput
                    style={commonStyles.input}
                    value={newIngredient.labelServing || ''}
                    onChangeText={(text) => setNewIngredient({...newIngredient, labelServing: text})}
                    placeholder="e.g., 100g, 2 tbsp, 1 cup"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Weight (g)</Text>
                  <TextInput
                    style={commonStyles.input}
                    value={newIngredient.labelWeight || ''}
                    onChangeText={(text) => setNewIngredient({...newIngredient, labelWeight: text})}
                    placeholder="100"
                    keyboardType="numeric"
                    placeholderTextColor={colors.textSecondary}
                  />
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
                  onPress={() => setShowAddIngredient(false)}
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
                  onPress={addIngredient}
                >
                  <Text style={[commonStyles.text, { color: 'white', fontWeight: '600' }]}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Save Button */}
        {ingredients.length > 0 && (
          <View style={[commonStyles.section, { paddingBottom: 40 }]}>
            <Button
              text="Save Recipe"
              onPress={saveMeal}
              style={{ backgroundColor: colors.primary }}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
