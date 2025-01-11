import React, { useState, useEffect,useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons"; // For stars
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../assets/constant/ip";
import { AuthContext } from "../store/auth-context";
import { useForegroundPermissions, PermissionStatus } from 'expo-location';


const RecommendedHallsScreen = () => {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigation = useNavigation();
    const authCtx = useContext(AuthContext);
    const [locationPermissionInformation, requestPermission] = useForegroundPermissions();

    async function verifyPermissions() {
        if (locationPermissionInformation.status === PermissionStatus.UNDETERMINED) {
            const permissionResponse = await requestPermission();
            return permissionResponse.granted;
        }

        if (locationPermissionInformation.status === PermissionStatus.DENIED) {
            Alert.alert(
                "Insufficient Permissions!",
                "You need to grant location permissions to use this app."
            );
            return false;
        }

        return true;
    }
  const fetchRecommendedHalls = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/customer/recommendhalls?size=5`, {
        headers: {
           Authorization: `Bearer ${authCtx.token}`, // Use token from context
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch recommended halls.");
      }
      const data = await response.json();
      setHalls(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendedHalls();
  }, []);

  const renderStarRating = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesome
          key={i}
          name={i <= rating ? "star" : "star-o"}
          size={16}
          color="#FFD700"
        />
      );
    }
    return stars;
  };

  const handlePressHall = (hall) => {
   const checkPermissions = async () => {
        const hasPermission = await verifyPermissions();
        if (!hasPermission) {
            return;
   }
   };
    navigation.navigate("details", {
      id: hall.id,
      name: hall.name,
      imageUrl: hall.image.split(",")[0]?.trim(),
      location: hall.location,
      phoneNumber: hall.phone,
      services: hall.services,
      description: hall.description,
      categories: hall.categories,
      longitude: hall.longitude,
      latitude: hall.latitude,
      HallRatings: hall.HallRatings,
    });
  };


  const renderHallItem = ({ item }) => {
    const firstImage = item.image.split(",")[0]?.trim();

    return (
      <TouchableOpacity
        style={styles.hallCard}
        onPress={() => handlePressHall(item)}
      >
        {firstImage ? (
          <Image source={{ uri: firstImage }} style={styles.hallImage} />
        ) : (
          <View style={styles.noImageContainer}>
            <Text style={styles.noImageText}>No Image Available</Text>
          </View>
        )}
        <View style={styles.hallDetails}>
          <Text style={styles.hallName}>{item.name}</Text>
          <Text style={styles.hallLocation}>{item.location}</Text>
          <Text style={styles.hallDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.ratingContainer}>
            {renderStarRating(Math.round(item.averageRating))}
            <Text style={styles.ratingText}>{item.averageRating.toFixed(1)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d9a773" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recommended Halls</Text>
      <FlatList
        data={halls}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderHallItem}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

export default RecommendedHallsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 16,
    textAlign: "center",
    color: "#333",
  },
  listContainer: {
    paddingBottom: 16,
  },
  hallCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  hallImage: {
    width: "100%",
    height: 200,
  },
  noImageContainer: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
  },
  noImageText: {
    color: "#888",
    fontSize: 14,
  },
  hallDetails: {
    padding: 16,
  },
  hallName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  hallLocation: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  hallDescription: {
    fontSize: 12,
    color: "#777",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#555",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
});
