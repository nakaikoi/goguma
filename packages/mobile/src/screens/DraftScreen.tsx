/**
 * Draft screen - view and edit AI-generated listing draft
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useItemsStore } from '../store/items-store';
import type { RootStackParamList } from '../navigation/AppNavigator';

type DraftScreenRouteProp = RouteProp<RootStackParamList, 'Draft'>;

export default function DraftScreen() {
  const route = useRoute<DraftScreenRouteProp>();
  const navigation = useNavigation();
  const { itemId } = route.params;

  const { currentDraft, loading, fetchDraft, analyzeItem } = useItemsStore();
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchDraft(itemId);
  }, [itemId]);

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      await analyzeItem(itemId);
      Alert.alert('Success', 'AI analysis completed!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to analyze item');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading || analyzing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          {analyzing ? 'Analyzing images with AI...' : 'Loading...'}
        </Text>
      </View>
    );
  }

  if (!currentDraft) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Listing Draft</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.center}>
          <Text style={styles.emptyText}>No draft yet</Text>
          <Text style={styles.emptySubtext}>
            Upload images and analyze to generate a listing draft
          </Text>
          <TouchableOpacity style={styles.analyzeButton} onPress={handleAnalyze}>
            <Text style={styles.analyzeButtonText}>Analyze Item</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Listing Draft</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Title</Text>
          <Text style={styles.value}>{currentDraft.title}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <Text style={styles.value}>{currentDraft.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Condition</Text>
          <Text style={styles.value}>{currentDraft.condition}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Pricing</Text>
          <Text style={styles.value}>
            ${currentDraft.pricing.suggested.toFixed(2)} (Range: ${currentDraft.pricing.min.toFixed(2)} - ${currentDraft.pricing.max.toFixed(2)})
          </Text>
          <Text style={styles.confidence}>
            Confidence: {(currentDraft.pricing.confidence * 100).toFixed(0)}%
          </Text>
        </View>

        {currentDraft.itemSpecifics && Object.keys(currentDraft.itemSpecifics).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Item Specifics</Text>
            {Object.entries(currentDraft.itemSpecifics).map(([key, value]) => (
              <Text key={key} style={styles.value}>
                {key}: {String(value)}
              </Text>
            ))}
          </View>
        )}

        {currentDraft.keywords && currentDraft.keywords.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Keywords</Text>
            <Text style={styles.value}>{currentDraft.keywords.join(', ')}</Text>
          </View>
        )}

        {currentDraft.visibleFlaws && currentDraft.visibleFlaws.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Visible Flaws</Text>
            {currentDraft.visibleFlaws.map((flaw, index) => (
              <Text key={index} style={styles.value}>• {flaw}</Text>
            ))}
          </View>
        )}

        {currentDraft.aiConfidence && (
          <View style={styles.section}>
            <Text style={styles.label}>AI Confidence</Text>
            <Text style={styles.value}>
              {(currentDraft.aiConfidence * 100).toFixed(0)}%
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 16,
    color: '#000',
    lineHeight: 24,
  },
  confidence: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  analyzeButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

