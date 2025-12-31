/**
 * Camera screen for capturing item photos
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../services/api';
import type { RootStackParamList } from '../navigation/AppNavigator';

type CameraScreenRouteProp = RouteProp<RootStackParamList, 'Camera'>;

export default function CameraScreen() {
  const route = useRoute<CameraScreenRouteProp>();
  const navigation = useNavigation();
  const { itemId } = route.params;
  const insets = useSafeAreaInsets();

  const [permission, requestPermission] = useCameraPermissions();
  const [images, setImages] = useState<{ uri: string; type: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  const takePhoto = async () => {
    if (!permission?.granted) {
      Alert.alert('Permission needed', 'Camera permission is required', [{ text: 'Cancel' }]);
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImages([...images, result.assets[0]]);
      }
    } catch (error) {
      console.error('Camera error:', error);
    }
  };

  const pickFromLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        setImages([...images, ...result.assets]);
      }
    } catch (error) {
      console.error('Image picker error:', error);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    if (images.length === 0) {
      Alert.alert('No images', 'Please add at least one image', [{ text: 'Cancel' }]);
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      
      const imageData = images.map((img) => ({
        uri: img.uri,
        type: 'image/jpeg',
        name: `image-${Date.now()}.jpg`,
      }));

      // Upload with progress callback
      const result = await api.uploadImages(itemId, imageData, (progress) => {
        setUploadProgress(progress);
      });
      
      // Upload complete - automatically navigate to Draft screen
      // Images are processing in background, but we can navigate immediately
      navigation.navigate('Draft', { itemId });
    } catch (error: any) {
      Alert.alert('Upload failed', error.message || 'Failed to upload images', [{ text: 'Cancel' }]);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Photos</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.imageList} horizontal>
        {images.map((image, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri: image.uri }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeImage(index)}
            >
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
        {images.length < 6 && (
          <TouchableOpacity style={styles.addButton} onPress={takePhoto}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {uploading && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Upload complete!'}
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={pickFromLibrary}>
          <Text style={styles.buttonText}>Choose from Library</Text>
        </TouchableOpacity>

        {images.length > 0 && (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, uploading && styles.buttonDisabled]}
            onPress={uploadImages}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                Upload {images.length} {images.length === 1 ? 'Image' : 'Images'}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
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
  imageList: {
    padding: 16,
  },
  imageContainer: {
    marginRight: 12,
    position: 'relative',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 32,
    color: '#999',
  },
  actions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 16,
    color: '#000',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  progressContainer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

