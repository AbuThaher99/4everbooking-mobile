import React, { useState, useContext, useEffect } from "react";
import {View, Text, Button, FlatList, StyleSheet, TouchableOpacity} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { AuthContext } from "../store/auth-context";
import { fetchBookedHalls } from "../utill/FBdata";
import BookedHallCard from "../components/BookedHallCard"; // Import the card
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../assets/constant/ip";

export function BookedScreen() {
    const [bookedHalls, setBookedHalls] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const authCtx = useContext(AuthContext);
    const isFocused = useIsFocused();
    const userData = useSelector((state) => state.bookedHalls.userData);

    const fetchHalls = async (page) => {
        try {
            const customerDataResponse = await axios.get(
                `${BASE_URL}/customer/getCustomerByUserId/${userData.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${authCtx.token}`,
                        "Content-Type": "application/json",
                        Accept: "*/*",
                    },
                }
            );

            const customerData = customerDataResponse.data;

            const { halls, totalPages } = await fetchBookedHalls(
                customerData,
                authCtx.token,
                page
            );
            setBookedHalls(halls);
            setTotalPages(totalPages);
        } catch (error) {
            console.error("Error fetching booked halls:", error);
        }
    };

    useEffect(() => {
        if (isFocused) {
            fetchHalls(currentPage);
        }
    }, [isFocused, currentPage]);

    const changePage = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleRateHall = (reservationId) => {
        setBookedHalls((prevHalls) =>
            prevHalls.map((hall) =>
                hall.id === reservationId ? { ...hall, rated: true } : hall
            )
        );
    };

    return (
        <View style={styles.container}>
            {bookedHalls.length > 0 ? (
                <>
                    <FlatList
                        data={bookedHalls}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <BookedHallCard hall={item} onRateHall={handleRateHall} />
                        )}
                    />
                    <View style={styles.pagination}>
                        <TouchableOpacity
                            style={[styles.button, currentPage === 1 && { opacity: 0.5 }]}
                            onPress={() => changePage(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <Text style={styles.buttonText}>Previous</Text>
                        </TouchableOpacity>
                        <Text style={styles.pageIndicator}>
                            Page {currentPage} of {totalPages}
                        </Text>
                        <TouchableOpacity
                            style={[styles.button, currentPage === totalPages && { opacity: 0.5 }]}
                            onPress={() => changePage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            <Text style={styles.buttonText}>Next</Text>
                        </TouchableOpacity>
                    </View>

                </>
            ) : (
                <Text style={styles.fallbackText}>No Booked Halls found!</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#f5f5f5", // Soft neutral background
    },
    pagination: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 16,
        padding: 10,
        backgroundColor: "#fff", // White background for contrast
        borderRadius: 8,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 3,
    },
    pageIndicator: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#2d2d2d", // Darker text for emphasis
    },
    fallbackText: {
        textAlign: "center",
        marginTop: 30,
        fontSize: 18,
        color: "#777", // Subtle color for fallback text
        fontWeight: "bold",
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: "#d9a773", // Custom button color
        borderRadius: 8,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        textAlign: "center",
        fontSize: 16,
    },
});
