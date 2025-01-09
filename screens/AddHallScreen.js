import React, {useContext, useState} from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {Button, Checkbox, TextInput} from "react-native-paper";
import {SafeAreaView} from "react-native-safe-area-context";
import axios from "axios";
import {useSelector} from "react-redux";
import * as DocumentPicker from 'expo-document-picker';
import {AuthContext} from "../store/auth-context";
import {BASE_URL} from "../assets/constant/ip";
import MapView, { Marker } from "react-native-maps";




export function AddHallScreen() {
    const [hallName, setHallName] = useState("");
    const [location, setLocation] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [capacity, setCapacity] = useState(0);
    const [about, setAbout] = useState("");
    const [price, setPrice] = useState(0.0);
    const [longitude, setLongitude] = useState("");
    const [latitude, setLatitude] = useState("");
    const [services, setServices] = useState({});
    const authCtx = useContext(AuthContext);
    const [categories, setCategories] = useState({
        WEDDINGS: {selected: false, price: 0.0},
        BIRTHDAYS: {selected: false, price: 0.0},
        MEETINGS: {selected: false, price: 0.0},
        PARTIES: {selected: false, price: 0.0},
        FUNERALS: {selected: false, price: 0.0},
    });
    const [image, setImage] = useState(null);
    const [imageFormData, setImageFormData] = useState(null);
    const [proofFile, setProofFile] = useState(null);
    const userData = useSelector((state) => state.bookedHalls.userData);
    const [selectedLocation, setSelectedLocation] = useState();


    const handlePickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            // Create FormData and append the image
            const formData = new FormData();

            const uri = result.assets[0].uri;
            const type = result.assets[0].type; // e.g., 'image/jpeg'
            const name = uri.split('/').pop(); // Extract file name from the URI
            console.log("type ", type)
            console.log("name ", name)

            // Convert URI to a file object and append to formData
            const file = {
                uri: uri,
                type: type,
                name: name,
            };

            formData.append("images", file); // Append image to FormData

            // Optionally, you can set formData to the state or use it in an API request
            setImage(uri);
            setImageFormData(formData)
            console.log(formData)
            console.log("file ", file)
        }
    };

    function selectLocationHandler(event) {
        const lat = event.nativeEvent.coordinate.latitude;
        const lng = event.nativeEvent.coordinate.longitude;

        setSelectedLocation({ lat: lat, lng: lng });
    }


    // const handlePickImage = async () => {
    //     try {
    //         // Step 1: Launch the Image Picker
    //         let result = await ImagePicker.launchImageLibraryAsync({
    //             mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //             allowsEditing: true,
    //             aspect: [4, 3],
    //             quality: 1,
    //         });
    //
    //         if (!result.canceled) {
    //             const localUri = result.assets[0].uri;
    //
    //             // Step 2: Convert the Image to Base64
    //             const response = await fetch(localUri);
    //             const blob = await response.blob();
    //             const reader = new FileReader();
    //
    //             reader.readAsDataURL(blob);
    //             reader.onloadend = async () => {
    //                 const base64String = reader.result.split(',')[1]; // Get base64 part
    //
    //                 // Step 3: Prepare Payload
    //                 const payload = {
    //                     images: [base64String], // Array of base64 strings
    //                 };
    //
    //                 // Step 4: Upload Image to the Server
    //                 try {
    //                     const uploadResponse = await fetch(
    //                         'http://192.168.191.51:8080/hallOwner/uploadImageToHall',
    //                         {
    //                             method: 'POST',
    //                             headers: {
    //                                 'Content-Type': 'application/json',
    //                                 Accept: '*/*',
    //                             },
    //                             body: JSON.stringify(payload),
    //                         }
    //                     );
    //
    //                     if (uploadResponse.ok) {
    //                         const uploadedData = await uploadResponse.json();
    //                         console.log('Upload successful:', uploadedData);
    //
    //                         // Assuming the server returns the image URL
    //                         const uploadedImageUrl = uploadedData.url; // Replace with actual key if different
    //                         setImage(uploadedImageUrl);
    //                     } else {
    //                         console.error('Image upload failed:', uploadResponse.status);
    //                         Alert.alert('Error', 'Failed to upload image. Please try again.');
    //                     }
    //                 } catch (error) {
    //                     console.error('Error uploading image:', error);
    //                     Alert.alert('Error', 'An unexpected error occurred during upload.');
    //                 }
    //             };
    //         } else {
    //             console.log('Image picker was canceled.');
    //         }
    //     } catch (error) {
    //         console.error('Error picking image:', error);
    //         Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    //     }
    // };


    // const handlePickImage = async () => {
    //     try {
    //         const result = await ImagePicker.launchImageLibraryAsync({
    //             mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //             allowsEditing: true,
    //             aspect: [4, 3],
    //             quality: 1,
    //         });
    //
    //         if (!result.canceled) {
    //             const localUri = result.assets[0].uri;
    //
    //             // Upload the image immediately
    //             const response = await fetch('http://192.168.191.51:8080/hallOwner/uploadImageToHall', {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                 },
    //                 body: JSON.stringify({
    //                     images: [localUri], // Make sure this is base64-encoded if required
    //                 }),
    //             });
    //
    //             if (response.ok) {
    //                 const responseData = await response.json();
    //                 const uploadedImageUrl = responseData[0]; // Adjust based on server response
    //
    //                 setImage(uploadedImageUrl); // Save the server URL directly
    //                 console.log("Image uploaded and URL set:", uploadedImageUrl);
    //             } else {
    //                 throw new Error(`Image upload failed with status: ${response.status}`);
    //             }
    //         }
    //     } catch (error) {
    //         console.error("Error picking or uploading image:", error);
    //         Alert.alert("Error", "Failed to upload the image. Please try again.");
    //     }
    // };





    const handleAddService = () => {
        const newServiceName = "";
        setServices((prevServices) => ({
            ...prevServices,
            [newServiceName]: 0,
        }));
    };

    const handleServiceChange = (serviceName, field, value) => {
        setServices((prevServices) => {
            const currentPrice = prevServices[serviceName] || 0;

            if (field === "name") {
                const updatedServices = {...prevServices};
                delete updatedServices[serviceName];
                updatedServices[value] = currentPrice;
                return updatedServices;
            }

            return {
                ...prevServices,
                [serviceName]: parseFloat(value) || 0,
            };
        });

        console.log(services);
    };


    const handleDeleteService = (serviceName) => {
        setServices((prevServices) => {
            const updatedServices = {...prevServices};
            delete updatedServices[serviceName];
            return updatedServices;
        });
    };


    const handlePickProofFile = async () => {
        try {
            const result = await DocumentPicker.pick({
                type: [DocumentPicker.types.allFiles], // Allow all file types
            });

            console.log("Selected File:", result);

            // If picking multiple files
            if (Array.isArray(result) && result.length > 0) {
                setProofFile(result[0].uri); // Use the first file
            } else {
                setProofFile(result.uri); // Single file selection
            }
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                console.log("File selection canceled");
            } else {
                console.error("Error picking file:", err);
            }
        }
    };

    const handleCategoryChange = (category, selected) => {
        setCategories((prevCategories) => ({
            ...prevCategories,
            [category]: {
                ...prevCategories[category],
                selected,
            },
        }));
    };

    const handleCategoryPriceChange = (category, price) => {
        setCategories((prevCategories) => ({
            ...prevCategories,
            [category]: {
                ...prevCategories[category],
                price,
            },

        }));
    };

    // const handleSubmit = async () => {
    //     if (!hallName || !location || !phoneNumber || !capacity || !about || !price || !longitude || !latitude) {
    //         Alert.alert("Error", "Please fill in all fields and select required files.");
    //         return;
    //     }
    //
    //     const selectedCategories = Object.entries(categories)
    //         .filter(([_, value]) => value.selected)
    //         .reduce((acc, [key, value]) => {
    //             acc[key] = value.price;
    //             return acc;
    //         }, {});
    //
    //     const newHallData = {
    //         name: hallName,
    //         location,
    //         phone: phoneNumber,
    //         capacity,
    //         description: about,
    //         price,
    //         longitude,
    //         latitude,
    //         services,
    //         categories: selectedCategories,
    //         image: `http://192.168.191.51:8080/HallImage/${image}`,
    //         proofFile: `http://192.168.191.51:8080/proofHalls/${proofFile}`,
    //     };
    //     console.log(selectedCategories)
    //     console.log(newHallData)
    //     try {
    //         const response = await axios.post("http://192.168.191.51:8080/hallOwner/addHall", {
    //             newHallData,
    //             hallOwner: {
    //                 id: userData.id
    //             },
    //         });
    //         console.log("API Response:", response.data);
    //         Alert.alert("Success", "Hall added successfully!");
    //     } catch (error) {
    //         console.error("API Error:", error);
    //         Alert.alert("Error", "Failed to add hall. Please try again.");
    //     }
    // };


    const handleSubmit = async () => {
        if (!hallName || !location || !phoneNumber || !capacity || !about || !price || !longitude || !latitude) {
            Alert.alert("Error", "Please fill in all fields and select required files.");
            return;
        }

        const selectedCategories = Object.entries(categories)
            .filter(([_, value]) => value.selected)
            .reduce((acc, [key, value]) => {
                acc[key] = value.price;
                return acc;
            }, {});

        console.log(selectedCategories)
        console.log("IMMMMMAAGEEEE  ",image)


        const uploadResponse = await fetch(
            "http://localhost:8080/hallOwner/uploadImageToHall",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${authCtx.token}`, // Pass the token for authentication
                },
                body: imageFormData, // Send formData with images
            }
        );

        if (!uploadResponse.ok) {
            throw new Error("Failed to upload images");
        }

        const imageUrls = await uploadResponse.text(); // Expect the backend to return a string of image URLs


        const newHallData = {
            name: hallName,
            location,
            phone: phoneNumber,
            capacity: parseInt(capacity, 10),
            description: about,
            price: parseFloat(price),
            longitude: parseFloat(longitude),
            latitude: parseFloat(latitude),
            services,
            categories: selectedCategories,
            image: imageUrls,
            proofFile: `http://192.168.191.51:8080/proofHalls/${proofFile}`,
            hallOwner: {
                id: userData.id,
            },
        };

        console.log("Payload being sent to API:", newHallData);

        try {
            const response = await axios.post(`${BASE_URL}}/hallOwner/addHall`, newHallData, {
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authCtx.token}`,
                },
            });
            console.log("API Response:", response.data);
            Alert.alert("Success", "Hall added successfully!");
        } catch (error) {
            console.error("API Error:", error);
            Alert.alert("Error", "Failed to add hall. Please try again.");
        }
    };

    return (
        <SafeAreaView style={{flex: 1, paddingHorizontal: 10}}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{flex: 1}}
            >
                <ScrollView contentContainerStyle={{flexGrow: 1}}>
                    <Text style={styles.title}>Add New Hall</Text>

                    <TextInput
                        label="Hall Name"
                        value={hallName}
                        onChangeText={setHallName}
                        style={styles.input}
                        mode="outlined"
                    />

                    <TextInput
                        label="Location"
                        value={location}
                        onChangeText={setLocation}
                        style={styles.input}
                        mode="outlined"
                    />

                    <TextInput
                        label="Phone Number"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        style={styles.input}
                        mode="outlined"
                        keyboardType="phone-pad"
                    />

                    <TextInput
                        label="Capacity"
                        value={capacity.toString()}
                        onChangeText={(text) => setCapacity(parseInt(text) || 0)}
                        style={styles.input}
                        mode="outlined"
                        keyboardType="numeric"
                    />


                    <TextInput
                        label="About the Hall"
                        value={about}
                        onChangeText={setAbout}
                        style={styles.textArea}
                        mode="outlined"
                        multiline
                    />

                    <TextInput
                        label="Price"
                        value={price.toString()}
                        onChangeText={(text) => setPrice(parseFloat(text) || 0)}
                        style={styles.input}
                        mode="outlined"
                        keyboardType="numeric"
                    />

                    <MapView
                        style={styles.map}
                        initialRegion={region}
                        onPress={selectLocationHandler}
                    >
                        {selectedLocation && (
                            <Marker
                                title="Picked Location"
                                coordinate={{
                                    latitude: selectedLocation.lat,
                                    longitude: selectedLocation.lng,
                                }}
                            />
                        )}
                    </MapView>

                    <TextInput
                        label="Longitude"
                        value={longitude}
                        onChangeText={setLongitude}
                        style={styles.input}
                        mode="outlined"
                        keyboardType="numeric"
                    />

                    <TextInput
                        label="Latitude"
                        value={latitude}
                        onChangeText={setLatitude}
                        style={styles.input}
                        mode="outlined"
                        keyboardType="numeric"
                    />

                    <View style={styles.serviceContainer}>
                        <Text style={styles.subtitle}>Services</Text>
                        {Object.entries(services).map(([serviceName, servicePrice], index) => (
                            <View key={index} style={styles.serviceItem}>
                                <TextInput
                                    label="Service Name"
                                    value={serviceName}
                                    onChangeText={(text) => handleServiceChange(serviceName, "name", text)}
                                    style={styles.serviceInput}
                                    mode="outlined"
                                />
                                <TextInput
                                    label="Service Price"
                                    value={servicePrice.toString()}
                                    onChangeText={(text) =>
                                        handleServiceChange(serviceName, "price", parseFloat(text) || "")
                                    }
                                    style={styles.serviceInput}
                                    mode="outlined"
                                    keyboardType="numeric"
                                />
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDeleteService(serviceName)}
                                >
                                    <Text style={styles.deleteButtonText}>❌</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                        <Button mode="contained" onPress={handleAddService} style={styles.addServiceButton}>
                            Add Service
                        </Button>
                    </View>



                    <View style={styles.categoriesContainer}>
                        <Text style={styles.subtitle}>Categories</Text>
                        {Object.keys(categories).map((category) => (
                            <View key={category} style={styles.categoryItem}>
                                <View
                                    style={[styles.checkboxWrapper, categories[category].selected && styles.checkboxSelected]}>
                                    <Checkbox
                                        status={categories[category].selected ? "checked" : "unchecked"}
                                        onPress={() =>
                                            handleCategoryChange(category, !categories[category].selected)
                                        }
                                    />
                                </View>

                                <Text style={styles.categoryLabel}>{category}</Text>
                                {categories[category].selected && (
                                    <TextInput
                                        label="Price"
                                        value={categories[category].price}
                                        onChangeText={(price) => handleCategoryPriceChange(category, parseInt(price))}
                                        style={styles.categoryPriceInput}
                                        mode="outlined"
                                        keyboardType="numeric"
                                    />
                                )}
                            </View>
                        ))}
                    </View>

                    <Button
                        mode="outlined"
                        onPress={handlePickImage}
                        style={styles.imagePickerButton}
                        labelStyle={styles.imagePickerButtonText}
                    >
                        {image ? "Change Image" : "Pick an Image"}
                    </Button>

                    {image && <Image source={{uri: image}} style={styles.imagePreview}/>}
                    <Button
                        mode="outlined"
                        onPress={handlePickProofFile}
                        style={styles.proofPickerButton}
                        labelStyle={styles.proofPickerButtonText}
                    >
                        {proofFile ? "Change Proof File" : "Pick Proof File"}
                    </Button>

                    <Button mode="contained" onPress={handleSubmit} style={styles.submitButton}>
                        Submit
                    </Button>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: "#f4f4f4",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
    },
    input: {
        marginBottom: 12,
        backgroundColor: "#ffffff",
    },
    textArea: {
        marginBottom: 12,
        backgroundColor: "#ffffff",
        height: 100,
    },
    serviceContainer: {
        marginVertical: 16,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 8,
    },
    addButton: {
        marginTop: 8,
    },
    categoriesContainer: {
        marginVertical: 16,
    },
    categoryItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    categoryLabel: {
        flex: 1,
        fontSize: 16,
    },
    categoryPriceInput: {
        width: 100,
        marginLeft: 8,
        backgroundColor: "#ffffff",
    },
    imagePickerButton: {
        marginVertical: 16,
    },
    imagePickerButtonText: {
        fontSize: 16,
    },
    imagePreview: {
        width: "100%",
        height: 200,
        resizeMode: "cover",
        borderRadius: 8,
        marginBottom: 16,
    },
    proofPickerButton: {
        marginBottom: 16,
    },
    proofPickerButtonText: {
        fontSize: 16,
    },
    submitButton: {
        marginTop: 24,
    },
    checkboxWrapper: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 4,
        padding: 4,
        marginRight: 8,
    },
    checkboxSelected: {
        borderColor: "d9a773"
    },
    serviceItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    serviceInput: {
        flex: 1,
        marginRight: 8,
        backgroundColor: "#ffffff",
    },
    deleteButton: {
        backgroundColor: "#ffcccc",
        padding: 8,
        borderRadius: 4,
        justifyContent: "center",
        alignItems: "center",
    },
    deleteButtonText: {
        color: "#ff0000",
        fontSize: 16,
        fontWeight: "bold",
    },

    map: {
        flex: 1,
    },

});

export default AddHallScreen;
