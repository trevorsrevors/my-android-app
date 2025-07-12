import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servings: number;
  timestamp: number;
  type: 'custom' | 'prepped';
}

export interface DailyLog {
  date: string; // YYYY-MM-DD format
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface UserSettings {
  dailyCalorieGoal: number;
}

export interface SavedRecipe {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients?: any[]; // Optional ingredients list
  createdAt: number;
}

export interface HistoryEntry {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  meals: Meal[];
  vaultedAt: number;
}

class StorageManager {
  private readonly DAILY_LOG_PREFIX = 'daily_log_';
  private readonly USER_SETTINGS_KEY = 'user_settings';
  private readonly SAVED_RECIPES_KEY = 'saved_recipes';
  private readonly HISTORY_KEY = 'history_entries';

  // Get daily log for a specific date
  async getDailyLog(date: string): Promise<DailyLog> {
    try {
      const key = `${this.DAILY_LOG_PREFIX}${date}`;
      const stored = await AsyncStorage.getItem(key);
      
      if (stored) {
        const log: DailyLog = JSON.parse(stored);
        return log;
      }
      
      // Return empty log for new day
      return {
        date,
        meals: [],
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
      };
    } catch (error) {
      console.error('Error getting daily log:', error);
      return {
        date,
        meals: [],
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
      };
    }
  }

  // Save a meal to today's log
  async saveMeal(meal: Meal): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const dailyLog = await this.getDailyLog(today);
      
      // Add meal to the log
      dailyLog.meals.push(meal);
      
      // Recalculate totals
      this.recalculateTotals(dailyLog);
      
      // Save updated log
      const key = `${this.DAILY_LOG_PREFIX}${today}`;
      await AsyncStorage.setItem(key, JSON.stringify(dailyLog));
      
      console.log('Meal saved successfully:', meal.name);
    } catch (error) {
      console.error('Error saving meal:', error);
      throw error;
    }
  }

  // Remove a meal from a specific day
  async removeMeal(date: string, mealId: string): Promise<void> {
    try {
      const dailyLog = await this.getDailyLog(date);
      
      // Filter out the meal
      dailyLog.meals = dailyLog.meals.filter(meal => meal.id !== mealId);
      
      // Recalculate totals
      this.recalculateTotals(dailyLog);
      
      // Save updated log
      const key = `${this.DAILY_LOG_PREFIX}${date}`;
      await AsyncStorage.setItem(key, JSON.stringify(dailyLog));
      
      console.log('Meal removed successfully');
    } catch (error) {
      console.error('Error removing meal:', error);
      throw error;
    }
  }

  // Get user settings
  async getUserSettings(): Promise<UserSettings> {
    try {
      const stored = await AsyncStorage.getItem(this.USER_SETTINGS_KEY);
      
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Return default settings
      return {
        dailyCalorieGoal: 2000,
      };
    } catch (error) {
      console.error('Error getting user settings:', error);
      return {
        dailyCalorieGoal: 2000,
      };
    }
  }

  // Save user settings
  async saveUserSettings(settings: UserSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(this.USER_SETTINGS_KEY, JSON.stringify(settings));
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  // Save a recipe (from custom meal creation)
  async saveRecipe(recipe: SavedRecipe): Promise<void> {
    try {
      console.log('Attempting to save recipe:', recipe);
      const stored = await AsyncStorage.getItem(this.SAVED_RECIPES_KEY);
      const recipes: SavedRecipe[] = stored ? JSON.parse(stored) : [];
      
      recipes.push(recipe);
      
      await AsyncStorage.setItem(this.SAVED_RECIPES_KEY, JSON.stringify(recipes));
      console.log('Recipe saved successfully:', recipe.name);
      console.log('Total recipes now:', recipes.length);
    } catch (error) {
      console.error('Error saving recipe:', error);
      throw error;
    }
  }

  // Get all saved recipes
  async getSavedRecipes(): Promise<SavedRecipe[]> {
    try {
      console.log('Getting saved recipes...');
      const stored = await AsyncStorage.getItem(this.SAVED_RECIPES_KEY);
      const recipes = stored ? JSON.parse(stored) : [];
      console.log('Found recipes:', recipes.length, recipes);
      return recipes;
    } catch (error) {
      console.error('Error getting saved recipes:', error);
      return [];
    }
  }

  // Delete a saved recipe
  async deleteRecipe(recipeId: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.SAVED_RECIPES_KEY);
      const recipes: SavedRecipe[] = stored ? JSON.parse(stored) : [];
      
      const filteredRecipes = recipes.filter(recipe => recipe.id !== recipeId);
      
      await AsyncStorage.setItem(this.SAVED_RECIPES_KEY, JSON.stringify(filteredRecipes));
      console.log('Recipe deleted successfully');
    } catch (error) {
      console.error('Error deleting recipe:', error);
      throw error;
    }
  }

  // Vault today's data to history and clear daily log
  async vaultTodayAndReset(): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const dailyLog = await this.getDailyLog(today);
      
      // Only vault if there's data to save
      if (dailyLog.meals.length > 0) {
        const historyEntry: HistoryEntry = {
          date: dailyLog.date,
          totalCalories: dailyLog.totalCalories,
          totalProtein: dailyLog.totalProtein,
          totalCarbs: dailyLog.totalCarbs,
          totalFat: dailyLog.totalFat,
          meals: dailyLog.meals,
          vaultedAt: Date.now(),
        };

        // Get existing history
        const stored = await AsyncStorage.getItem(this.HISTORY_KEY);
        const history: HistoryEntry[] = stored ? JSON.parse(stored) : [];
        
        // Add new entry
        history.push(historyEntry);
        
        // Save updated history
        await AsyncStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
      }
      
      // Clear today's log
      const key = `${this.DAILY_LOG_PREFIX}${today}`;
      await AsyncStorage.removeItem(key);
      
      console.log('Data vaulted and daily log reset');
    } catch (error) {
      console.error('Error vaulting data:', error);
      throw error;
    }
  }

  // Get history entries
  async getHistory(): Promise<HistoryEntry[]> {
    try {
      const stored = await AsyncStorage.getItem(this.HISTORY_KEY);
      const history: HistoryEntry[] = stored ? JSON.parse(stored) : [];
      
      // Sort by date (newest first)
      history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      return history;
    } catch (error) {
      console.error('Error getting history:', error);
      return [];
    }
  }

  // Get all daily logs (for history/export features)
  async getAllDailyLogs(): Promise<DailyLog[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const logKeys = keys.filter(key => key.startsWith(this.DAILY_LOG_PREFIX));
      
      const logs: DailyLog[] = [];
      
      for (const key of logKeys) {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          logs.push(JSON.parse(stored));
        }
      }
      
      // Sort by date (newest first)
      logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      return logs;
    } catch (error) {
      console.error('Error getting all daily logs:', error);
      return [];
    }
  }

  // Clear all data (for debugging/reset)
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.clear();
      console.log('All data cleared');
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }

  // Helper method to recalculate daily totals
  private recalculateTotals(dailyLog: DailyLog): void {
    const totals = dailyLog.meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    dailyLog.totalCalories = Math.round(totals.calories);
    dailyLog.totalProtein = Math.round(totals.protein * 10) / 10;
    dailyLog.totalCarbs = Math.round(totals.carbs * 10) / 10;
    dailyLog.totalFat = Math.round(totals.fat * 10) / 10;
  }
}

// Export singleton instance
export const storageManager = new StorageManager();
