import axios from "axios";
import {BASE_URL} from "../assets/constant/ip";
import {useContext} from "react";
import {AuthContext} from "../store/auth-context";
import * as Location from 'expo-location';
import AsyncStorage from "@react-native-async-storage/async-storage";

const backend_url =
    "https://react-native-program-574db-default-rtdb.firebaseio.com/";

export async function storeHalls(HallsData) {
    const response = await axios.post(
        backend_url + "/halls.json",
        HallsData
    );
    return response.data.name;
}
export async function storeBookedHalls(HallsData) {
    const authCtx = useContext(AuthContext);
    const response = await axios.post(`${BASE_URL}/customer/reserveHall`, HallsData, {
        headers: {
            Authorization: `Bearer ${authCtx.token}`,
            Accept: "*/*",
            content: "application/json",
        }
        }

    );
    return response.data.name;
}


// Dynamically handle empty filters
export async function fetchHalls(page = 1, size = 3, filterData = {}, searchQuery, userId) {

    const {
        priceRange = [0, 10000000],
        capacityRange = [0, 2147483647],
        section1 = null, // Location
        section2 = null, // Category
        selectedType = null, // Sorting
    } = filterData;

    const [minPrice, maxPrice] = priceRange;
    const [minCapacity, maxCapacity] = capacityRange;
    const selectedSort = selectedType?.value;
    let longitude = await AsyncStorage.getItem('longitude');
    let latitude = await AsyncStorage.getItem('latitude');
    const params = {
        page,
        size,
        search: searchQuery?.trim() || null,
        location: section1?.trim() || null,
        minPrice,
        maxPrice,
        minCapacity,
        maxCapacity,
        category: section2?.trim() || null,
        sortByRecommendation: selectedSort === "SortByRecommendation",
        filterByProximity: selectedSort === "SortByLocation",
        sortByPrice: selectedSort === "SortByPrice",
        radius: selectedSort === "SortByLocation" ? 15 : null,
        userId: selectedSort === "SortByRecommendation" ? userId : null,
        longitude: longitude ? parseFloat(longitude) : null,
        latitude: latitude ? parseFloat(latitude) : null,
    };

    console.log("Request Params Before Geolocation:", params);

    try {
        console.log("long", params.longitude);
        console.log("lat", params.latitude);
        if (selectedSort === "SortByLocation" && params.longitude ===null && params.latitude===null) {
            console.log("Fetching halls by location...");

            // Request Location Permissions
            const {status} = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                console.error("Location permission denied.");
                throw new Error("Location permission not granted.");
            }

            // Get User's Current Location
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            const {latitude, longitude} = location.coords;
            params.latitude = latitude;
            params.longitude = longitude;
            // Save the location to AsyncStorage for future use
            await AsyncStorage.setItem('latitude', latitude.toString());
            await AsyncStorage.setItem('longitude', longitude.toString());


            console.log("Updated Params After Geolocation:", params);

        }
            // Fetch Halls Without Location
            const response = await axios.get(`${BASE_URL}/whitelist/getAll`, {
                params,
                headers: {
                    Accept: "*/*",
                },
            });
            console.log("user id", userId);
            return {
                halls: response.data.content.map(formatHallData),
                totalPages: response.data.totalPages || 1, // Include totalPages from the API response
            };
    } catch (error) {
        console.error("Error Fetching Halls:", error.response?.data || error.message);
        throw error;
    }
}

function formatHallData(hall) {
    return {
        id: hall.id,
        name: hall.name,
        imageUrl: hall.image.split(",")[0]?.trim(),
        location: hall.location,
        phoneNumber: hall.phone,
        services: hall.services,
        capacity: hall.capacity,
        description: hall.description,
        price: hall.price,
        longitude: hall.longitude,
        latitude: hall.latitude,
        categories: hall.categories,
        averageRating: hall.averageRating,
        HallRatings: hall.HallRatings || [],
    };
}



