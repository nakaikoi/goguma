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
  Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useItemsStore } from '../store/items-store';
import { api } from '../services/api';
import type { RootStackParamList } from '../navigation/AppNavigator';

type DraftScreenRouteProp = RouteProp<RootStackParamList, 'Draft'>;

export default function DraftScreen() {
  const route = useRoute<DraftScreenRouteProp>();
  const navigation = useNavigation();
  const { itemId } = route.params;
  const insets = useSafeAreaInsets();

  const { currentDraft, loading, fetchDraft, analyzeItem } = useItemsStore();
  const [analyzing, setAnalyzing] = useState(false);
  const [images, setImages] = useState<Array<{ id: string; url: string; orderIndex: number }>>([]);
  const [loadingImages, setLoadingImages] = useState(false);

  useEffect(() => {
    fetchDraft(itemId);
    fetchImages();
  }, [itemId]);

  const fetchImages = async () => {
    try {
      setLoadingImages(true);
      const imageList = await api.getItemImages(itemId);
      setImages(imageList);
    } catch (error: any) {
      console.error('Failed to fetch images:', error);
      // Don't show error - images might not be uploaded yet
    } finally {
      setLoadingImages(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteImage(imageId);
              // Refresh images list
              await fetchImages();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete image', [{ text: 'Cancel' }]);
            }
          },
        },
      ]
    );
  };

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      await analyzeItem(itemId);
      // Refresh images after analysis
      await fetchImages();
      Alert.alert('Success', 'AI analysis completed!', [{ text: 'Cancel' }]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to analyze item', [{ text: 'Cancel' }]);
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
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Listing Draft</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.content}>
          {images.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.label}>Uploaded Images ({images.length})</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageGallery}>
                {images.map((image) => (
                  <Image
                    key={image.id}
                    source={{ uri: image.url }}
                    style={styles.thumbnail}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {loadingImages && (
            <View style={styles.center}>
              <ActivityIndicator size="small" />
              <Text style={styles.loadingText}>Loading images...</Text>
            </View>
          )}

          {!loadingImages && images.length === 0 && (
            <View style={styles.center}>
              <Text style={styles.emptyText}>No images uploaded yet</Text>
              <Text style={styles.emptySubtext}>
                Go back to upload images
              </Text>
            </View>
          )}

          {images.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.emptyText}>No draft yet</Text>
              <Text style={styles.emptySubtext}>
                Analyze images to generate a listing draft
              </Text>
              <TouchableOpacity style={styles.analyzeButton} onPress={handleAnalyze}>
                <Text style={styles.analyzeButtonText}>Analyze Item</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Listing Draft</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        {images.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Images ({images.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageGallery}>
              {images.map((image) => (
                <View key={image.id} style={styles.imageWrapper}>
                  <Image
                    source={{ uri: image.url }}
                    style={styles.thumbnail}
                  />
                  <TouchableOpacity
                    style={styles.deleteImageButton}
                    onPress={() => handleDeleteImage(image.id)}
                  >
                    <Text style={styles.deleteImageButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

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
  imageGallery: {
    marginTop: 8,
  },
  thumbnail: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  deleteImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  deleteImageButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
});

