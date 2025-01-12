import React, {useContext, useState} from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Button,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import MapView, { Marker } from "react-native-maps";
import * as ImagePicker from "expo-image-picker";
import { BASE_URL } from "../assets/constant/ip";
import DropDownPicker from "react-native-dropdown-picker";
import { KeyboardAvoidingView, Platform } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import {AuthContext} from "../store/auth-context";
import {useSelector} from "react-redux";

export default function AddHallScreen() {
  const [hallData, setHallData] = useState({
    name: "",
    capacity: "",
    phone: "",
    description: "",
    location: "",
    latitude: 31.9,
    longitude: 35.2,
    services: [{ serviceName: "", servicePrice: "" }],
    categories: [],
    images: [], // This ensures it's always an array
    proofFile: null,
  });

  const [categoryPrices, setCategoryPrices] = useState({});
  const [selectedCity, setSelectedCity] = useState("");
  const [markerPosition, setMarkerPosition] = useState({
    latitude: 31.9,
    longitude: 35.2,
  });
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [errors, setErrors] = useState({});
const [selectedCategories, setSelectedCategories] = useState([]);
const handleToggleCategory = (category) => {
  if (selectedCategories.includes(category)) {
    // Remove category if already selected
    setSelectedCategories(selectedCategories.filter((c) => c !== category));
  } else {
    // Add category to the selected list
    setSelectedCategories([...selectedCategories, category]);
  }
};
  const authCtx = useContext(AuthContext);
  const userData = useSelector((state) => state.bookedHalls.userData);

  const westBankCities = [
    "Ramallah",
    "Nablus",
    "Hebron",
    "Bethlehem",
    "Jericho",
    "Jenin",
    "Tulkarm",
    "Qalqilya",
    "Salfit",
    "Tubas",
    "Azzun",
    "Beit_Jala",
    "Beit_Sahour",
    "Dura",
    "Halhul",
    "Yatta",
  ];

  const handleInputChange = (field, value) => {
    setHallData({ ...hallData, [field]: value });
  };

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarkerPosition({ latitude, longitude });
    setHallData({ ...hallData, latitude, longitude });
  };

  const handleAddService = () => {
    setHallData({
      ...hallData,
      services: [...hallData.services, { serviceName: "", servicePrice: "" }],
    });
  };

  const handleRemoveService = (index) => {
    const updatedServices = [...hallData.services];
    updatedServices.splice(index, 1);
    setHallData({ ...hallData, services: updatedServices });
  };

  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...hallData.services];
    updatedServices[index][field] = value;
    setHallData({ ...hallData, services: updatedServices });
  };

  const handlePickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled) {
      setHallData((prevData) => ({
        ...prevData,
        images: [...prevData.images, ...result.assets], // Ensure proper merging
      }));
    }
  };


  const handlePickProof = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*", // Allows picking any file type
      });

      console.log("Picker Result:", result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0]; // Access the first file in the assets array
        setHallData((prevData) => ({
          ...prevData,
          proofFile: {
            uri: file.uri,
            name: file.name || "proof.pdf",
            type: file.mimeType || "application/pdf", // Fallback to application/pdf
          },
        }));
        Alert.alert("File Selected", `File Name: ${file.name}`);
      } else if (result.canceled) {
        Alert.alert("No file selected.");
      } else {
        throw new Error("Invalid file selection response.");
      }
    } catch (error) {
      console.error("Error picking file:", error);
      Alert.alert("Error", "Failed to pick a file.");
    }
  };


  const handleCategoryChange = (category, price) => {
    setCategoryPrices({ ...categoryPrices, [category]: price });
  };

  const validateForm = () => {
    const errors = {};
    if (!hallData.name) errors.name = "Hall name is required.";
    if (!hallData.capacity) errors.capacity = "Capacity is required.";
    if (!hallData.phone) errors.phone = "Phone number is required.";
    if (!hallData.location) errors.location = "Location is required.";
    if (!hallData.latitude || !hallData.longitude)
      errors.location = "Location is required.";
    if (!hallData.images.length) errors.images = "At least one image is required.";
    if (!hallData.proofFile) errors.proofFile = "Proof of ownership is required.";

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCityChange = (city) => {
    setHallData((prevData) => ({
      ...prevData,
      location: city, // Update the location with the selected city
    }));
  };


  const handleSubmit = async () => {
    try {
      console.log("Images before upload:", hallData.images);

      // Upload images
      const imageData = new FormData();

      if (Array.isArray(hallData.images)) {
        hallData.images.forEach((image, index) => {
          const formattedUri =
              Platform.OS === "ios" ? image.uri.replace("file://", "") : image.uri;

          // Ensure the key matches the backend's expected parameter
          imageData.append("images", {
            uri: formattedUri,
            name: `image${index}.jpg`,
            type: image.mimeType || "image/jpeg", // Default to image/jpeg if mimeType is undefined
          });
        });
      } else {
        console.error("hallData.images is not an array or is undefined");
        throw new Error("Images are missing or not properly initialized.");
      }

      const imageResponse = await fetch(`${BASE_URL}/hallOwner/uploadImageToHall`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authCtx.token}`,
        },
        body: imageData,
      });

      if (!imageResponse.ok) {
        const errorText = await imageResponse.text();
        console.error("Image Upload Error:", errorText);
        throw new Error("Failed to upload images");
      }

      const imageUrls = await imageResponse.text();
      console.log("Uploaded Image URLs:", imageUrls);


      // Upload proof
      const proofData = new FormData();

      if (hallData.proofFile) {
        const formattedProofUri =
            Platform.OS === "ios"
                ? hallData.proofFile.uri.replace("file://", "")
                : hallData.proofFile.uri;

        proofData.append("file", {
          uri: formattedProofUri,
          name: hallData.proofFile.name, // Ensure the name matches what the backend expects
          type: hallData.proofFile.type, // Ensure type is passed
        });
      } else {
        throw new Error("Proof file is missing");
      }

      const proofResponse = await fetch(`${BASE_URL}/hallOwner/uploadFileProof`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authCtx.token}`, // Include the token if needed
        },
        body: proofData,
      });

      if (!proofResponse.ok) {
        const errorText = await proofResponse.text();
        console.error("Proof Upload Error:", errorText);
        throw new Error("Failed to upload proof file");
      }

      const proofUrl = await proofResponse.text();
      console.log("Uploaded Proof URL:", proofUrl);
      console.log("Hall Data:", hallData);
      const response = await fetch(
          `${BASE_URL}/hallOwner/getHallOwnerByUserId/${userData.id}`,
          {
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${authCtx.token}`,
            },
          }
      );

      const rawData = await response.text();
      const data = rawData ? JSON.parse(rawData) : {};

      if (!response.ok) {
        throw new Error(`Failed to fetch hall owner data. Status: ${response.status}`);
      }


      // Submit hall
      const hallPayload = {
        name: hallData.name,
        capacity: parseInt(hallData.capacity, 10), // Ensure it's a number
        phone: hallData.phone,
        description: hallData.description,
        location: hallData.location,
        latitude: hallData.latitude,
        longitude: hallData.longitude,
        hallOwner: { id: data.id }, // Replace with dynamic ID if applicable
        services: hallData.services.reduce((acc, service) => {
          if (service.serviceName && service.servicePrice) {
            acc[service.serviceName] = parseFloat(service.servicePrice);
          }
          return acc;
        }, {}), // Convert services to a map
        categories: Object.fromEntries(
            Object.entries(categoryPrices).map(([key, value]) => [key.toUpperCase(), parseFloat(value)])
        ), // Convert categories to a map with uppercase keys
        image: imageUrls, // Assume `imageUrls` is a comma-separated string from backend response
        proofFile: proofUrl, // Assume `proofUrl` is from proof file upload
      };


      const hallResponse = await fetch(`${BASE_URL}/hallOwner/addHall`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authCtx.token}`,
        },
        body: JSON.stringify(hallPayload),
      });

      if (!hallResponse.ok) {
        const errorText = await hallResponse.text();
        console.error("Hall Creation Error:", errorText);
        throw new Error("Failed to create hall");
      }

      Alert.alert("Success", "Hall created successfully!");
      navigator.replace("MyHalls");
    } catch (error) {
      console.error("Error in handleSubmit:", error.message);
      Alert.alert("Error", error.message);
    }
  };




  return (
  <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add a New Hall</Text>

      {/* Basic Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <TextInput
          placeholder="Enter hall name"
          value={hallData.name}
          onChangeText={(value) => handleInputChange("name", value)}
          style={styles.input}
        />
        {errors.name && <Text style={styles.error}>{errors.name}</Text>}
        <TextInput
          placeholder="Enter capacity"
          value={hallData.capacity}
          keyboardType="numeric"
          onChangeText={(value) => handleInputChange("capacity", value)}
          style={styles.input}
        />
        {errors.capacity && <Text style={styles.error}>{errors.capacity}</Text>}
        <TextInput
          placeholder="Enter phone number"
          value={hallData.phone}
          keyboardType="phone-pad"
          onChangeText={(value) => handleInputChange("phone", value)}
          style={styles.input}
        />
        {errors.phone && <Text style={styles.error}>{errors.phone}</Text>}
        <TextInput
          placeholder="Enter description"
          value={hallData.description}
          multiline
          onChangeText={(value) => handleInputChange("description", value)}
          style={[styles.input, styles.textArea]}
        />
        {errors.description && (
          <Text style={styles.error}>{errors.description}</Text>
        )}
      </View>

      {/* Location */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location Information</Text>
   <View style={{ zIndex: 1000, marginBottom: 16 }}>
     <DropDownPicker
         open={isDropdownOpen}
         value={selectedCity}
         items={westBankCities.map((city) => ({
           label: city,
           value: city,
         }))}
         setOpen={setIsDropdownOpen}
         setValue={(callback) => {
           const newValue = callback(selectedCity); // Get the new value
           setSelectedCity(newValue); // Update the selected city
           handleCityChange(newValue); // Update the hallData object
         }}
         placeholder="Select City"
         style={styles.dropDownPicker}
         dropDownContainerStyle={styles.dropDownPickerContainer}
         listMode="SCROLLVIEW"
     />

     {errors.city && <Text style={styles.error}>{errors.city}</Text>}
   </View>

        <MapView
          style={styles.map}
          initialRegion={{
            latitude: markerPosition.latitude,
            longitude: markerPosition.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
          onPress={handleMapPress}
        >
          <Marker coordinate={markerPosition} />
        </MapView>
        <TextInput
          placeholder="Latitude"
          value={hallData.latitude.toString()}
          editable={false}
          style={styles.input}
        />
        <TextInput
          placeholder="Longitude"
          value={hallData.longitude.toString()}
          editable={false}
          style={styles.input}
        />
        {errors.location && <Text style={styles.error}>{errors.location}</Text>}
      </View>

      {/* Services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Services</Text>
        {hallData.services.map((service, index) => (
          <View key={index} style={styles.serviceRow}>
            <TextInput
              placeholder="Service Name"
              value={service.serviceName}
              onChangeText={(value) =>
                handleServiceChange(index, "serviceName", value)
              }
              style={[styles.input, styles.serviceInput]}
            />
            <TextInput
              placeholder="Service Price"
              value={service.servicePrice}
              keyboardType="numeric"
              onChangeText={(value) =>
                handleServiceChange(index, "servicePrice", value)
              }
              style={[styles.input, styles.serviceInput]}
            />
            <TouchableOpacity
              onPress={() => handleRemoveService(index)}
              style={styles.removeButton}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
        <Button title="Add Service" onPress={handleAddService} />
      </View>

   {/* Categories */}
   <View style={styles.section}>
     <Text style={styles.sectionTitle}>Categories</Text>
     {["Weddings", "Birthdays", "Meetings", "Parties", "Funerals"].map(
       (category) => (
         <View key={category} style={styles.categoryRow}>
           <TouchableOpacity
             onPress={() => handleToggleCategory(category)}
             style={[
               styles.checkbox,
               selectedCategories.includes(category) && styles.checkboxSelected,
             ]}
           >
             {selectedCategories.includes(category) && (
               <Text style={styles.checkIcon}>✔️</Text>
             )}
           </TouchableOpacity>
           <Text style={styles.categoryLabel}>{category}</Text>
           <TextInput
             placeholder="Price"
             value={categoryPrices[category]?.toString() || ""}
             keyboardType="numeric"
             onChangeText={(value) => handleCategoryChange(category, value)}
             style={[styles.input, styles.categoryInput]}
             editable={selectedCategories.includes(category)} // Only editable if category is selected
           />
         </View>
       )
     )}
   </View>



      {/* Images */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upload Images</Text>
        <Button title="Pick Images" onPress={handlePickImages} />
        {errors.images && <Text style={styles.error}>{errors.images}</Text>}
      </View>

      <View style={styles.section}>
           <Text style={styles.sectionTitle}>Proof of Ownership</Text>
           <Button title="Pick Proof File" onPress={handlePickProof} />
           {hallData.proofFile && (
             <Text style={styles.fileInfo}>File: {hallData.proofFile.name}</Text>
           )}
         </View>


      {/* Submit */}
      <Button title="Submit" onPress={handleSubmit} color="#d9a773" />
    </ScrollView>
      </KeyboardAvoidingView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#2d2d2d",
  },
  section: {
    marginBottom: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#444",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  map: {
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  dropDownPicker: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  dropDownPickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  serviceInput: {
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    backgroundColor: "#ff6f61",
    padding: 10,
    borderRadius: 8,
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryInput: {
    flex: 1,
    marginLeft: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    backgroundColor: "white",
  },
  checkboxSelected: {
    backgroundColor: "#4caf50",
    borderColor: "#388e3c",
  },
  checkIcon: {
    color: "#fff",
    fontWeight: "bold",
  },
  fileInfo: {
    fontSize: 14,
    color: "#777",
    marginTop: 8,
  },
  error: {
    color: "#e53935",
    fontSize: 12,
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#6c63ff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
