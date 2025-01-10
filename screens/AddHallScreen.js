import React, { useState } from "react";
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

export default function AddHallScreen() {
  const [hallData, setHallData] = useState({
    name: "",
    capacity: "",
    phone: "",
    description: "",
    city: "",
    latitude: "",
    longitude: "",
    services: [{ serviceName: "", servicePrice: "" }],
    categories: [],
    images: [],
    proofFile: null,
  });

  const [categoryPrices, setCategoryPrices] = useState({});
  const [selectedCity, setSelectedCity] = useState("");
  const [markerPosition, setMarkerPosition] = useState({
    latitude: 31.9,
    longitude: 35.2,
  });
  const [errors, setErrors] = useState({});

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
      setHallData({
        ...hallData,
        images: [...hallData.images, ...result.assets],
      });
    }
  };

  const handlePickProof = async () => {
    const result = await ImagePicker.launchDocumentAsync({
      type: "application/pdf",
    });

    if (!result.canceled) {
      setHallData({ ...hallData, proofFile: result });
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
    if (!hallData.city) errors.city = "City is required.";
    if (!hallData.latitude || !hallData.longitude)
      errors.location = "Location is required.";
    if (!hallData.images.length) errors.images = "At least one image is required.";
    if (!hallData.proofFile) errors.proofFile = "Proof of ownership is required.";

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // Upload images
      const imageData = new FormData();
      hallData.images.forEach((image, index) => {
        imageData.append("images", {
          uri: image.uri,
          name: `image${index}.jpg`,
          type: "image/jpeg",
        });
      });

      const imageResponse = await fetch(`${BASE_URL}/hallOwner/uploadImageToHall`, {
        method: "POST",
        body: imageData,
      });

      if (!imageResponse.ok) throw new Error("Failed to upload images");

      const imageUrls = await imageResponse.text();

      // Upload proof
      const proofData = new FormData();
      proofData.append("file", {
        uri: hallData.proofFile.uri,
        name: "proof.pdf",
        type: "application/pdf",
      });

      const proofResponse = await fetch(`${BASE_URL}/hallOwner/uploadFileProof`, {
        method: "POST",
        body: proofData,
      });

      if (!proofResponse.ok) throw new Error("Failed to upload proof file");

      const proofUrl = await proofResponse.text();

      // Submit hall
      const hallPayload = {
        ...hallData,
        categories: categoryPrices,
        images: imageUrls,
        proofFile: proofUrl,
      };

      const hallResponse = await fetch(`${BASE_URL}/hallOwner/addHall`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hallPayload),
      });

      if (!hallResponse.ok) throw new Error("Failed to create hall");

      Alert.alert("Success", "Hall created successfully!");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
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
        <Picker
          selectedValue={selectedCity}
          onValueChange={(value) => {
            setSelectedCity(value);
            handleInputChange("city", value);
          }}
          style={styles.picker}
        >
          <Picker.Item label="Select City" value="" />
          {westBankCities.map((city) => (
            <Picker.Item key={city} label={city} value={city} />
          ))}
        </Picker>
        {errors.city && <Text style={styles.error}>{errors.city}</Text>}
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 31.9,
            longitude: 35.2,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
          onPress={handleMapPress}
        >
          <Marker coordinate={markerPosition} />
        </MapView>
        <TextInput
          placeholder="Latitude"
          value={hallData.latitude}
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
              <Text>{category}</Text>
              <TextInput
                placeholder="Enter Price"
                value={categoryPrices[category]?.toString() || ""}
                keyboardType="numeric"
                onChangeText={(value) => handleCategoryChange(category, value)}
                style={[styles.input, styles.categoryInput]}
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

      {/* Proof */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upload Proof of Ownership</Text>
        <Button title="Pick Proof File" onPress={handlePickProof} />
        {errors.proofFile && <Text style={styles.error}>{errors.proofFile}</Text>}
      </View>

      {/* Submit */}
      <Button title="Submit" onPress={handleSubmit} color="#d9a773" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f8f8",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    backgroundColor: "white",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  picker: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 8,
  },
  map: {
    height: 200,
    marginBottom: 8,
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  serviceInput: {
    flex: 1,
  },
  removeButton: {
    marginLeft: 8,
    padding: 8,
    backgroundColor: "#d9534f",
    borderRadius: 8,
  },
  removeButtonText: {
    color: "white",
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  categoryInput: {
    flex: 1,
    marginLeft: 8,
  },
  error: {
    color: "red",
    fontSize: 12,
    marginBottom: 8,
  },
});
