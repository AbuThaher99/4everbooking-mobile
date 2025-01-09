import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    FlatList,
    Image,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { BASE_URL } from '../assets/constant/ip';
import { AuthContext } from '../store/auth-context';
import { useRoute, useNavigation, useIsFocused } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import * as FileSystem from 'expo-file-system';

const UpdateHallScreen = () => {
    const [hallDetails, setHallDetails] = useState(null);
    const [newImages, setNewImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState({});
    const [services, setServices] = useState({});
    const authCtx = useContext(AuthContext);
    const route = useRoute();
    const navigation = useNavigation();
    const { hallId } = route.params;
    const isFocused = useIsFocused();
    const userData = useSelector((state) => state.bookedHalls.userData);

    // Predefined categories
    const predefinedCategories = {
        WEDDINGS: 0,
        BIRTHDAYS: 0,
        MEETINGS: 0,
        PARTIES: 0,
        FUNERALS: 0,
    };

    const fetchHallDetails = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/whitelist/${hallId}`);
            const hallData = response.data;

            // Ensure all categories are present
            const updatedCategories = { ...predefinedCategories, ...hallData.categories };
            setCategories(updatedCategories);

            setServices(hallData.services || {});
            setHallDetails(hallData);
        } catch (error) {
            console.error('Error fetching hall details:', error);
            Alert.alert('Error', 'Failed to fetch hall details.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateHall = async () => {
        if (!hallDetails) return;

        const updatedData = {
            id: hallDetails.id,
            name: hallDetails.name,
            location: hallDetails.location,
            capacity: hallDetails.capacity,
            price: hallDetails.price,
            description: hallDetails.description,
            phone: hallDetails.phone,
            services: services,
            categories: categories,
            longitude: hallDetails.longitude,
            latitude: hallDetails.latitude,
        };

        try {
            setLoading(true);
            await axios.put(`${BASE_URL}/hallOwner/${userData.id}`, updatedData, {
                headers: {
                    Authorization: `Bearer ${authCtx.token}`,
                    'Content-Type': 'application/json',
                },
            });
            Alert.alert('Success', 'Hall updated successfully.');
            navigation.goBack();
        } catch (error) {
            console.error('Error updating hall:', error);
            Alert.alert('Error', 'Failed to update hall.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteImage = async (imageUrl) => {
        try {
            await axios.delete(`${BASE_URL}/hallOwner/${hallId}/delete-image`, {
                params: { imageUrl },
                headers: { Authorization: `Bearer ${authCtx.token}` },
            });
            setHallDetails((prev) => ({
                ...prev,
                image: prev.image
                    .split(', ')
                    .filter((url) => url !== imageUrl)
                    .join(','),
            }));
            Alert.alert('Success', 'Image deleted successfully.');
        } catch (error) {
            console.error('Error deleting image:', error);
            Alert.alert('Error', 'Failed to delete image.');
        }
    };



    const handleAddImages = async () => {
        if (newImages.length === 0) {
            Alert.alert('No Images', 'Please select images to upload.');
            return;
        }

        const formData = new FormData();

        newImages.forEach((file, index) => {
            formData.append('image', {
                uri: file.uri,
                name: file.fileName || `image_${index}.jpg`, // Fallback name
                type: file.type || 'image/jpeg',            // Fallback type
            });
        });

        console.log('FormData Parts:', formData._parts);

        try {
            setLoading(true);

            const response = await fetch(`${BASE_URL}/hallOwner/${hallId}/add-image`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authCtx.token}`,
                },
                body: formData,
            });

            console.log('Response Status:', response.status);
            console.log('Response OK:', response.ok);

            if (!response.ok) {
                throw new Error('Failed to upload images');
            }

            const responseData = await response.json(); // Assuming the server returns JSON
            console.log('Upload Response:', responseData);

            // Update hallDetails with the new image URLs
            const newImageUrls = responseData.imageUrls; // Adjust based on server response
            setHallDetails((prev) => ({
                ...prev,
                image: prev.image ? `${prev.image}, ${newImageUrls}` : newImageUrls,
            }));

            setNewImages([]); // Clear the new images array after successful upload
            Alert.alert('Success', 'Images uploaded successfully.');
        } catch (error) {
            console.error('Error uploading images:', error);
            Alert.alert('Error', 'Failed to upload images.');
        } finally {
            setLoading(false);
        }
    };
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 1,
        });

        if (!result.canceled) {
            setNewImages((prev) => [...prev, ...result.assets]);
        }
    };

    const handleAddService = () => {
        setServices({ ...services, newService: 0 });
    };

    const handleRemoveService = (key) => {
        const updatedServices = { ...services };
        delete updatedServices[key];
        setServices(updatedServices);
    };

    useEffect(() => {
        fetchHallDetails();
    }, []);

    if (loading || !hallDetails) {
        return <Text>Loading...</Text>;
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Update Hall</Text>
            <View style={styles.section}>
                <Text style={styles.label}>Hall Name</Text>
                <TextInput
                    style={styles.input}
                    value={hallDetails.name}
                    onChangeText={(value) => setHallDetails({ ...hallDetails, name: value })}
                />
            </View>
            <View style={styles.section}>
                <Text style={styles.label}>Location</Text>
                <TextInput
                    style={styles.input}
                    value={hallDetails.location}
                    onChangeText={(value) => setHallDetails({ ...hallDetails, location: value })}
                />
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: hallDetails.latitude,
                        longitude: hallDetails.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                    onPress={(e) =>
                        setHallDetails({
                            ...hallDetails,
                            latitude: e.nativeEvent.coordinate.latitude,
                            longitude: e.nativeEvent.coordinate.longitude,
                        })
                    }
                >
                    <Marker
                        coordinate={{
                            latitude: hallDetails.latitude,
                            longitude: hallDetails.longitude,
                        }}
                    />
                </MapView>
            </View>
            <View style={styles.section}>
                <Text style={styles.label}>Services</Text>
                {Object.entries(services).map(([key, value], index) => (
                    <View key={index} style={styles.serviceRow}>
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            value={key}
                            onChangeText={(serviceName) => {
                                const updatedServices = { ...services };
                                updatedServices[serviceName] = updatedServices[key];
                                delete updatedServices[key];
                                setServices(updatedServices);
                            }}
                        />
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            value={String(value)}
                            keyboardType="numeric"
                            onChangeText={(price) => {
                                setServices({ ...services, [key]: parseInt(price) });
                            }}
                        />
                        <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => handleRemoveService(key)}
                        >
                            <Text style={styles.removeButtonText}>Remove</Text>
                        </TouchableOpacity>
                    </View>
                ))}
                <TouchableOpacity style={styles.addButton} onPress={handleAddService}>
                    <Text style={styles.addButtonText}>Add Service</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.section}>
                <Text style={styles.label}>Categories</Text>
                {Object.entries(categories).map(([key, value]) => (
                    <View key={key} style={styles.categoryRow}>
                        <Text>{key}</Text>
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            value={String(value)}
                            keyboardType="numeric"
                            onChangeText={(price) =>
                                setCategories({ ...categories, [key]: parseFloat(price) })
                            }
                        />
                    </View>
                ))}
            </View>
            <View style={styles.section}>
                <Text style={styles.label}>Existing Images</Text>
                <FlatList
                    data={hallDetails.image.trim().split(', ')}
                    horizontal
                    renderItem={({ item }) => (
                        <View style={styles.imageContainer}>
                            <Image source={{ uri: item }} style={styles.image} />
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => handleDeleteImage(item)}
                            >
                                <Text style={styles.deleteButtonText}>X</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            </View>
            <View style={styles.section}>
                <Text style={styles.label}>Add New Images</Text>
                <TouchableOpacity style={styles.addButton} onPress={pickImage}>
                    <Text style={styles.addButtonText}>Pick Images</Text>
                </TouchableOpacity>
                {newImages.length > 0 && (
                    <TouchableOpacity style={styles.addButton} onPress={handleAddImages}>
                        <Text style={styles.addButtonText}>Upload Images</Text>
                    </TouchableOpacity>
                )}
            </View>
            <TouchableOpacity style={styles.updateButton} onPress={handleUpdateHall}>
                <Text style={styles.updateButtonText}>Update Hall</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f8f8f8',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    section: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 8,
        backgroundColor: '#fff',
    },
    serviceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    map: {
        height: 200,
        borderRadius: 8,
        marginTop: 8,
    },
    removeButton: {
        marginLeft: 8,
        backgroundColor: '#e74c3c',
        padding: 8,
        borderRadius: 8,
    },
    removeButtonText: {
        color: '#fff',
    },
    addButton: {
        marginTop: 8,
        backgroundColor: '#3498db',
        padding: 12,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#fff',
        textAlign: 'center',
    },
    imageContainer: {
        position: 'relative',
        marginRight: 8,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    deleteButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: 'red',
        borderRadius: 8,
        padding: 4,
    },
    deleteButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    updateButton: {
        backgroundColor: '#28a745',
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
    },
    updateButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default UpdateHallScreen;
