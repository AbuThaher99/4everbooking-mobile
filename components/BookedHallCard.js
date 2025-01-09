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
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 16,
        marginVertical: 8,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8,
    },
    text: {
        fontSize: 14,
        color: "#555",
        marginBottom: 4,
    },
    label: {
        fontWeight: "bold",
        color: "#333",
    },
    servicesContainer: {
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: "#ddd",
        paddingTop: 8,
    },
    button: {
        marginTop: 12,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonEnabled: {
        backgroundColor: "#28a745",
    },
    buttonDisabled: {
        backgroundColor: "#ccc",
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
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        width: "80%",
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 16,
    },
    starContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 16,
    },
    star: {
        marginHorizontal: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
    },
    textArea: {
        height: 80,
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
});

export default BookedHallCard;
