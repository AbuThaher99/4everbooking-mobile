import React, { useState, useContext, useEffect } from "react";
import { View, Text, Button, FlatList, StyleSheet } from "react-native";
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
                        <Button
                            title="Previous"
                            onPress={() => changePage(currentPage - 1)}
                            disabled={currentPage === 1}
                        />
                        <Text style={styles.pageIndicator}>
                            Page {currentPage} of {totalPages}
                        </Text>
                        <Button
                            title="Next"
                            onPress={() => changePage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        />
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
        backgroundColor: "#f8f8f8",
    },
    pagination: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 10,
    },
    pageIndicator: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    fallbackText: {
        textAlign: "center",
        marginTop: 20,
        fontSize: 16,
        color: "#555",
    },
});