import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from '../components/Icon';
import { storageManager, HistoryEntry } from '../utils/storage';

export default function History() {
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const history = await storageManager.getHistory();
      setHistoryEntries(history);
      setLoading(false);
    } catch (error) {
      console.error('Error loading history:', error);
      setLoading(false);
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
              History
            </Text>
            <View style={{ width: 24 }} />
          </View>
          <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 8 }]}>
            Your vaulted daily logs
          </Text>
        </View>

        {/* History Entries */}
        <View style={commonStyles.section}>
          {historyEntries.length === 0 ? (
            <View style={[commonStyles.card, { alignItems: 'center', padding: 32 }]}>
              <Icon name="archive-outline" size={48} style={{ color: colors.textSecondary, marginBottom: 12 }} />
              <Text style={[commonStyles.text, { textAlign: 'center' }]}>No history yet</Text>
              <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 4 }]}>
                Use the vault button on the dashboard to save daily logs
              </Text>
            </View>
          ) : (
            historyEntries.map((entry) => (
              <View key={entry.date} style={[commonStyles.card, { marginBottom: 16 }]}>
                <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
                  {new Date(entry.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
                
                {/* Daily Summary */}
                <View style={[commonStyles.row, { marginBottom: 12 }]}>
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={[commonStyles.text, { fontWeight: '600', fontSize: 18 }]}>
                      {entry.totalCalories}
                    </Text>
                    <Text style={commonStyles.textSecondary}>Calories</Text>
                  </View>
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                      {entry.totalProtein}g
                    </Text>
                    <Text style={commonStyles.textSecondary}>Protein</Text>
                  </View>
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                      {entry.totalCarbs}g
                    </Text>
                    <Text style={commonStyles.textSecondary}>Carbs</Text>
                  </View>
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                      {entry.totalFat}g
                    </Text>
                    <Text style={commonStyles.textSecondary}>Fat</Text>
                  </View>
                </View>

                {/* Meals */}
                <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]}>
                  Meals ({entry.meals.length}):
                </Text>
                {entry.meals.map((meal) => (
                  <Text key={meal.id} style={[commonStyles.textSecondary, { marginLeft: 16, marginBottom: 4 }]}>
                    • {meal.name} - {meal.calories} cal
                  </Text>
                ))}
                
                <Text style={[commonStyles.textSecondary, { marginTop: 8, fontSize: 12 }]}>
                  Vaulted: {new Date(entry.vaultedAt).toLocaleString()}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
