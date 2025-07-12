import { Text, View, ScrollView, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from '../components/Icon';
import Button from '../components/Button';
import { storageManager, Meal, SavedRecipe } from '../utils/storage';

export default function PrepMeal() {
  const [mode, setMode] = useState<'search' | 'manual'>('search');
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<SavedRecipe | null>(null);
  
  // Manual entry fields
  const [mealName, setMealName] = useState('');
  const [totalCalories, setTotalCalories] = useState('');
  const [totalProtein, setTotalProtein] = useState('');
  const [totalCarbs, setTotalCarbs] = useState('');
  const [totalFat, setTotalFat] = useState('');
  const [totalServings, setTotalServings] = useState('');
  const [servingsToLog, setServingsToLog] = useState('1');

  useEffect(() => {
    loadSavedRecipes();
  }, []);

  const loadSavedRecipes = async () => {
    try {
      const recipes = await storageManager.getSavedRecipes();
      setSavedRecipes(recipes);
    } catch (error) {
      console.error('Error loading saved recipes:', error);
    }
  };

  const filteredRecipes = savedRecipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectRecipe = (recipe: SavedRecipe) => {
    setSelectedRecipe(recipe);
    setMealName(recipe.name);
    setTotalCalories(recipe.calories.toString());
    setTotalProtein(recipe.protein.toString());
    setTotalCarbs(recipe.carbs.toString());
    setTotalFat(recipe.fat.toString());
    setTotalServings('4'); // Default to 4 servings
  };

  const handleDeleteRecipe = async (recipeId: string, recipeName: string) => {
    const confirmed = Platform.OS === 'web' 
      ? window.confirm(`Are you sure you want to delete the recipe "${recipeName}"?`)
      : await new Promise(resolve => {
          Alert.alert(
            'Delete Recipe',
            `Are you sure you want to delete "${recipeName}"?`,
            [
              { text: 'Cancel', onPress: () => resolve(false) },
              { text: 'Delete', onPress: () => resolve(true) }
            ]
          );
        });

    if (confirmed) {
      try {
        await storageManager.deleteRecipe(recipeId);
        await loadSavedRecipes(); // Reload recipes after deletion
        
        // Clear selected recipe if it was the one deleted
        if (selectedRecipe?.id === recipeId) {
          setSelectedRecipe(null);
          setMealName('');
          setTotalCalories('');
          setTotalProtein('');
          setTotalCarbs('');
          setTotalFat('');
          setTotalServings('');
        }
        
        if (Platform.OS === 'web') {
          window.alert('Recipe deleted successfully!');
        } else {
          Alert.alert('Success', 'Recipe deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting recipe:', error);
        if (Platform.OS === 'web') {
          window.alert('Error: Failed to delete recipe. Please try again.');
        } else {
          Alert.alert('Error', 'Failed to delete recipe. Please try again.');
        }
      }
    }
  };

  const calculatePerServing = () => {
    const calories = parseFloat(totalCalories) || 0;
    const protein = parseFloat(totalProtein) || 0;
    const carbs = parseFloat(totalCarbs) || 0;
    const fat = parseFloat(totalFat) || 0;
    const servings = parseFloat(totalServings) || 1;

    return {
      calories: Math.round((calories / servings) * 10) / 10,
      protein: Math.round((protein / servings) * 10) / 10,
      carbs: Math.round((carbs / servings) * 10) / 10,
      fat: Math.round((fat / servings) * 10) / 10,
    };
  };

  const calculateLoggedAmount = () => {
    const perServing = calculatePerServing();
    const servings = parseFloat(servingsToLog) || 1;

    return {
      calories: Math.round((perServing.calories * servings) * 10) / 10,
      protein: Math.round((perServing.protein * servings) * 10) / 10,
      carbs: Math.round((perServing.carbs * servings) * 10) / 10,
      fat: Math.round((perServing.fat * servings) * 10) / 10,
    };
  };

  const savePrepMeal = async () => {
    if (!mealName.trim()) {
      Alert.alert('Error', 'Please enter a meal name');
      return;
    }

    if (!totalCalories || !totalServings) {
      Alert.alert('Error', 'Please fill in calories and total servings');
      return;
    }

    try {
      const loggedAmount = calculateLoggedAmount();
      const servings = parseFloat(servingsToLog) || 1;

      const meal: Meal = {
        id: Date.now().toString(),
        name: `${mealName} (${servings} serving${servings !== 1 ? 's' : ''})`,
        calories: Math.round(loggedAmount.calories),
        protein: Math.round(loggedAmount.protein * 10) / 10,
        carbs: Math.round(loggedAmount.carbs * 10) / 10,
        fat: Math.round(loggedAmount.fat * 10) / 10,
        servings: servings,
        timestamp: Date.now(),
        type: 'prepped',
      };

      await storageManager.saveMeal(meal);
      console.log('Saving prep meal:', meal);
      
      Alert.alert('Success', `Logged ${servingsToLog} serving(s) of ${mealName}!`, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error saving prep meal:', error);
      Alert.alert('Error', 'Failed to save meal. Please try again.');
    }
  };

  const perServing = calculatePerServing();
  const loggedAmount = calculateLoggedAmount();
  const hasValidData = totalCalories && totalServings;

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
              Log Prepped Meal
            </Text>
            <View style={{ width: 24 }} />
          </View>
          <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 8 }]}>
            Select a saved recipe or enter nutrition manually
          </Text>
        </View>

        {/* Mode Toggle */}
        <View style={commonStyles.section}>
          <View style={[commonStyles.row, { marginBottom: 16 }]}>
            <TouchableOpacity
              style={[
                commonStyles.input,
                { 
                  flex: 1, 
                  marginRight: 8, 
                  alignItems: 'center',
                  backgroundColor: mode === 'search' ? colors.primary : colors.grey 
                }
              ]}
              onPress={() => setMode('search')}
            >
              <Text style={[commonStyles.text, { 
                color: mode === 'search' ? 'white' : colors.textSecondary,
                fontWeight: mode === 'search' ? '600' : '400'
              }]}>
                Saved Recipes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                commonStyles.input,
                { 
                  flex: 1, 
                  marginLeft: 8, 
                  alignItems: 'center',
                  backgroundColor: mode === 'manual' ? colors.primary : colors.grey 
                }
              ]}
              onPress={() => setMode('manual')}
            >
              <Text style={[commonStyles.text, { 
                color: mode === 'manual' ? 'white' : colors.textSecondary,
                fontWeight: mode === 'manual' ? '600' : '400'
              }]}>
                Manual Entry
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recipe Search */}
        {mode === 'search' && (
          <View style={commonStyles.section}>
            <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Search Saved Recipes</Text>
            
            <View style={{ position: 'relative', marginBottom: 16 }}>
              <TextInput
                style={[commonStyles.input, { paddingLeft: 40 }]}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search recipes..."
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

            {filteredRecipes.length === 0 ? (
              <View style={[commonStyles.card, { alignItems: 'center', padding: 32 }]}>
                <Icon name="restaurant-outline" size={48} style={{ color: colors.textSecondary, marginBottom: 12 }} />
                <Text style={[commonStyles.text, { textAlign: 'center' }]}>
                  {savedRecipes.length === 0 ? 'No saved recipes yet' : 'No recipes found'}
                </Text>
                <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 4 }]}>
                  {savedRecipes.length === 0 
                    ? 'Create recipes in the "Create Recipe" section first'
                    : 'Try adjusting your search terms'}
                </Text>
              </View>
            ) : (
              filteredRecipes.map((recipe) => (
                <View
                  key={recipe.id}
                  style={[
                    commonStyles.card, 
                    { 
                      marginBottom: 12,
                      borderColor: selectedRecipe?.id === recipe.id ? colors.primary : colors.border,
                      borderWidth: selectedRecipe?.id === recipe.id ? 2 : 1,
                    }
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => selectRecipe(recipe)}
                    style={{ flex: 1 }}
                  >
                    <View style={commonStyles.row}>
                      <View style={{ flex: 1 }}>
                        <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 4 }]}>
                          {recipe.name}
                        </Text>
                        <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]}>
                          Total batch: {recipe.calories} cal
                        </Text>
                        <View style={commonStyles.row}>
                          <Text style={[commonStyles.textSecondary, { flex: 1 }]}>
                            P: {recipe.protein}g
                          </Text>
                          <Text style={[commonStyles.textSecondary, { flex: 1 }]}>
                            C: {recipe.carbs}g
                          </Text>
                          <Text style={[commonStyles.textSecondary, { flex: 1 }]}>
                            F: {recipe.fat}g
                          </Text>
                        </View>
                      </View>
                      {selectedRecipe?.id === recipe.id && (
                        <Icon name="checkmark-circle" size={24} style={{ color: colors.primary, marginRight: 8 }} />
                      )}
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleDeleteRecipe(recipe.id, recipe.name)}
                    style={{ padding: 8, position: 'absolute', top: 8, right: 8 }}
                  >
                    <Icon name="trash-outline" size={20} style={{ color: colors.error }} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* Manual Entry or Selected Recipe Details */}
        {(mode === 'manual' || selectedRecipe) && (
          <>
            {/* Meal Name */}
            <View style={commonStyles.section}>
              <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Meal Name *</Text>
              <TextInput
                style={commonStyles.input}
                value={mealName}
                onChangeText={setMealName}
                placeholder="e.g., Chicken and Rice Prep"
                placeholderTextColor={colors.textSecondary}
                editable={mode === 'manual'}
              />
            </View>

            {/* Total Nutrition */}
            <View style={commonStyles.section}>
              <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Total Nutrition Information</Text>
              
              <View style={[commonStyles.row, { marginBottom: 16 }]}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Total Calories *</Text>
                  <TextInput
                    style={commonStyles.input}
                    value={totalCalories}
                    onChangeText={setTotalCalories}
                    placeholder="2000"
                    keyboardType="numeric"
                    placeholderTextColor={colors.textSecondary}
                    editable={mode === 'manual'}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Total Servings *</Text>
                  <TextInput
                    style={commonStyles.input}
                    value={totalServings}
                    onChangeText={setTotalServings}
                    placeholder="4"
                    keyboardType="numeric"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>

              <Text style={[commonStyles.text, { marginBottom: 12, fontWeight: '600' }]}>
                Total Macros (Optional)
              </Text>
              
              <View style={[commonStyles.row, { marginBottom: 8 }]}>
                <View style={{ flex: 1, marginRight: 4 }}>
                  <TextInput
                    style={commonStyles.input}
                    value={totalProtein}
                    onChangeText={setTotalProtein}
                    placeholder="Protein (g)"
                    keyboardType="numeric"
                    placeholderTextColor={colors.textSecondary}
                    editable={mode === 'manual'}
                  />
                </View>
                <View style={{ flex: 1, marginHorizontal: 4 }}>
                  <TextInput
                    style={commonStyles.input}
                    value={totalCarbs}
                    onChangeText={setTotalCarbs}
                    placeholder="Carbs (g)"
                    keyboardType="numeric"
                    placeholderTextColor={colors.textSecondary}
                    editable={mode === 'manual'}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 4 }}>
                  <TextInput
                    style={commonStyles.input}
                    value={totalFat}
                    onChangeText={setTotalFat}
                    placeholder="Fat (g)"
                    keyboardType="numeric"
                    placeholderTextColor={colors.textSecondary}
                    editable={mode === 'manual'}
                  />
                </View>
              </View>
            </View>

            {/* Per Serving Breakdown */}
            {hasValidData && (
              <View style={commonStyles.section}>
                <View style={commonStyles.card}>
                  <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>Per Serving Breakdown</Text>
                  <View style={commonStyles.row}>
                    <View style={{ alignItems: 'center', flex: 1 }}>
                      <Text style={[commonStyles.text, { fontWeight: '600', fontSize: 18 }]}>
                        {perServing.calories}
                      </Text>
                      <Text style={commonStyles.textSecondary}>Calories</Text>
                    </View>
                    <View style={{ alignItems: 'center', flex: 1 }}>
                      <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                        {perServing.protein}g
                      </Text>
                      <Text style={commonStyles.textSecondary}>Protein</Text>
                    </View>
                    <View style={{ alignItems: 'center', flex: 1 }}>
                      <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                        {perServing.carbs}g
                      </Text>
                      <Text style={commonStyles.textSecondary}>Carbs</Text>
                    </View>
                    <View style={{ alignItems: 'center', flex: 1 }}>
                      <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                        {perServing.fat}g
                      </Text>
                      <Text style={commonStyles.textSecondary}>Fat</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Log Servings */}
            {hasValidData && (
              <View style={commonStyles.section}>
                <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Log to Today</Text>
                
                <View style={[commonStyles.row, { marginBottom: 16 }]}>
                  <Text style={[commonStyles.text, { flex: 1, fontWeight: '600' }]}>
                    How many servings are you eating?
                  </Text>
                  <View style={{ width: 80 }}>
                    <TextInput
                      style={[commonStyles.input, { textAlign: 'center' }]}
                      value={servingsToLog}
                      onChangeText={setServingsToLog}
                      keyboardType="numeric"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>
                </View>

                <View style={commonStyles.card}>
                  <Text style={[commonStyles.text, { marginBottom: 12, fontWeight: '600' }]}>
                    You'll be logging:
                  </Text>
                  <View style={commonStyles.row}>
                    <View style={{ alignItems: 'center', flex: 1 }}>
                      <Text style={[commonStyles.text, { fontWeight: '600', fontSize: 18, color: colors.primary }]}>
                        {loggedAmount.calories}
                      </Text>
                      <Text style={commonStyles.textSecondary}>Calories</Text>
                    </View>
                    <View style={{ alignItems: 'center', flex: 1 }}>
                      <Text style={[commonStyles.text, { fontWeight: '600', color: colors.primary }]}>
                        {loggedAmount.protein}g
                      </Text>
                      <Text style={commonStyles.textSecondary}>Protein</Text>
                    </View>
                    <View style={{ alignItems: 'center', flex: 1 }}>
                      <Text style={[commonStyles.text, { fontWeight: '600', color: colors.primary }]}>
                        {loggedAmount.carbs}g
                      </Text>
                      <Text style={commonStyles.textSecondary}>Carbs</Text>
                    </View>
                    <View style={{ alignItems: 'center', flex: 1 }}>
                      <Text style={[commonStyles.text, { fontWeight: '600', color: colors.primary }]}>
                        {loggedAmount.fat}g
                      </Text>
                      <Text style={commonStyles.textSecondary}>Fat</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Save Button */}
            {hasValidData && (
              <View style={[commonStyles.section, { paddingBottom: 40 }]}>
                <Button
                  text="Log Meal"
                  onPress={savePrepMeal}
                  style={{ backgroundColor: colors.primary }}
                />
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
