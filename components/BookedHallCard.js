import React, {useContext, useState} from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, Modal, Button } from "react-native";
import { FontAwesome } from "@expo/vector-icons"; // For star icons
import { useSelector } from "react-redux";
import { BASE_URL } from "../assets/constant/ip";
import {AuthContext} from "../store/auth-context";

const BookedHallCard = ({ hall, onRateHall }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [rating, setRating] = useState(0); // Default rating is 0
    const [comment, setComment] = useState("");

    const now = new Date();
    const reservationEnd = hall.endTime ? new Date(hall.endTime) : null;
    const reservationStart = hall.time ? new Date(hall.time) : null;
    const userData = useSelector((state) => state.bookedHalls.userData);
    const authCtx = useContext(AuthContext);


    const getButtonLabel = () => {
        if (hall.rated) return "Hall Rated";
        if (reservationEnd && reservationEnd < now) return "Rate the Hall";
        if (reservationStart && reservationStart > now)
            return "You will rate the hall after the reservation ends";
        return "Hall Ongoing";
    };

    const isButtonDisabled = () => {
        if (hall.rated) return true;
        if (reservationStart && reservationStart > now) return true;
        return false;
    };

    const handleStarPress = (value) => {
        setRating(value);
    };

    const handleSubmitRating = async () => {
        try {
            const payload = {
                userId: userData.id, // `id` from user data
                hallId: hall.hallId, // Assuming `hall.hallId` contains the correct ID
                rating, // Selected rating from stars
                comment, // User's comment
                reservationId: hall.id, // Assuming `hall.id` is the reservation ID
            };
            console.log(authCtx.token)
            // Make API call to rate the hall
            const response = await fetch(`${BASE_URL}/customer/rateHall`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authCtx.token}`, // Use the token from context
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Failed to submit rating.");
            }

            Alert.alert("Success", "Thank you for your rating!");
            setIsModalVisible(false);
            onRateHall(hall.id); // Callback to refresh the UI
        } catch (error) {
            console.error("Error submitting rating:", error);
            Alert.alert("Error", "Failed to submit rating. Please try again.");
        }
    };

    return (
        <View style={styles.card}>
            <Text style={styles.title}>{hall.hallName}</Text>
            <Text style={styles.text}>
                <Text style={styles.label}>Category:</Text> {hall.category || "N/A"}
            </Text>
            <Text style={styles.text}>
                <Text style={styles.label}>Total Price:</Text> ${hall.totalPrice}
            </Text>
            <Text style={styles.text}>
                <Text style={styles.label}>Date:</Text> {new Date(hall.time).toLocaleDateString()}
            </Text>
            <Text style={styles.text}>
                <Text style={styles.label}>End Date:</Text> {new Date(hall.endTime).toLocaleDateString()}
            </Text>
            <Text style={styles.text}>
                <Text style={styles.label}>Rated:</Text> {hall.rated ? "Yes" : "No"}
            </Text>
            {hall.services && Object.keys(hall.services).length > 0 && (
                <View style={styles.servicesContainer}>
                    <Text style={styles.label}>Services:</Text>
                    {Object.entries(hall.services).map(([service, price], index) => (
                        <Text key={index} style={styles.text}>
                            - {service}: ${price}
                        </Text>
                    ))}
                </View>
            )}
            <TouchableOpacity
                style={[
                    styles.button,
                    isButtonDisabled() ? styles.buttonDisabled : styles.buttonEnabled,
                ]}
                onPress={() => setIsModalVisible(true)}
                disabled={isButtonDisabled()}
            >
                <Text style={styles.buttonText}>{getButtonLabel()}</Text>
            </TouchableOpacity>

            {/* Modal for Rating */}
            <Modal visible={isModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Rate the Hall</Text>
                        <View style={styles.starContainer}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity key={star} onPress={() => handleStarPress(star)}>
                                    <FontAwesome
                                        name={star <= rating ? "star" : "star-o"}
                                        size={32}
                                        color="#FFD700"
                                        style={styles.star}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TextInput
                            placeholder="Comment"
                            style={[styles.input, styles.textArea]}
                            value={comment}
                            onChangeText={setComment}
                            multiline
                        />
                        <View style={styles.modalActions}>
                            <Button
                                title="Submit"
                                onPress={handleSubmitRating}
                                disabled={rating < 1 || rating > 5} // Disable if no valid rating
                            />
                            <Button title="Cancel" onPress={() => setIsModalVisible(false)} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 3,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#2d2d2d",
        marginBottom: 10,
    },
    text: {
        fontSize: 16,
        color: "#555",
        marginBottom: 6,
    },
    label: {
        fontWeight: "bold",
        color: "#333",
    },
    servicesContainer: {
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#ddd",
        paddingTop: 8,
    },
    button: {
        marginTop: 16,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    buttonEnabled: {
        backgroundColor: "#d9a773", // Green for enabled button
    },
    buttonDisabled: {
        backgroundColor: "#ccc", // Gray for disabled button
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black background
    },
    modalContent: {
        width: "85%",
        backgroundColor: "#ffffff",
        borderRadius: 12,
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#2d2d2d",
        marginBottom: 20,
        textAlign: "center",
    },
    starContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 16,
    },
    star: {
        marginHorizontal: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
        backgroundColor: "#f9f9f9", // Slight background color for input
    },
    textArea: {
        height: 100,
        textAlignVertical: "top", // Align text at the top
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
});

export default BookedHallCard;
