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

// export async function fetchHalls() {
//     const response = await axios.get(backend_url + "/halls.json");
//     const hall = [];
//     for (const key in response.data) {
//         const obj = {
//             id: key,
//             name: response.data[key].name,
//             imageUrl: response.data[key].imageUrl,
//             location: response.data[key].location,
//             phoneNumber: response.data[key].phoneNumber,
//             services: response.data[key].services
//         }
//         hall.push(obj);
//     }
//     return hall;
// }

export async function fetchHalls(page = 1, size = 10, filterData = {},searchQuery) {
    const {
        priceRange = [0, 10000000],
        capacityRange = [0, 2147483647],
        section1 = null,
        section2 = null
    } = filterData;

    const [minPrice, maxPrice] = priceRange;
    const [minCapacity, maxCapacity] = capacityRange;

    try {
        console.log(section1)
        const response = await axios.get(`${BASE_URL}/whitelist/getAll`, {
            params: {
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
                ...(searchQuery ? { search: searchQuery } : {}),
                ...(section1 ? { location: section1 } : {})
            },
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
            categories: hall.categories
        }));
    } catch (error) {
        console.error("Error fetching halls:", error.response?.data || error.message);
        throw error;
    }
}



export async function fetchOwnersHalls(token, userId, page = 1, size = 10) {
    try {
        const response = await axios.get(`${BASE_URL}/hallOwner/getAll`, {
            params: {
                page,
                size,
                ownerId: userId,
            },
            headers: {
                Accept: "*/*",
                Authorization: `Bearer ${token}`, // Use token passed as argument
            },
        });

        return response.data.content.map((hall) => ({
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
        }));
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

        return response.data.content.map((hall) => ({
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
        }));
    } catch (error) {
        console.error("Error fetching halls:", error.response?.data || error.message);
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
            return response.data.content.map((hall) => ({
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
            }));
        }
    } catch (error) {
        if (error.response?.status === 403) {
            // Return an empty array if the status is 403
            return [];
        }

        // Log and rethrow other errors
        console.error("Error fetching halls:", error.response?.data || error.message);
        throw error;
    }
}


export async function fetchFavoriteHalls(userId, token, page = 1, size = 10) {
    try {
        const response = await axios.get(`${BASE_URL}/customer/${userId}/favorites`, {
            params: {
                page,
                size,
            },
            headers: {
                Accept: "*/*",
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.status === 200) {
            return response.data.content.map((hall) => ({
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
            }));
        }
    } catch (error) {
        if (error.response?.status === 403) {
            // Return an empty array if the status is 403
            return [];
        }

        // Log and rethrow other errors
        console.error("Error fetching halls:", error.response?.data || error.message);
        throw error;
    }
}


export function updateHall(id, hallsData) {
    axios.put(backend_url + `/halls/${id}.json`, hallsData);
}

export function deleteHall(id) {
    axios.delete(backend_url + `/halls/${id}.json`);
}