export async function fetchOwnersHalls(token, userId, page = 1, size = 3) {
    try {
        const response = await axios.get(`${BASE_URL}/hallOwner/getAll`, {
            params: {
                page,
                size,
                ownerId: userId,
            },
            headers: {
                Accept: "*/*",
                Authorization: `Bearer ${token}`,
            },
        });

        return {
            halls: response.data.content.map((hall) => ({
                id: hall.id,
                name: hall.name,
                imageUrl: hall.image.split(",")[0]?.trim(),
                location: hall.location,
                phoneNumber: hall.phone,
                services: hall.services,
                capacity: hall.capacity,
                description: hall.description,
                price: hall.price,
                longitude: hall.longitude,
                latitude: hall.latitude,
            })),
            totalElements: response.data.totalElements, // Return totalElements for pagination
        };
    } catch (error) {
        console.error("Error fetching halls:", error.response?.data || error.message);
        throw error;
    }
}



export async function fetchOwnersReservedHalls(token, userId, page = 1, size = 10) {
    try {
        const response = await axios.get(`${BASE_URL}/hallOwner/getReservedHalls`, {
            params: {
                ownerId: userId,
                page,
                size,
            },
            headers: {
                Accept: "*/*",
                Authorization: `Bearer ${token}`, // Use token passed as argument
            },
        });

        // Parse the response
        const reservedHalls = response.data.content.map((hall) => ({
            id: hall.id,
            hallId: hall.hallId,
            time: hall.time,
            endTime: hall.endTime || null,
            totalPrice: hall.totalPrice || 0,
            hallName: hall.hallName || "N/A",
            category: hall.category || "N/A",
            services: hall.services || {},
            rated: hall.rated || false,
        }));

        // Return both the reserved halls and the totalElements count
        return {
            reservedHalls,
            totalElements: response.data.totalElements, // Total number of elements
        };
    } catch (error) {
        console.error("Error fetching reserved halls:", error.response?.data || error.message);
        throw error;
    }
}


export async function fetchBookedHalls(userId, token, page = 1, size = 10) {
    try {
        const response = await axios.get(`${BASE_URL}/customer/getAll`, {
            params: {
                page,
                size,
                customerId: userId,
            },
            headers: {
                Accept: "*/*",
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.status === 200) {
            const { content, totalPages, totalElements } = response.data;

            const formattedHalls = content.map((hall) => ({
                id: hall.id,
                hallId: hall.hallId,
                name: hall.hallName,
                category: hall.category,
                totalPrice: hall.totalPrice,
                rated: hall.rated,
                time: hall.time,
                endTime: hall.endTime,
                services: hall.services,
            }));

            return {
                halls: formattedHalls,
                totalPages,
                totalElements,
            };
        }
    } catch (error) {
        if (error.response?.status === 403) {
            return { halls: [], totalPages: 0, totalElements: 0 }; // Return empty results for 403
        }
        console.error("Error fetching booked halls:", error);
        throw error;
    }
}



export async function fetchFavoriteHalls(userId, token, page = 1, size = 3) {
    try {
        const response = await axios.get(`${BASE_URL}/customer/${userId}/favorites`, {
            params: { page, size },
            headers: {
                Accept: "*/*",
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.status === 200) {
            return {
                halls: response.data.content.map((hall) => ({
                    id: hall.id,
                    name: hall.name,
                    imageUrl: hall.image.split(",")[0]?.trim(), // Parse the first URL
                    location: hall.location,
                    phoneNumber: hall.phone,
                    services: hall.services,
                    capacity: hall.capacity,
                    description: hall.description,
                    price: hall.price,
                    longitude: hall.longitude,
                    latitude: hall.latitude,
                    averageRating: hall.averageRating,
                })),
                totalPages: response.data.totalPages || 1,
            };
        }

        return { halls: [], totalPages: 1 }; // Return empty if no results
    } catch (error) {
        if (error.response?.status === 403) {
            return { halls: [], totalPages: 1 };
        }
        console.error("Error fetching halls:", error.response?.data || error.message);
        throw error;
    }
}
