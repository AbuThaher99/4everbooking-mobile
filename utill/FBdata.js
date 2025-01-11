import axios from "axios";
import {BASE_URL} from "../assets/constant/ip";
import {useContext} from "react";
import {AuthContext} from "../store/auth-context";

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
export async function fetchHalls(page = 1, size = 10, filterData = {}, searchQuery) {
    const {
        priceRange = [0, 10000000],
        capacityRange = [0, 2147483647],
        section1 = null,
        section2 = null
    } = filterData;

    const [minPrice, maxPrice] = priceRange;
    const [minCapacity, maxCapacity] = capacityRange;

    try {
        const params = {
            page,
            size,
            minPrice,
            maxPrice,
            minCapacity,
            maxCapacity,
            sortByRecommendation: false,
            filterByProximity: false,
            radius: 15,
            sortByPrice: false,
            search: searchQuery?.trim() || null, // Reset search to null if empty
            location: section1?.trim() || null, // Reset location to null if empty
        };

        const response = await axios.get(`${BASE_URL}/whitelist/getAll`, {
            params,
            headers: {
                Accept: "*/*",
            },
        });

        return response.data.content.map((hall) => ({
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
            HallRatings: hall.HallRatings || [] // Include HallRatings in the response

        }));
    } catch (error) {
        console.error("Error fetching halls:", error.response?.data || error.message);
        throw error;
    }
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
