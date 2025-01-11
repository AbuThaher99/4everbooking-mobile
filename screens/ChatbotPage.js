import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    Button,
    FlatList,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    TouchableWithoutFeedback,
} from "react-native";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../assets/constant/ip";

export default function ChatbotPage() {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [keyboardVisible, setKeyboardVisible] = useState(false); // Track keyboard visibility
    const userData = useSelector((state) => state.bookedHalls.userData); // Fetch userData from Redux
    const userId = userData?.id; // Extract userId

    useEffect(() => {
        // Start a timer to clear the chat after 60 minutes
        const timer = setTimeout(() => {
            setMessages([]); // Clear all messages
            console.log("Chat cleared after 60 minutes");
        }, 60 * 60 * 1000); // 60 minutes in milliseconds

        // Clear the timer if the component unmounts
        return () => clearTimeout(timer);
    }, [messages]);

    useEffect(() => {
        // Add listeners for keyboard events
        const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
            setKeyboardVisible(true);
        });
        const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
            setKeyboardVisible(false);
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    const sendMessage = async () => {
        if (!inputMessage.trim()) return; // Prevent empty messages

        // Add user message to chat
        setMessages((prevMessages) => [
            ...prevMessages,
            { id: Date.now().toString(), type: "user", text: inputMessage },
        ]);

        try {
            // Send request to chatbot API
            const response = await axios.post(
                `${BASE_URL}/chatbot/query?userId=${userId}`,
                { query: inputMessage },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "*/*",
                    },
                }
            );

            // Add chatbot response to chat
            setMessages((prevMessages) => [
                ...prevMessages,
                { id: Date.now().toString(), type: "bot", text: response.data.response },
            ]);
        } catch (error) {
            console.error("Error sending message:", error);
            // Add error message to chat
            setMessages((prevMessages) => [
                ...prevMessages,
                { id: Date.now().toString(), type: "bot", text: "Failed to get a response. Please try again." },
            ]);
        }

        setInputMessage(""); // Clear input field
    };

    const renderMessageItem = ({ item }) => (
        <View
            style={[
                styles.messageContainer,
                item.type === "user" ? styles.userMessage : styles.botMessage,
            ]}
        >
            <Text style={styles.messageText}>{item.text}</Text>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.inner}>
                    <FlatList
                        data={messages}
                        renderItem={renderMessageItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.chatContainer}
                        inverted // Display the latest messages at the bottom
                    />

                    <View style={[styles.inputContainer, keyboardVisible && styles.inputContainerActive]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Type your message..."
                            value={inputMessage}
                            onChangeText={setInputMessage}
                            onFocus={() => setKeyboardVisible(true)}
                        />
                        <Button title="Send" onPress={sendMessage} color="#d9a773" />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f8f8",
    },
    inner: {
        flex: 1,
    },
    chatContainer: {
        paddingHorizontal: 10,
        paddingBottom: 10,
    },
    messageContainer: {
        marginVertical: 5,
        padding: 12,
        borderRadius: 8,
        maxWidth: "75%",
    },
    userMessage: {
        alignSelf: "flex-end",
        backgroundColor: "#d9a773",
    },
    botMessage: {
        alignSelf: "flex-start",
        backgroundColor: "#e6e6e6",
    },
    messageText: {
        fontSize: 16,
        color: "#333",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderTopWidth: 1,
        borderColor: "#ccc",
        backgroundColor: "#fff",
    },
    inputContainerActive: {
        borderTopColor: "#d9a773",
        backgroundColor: "#fdfdfd",
    },
    input: {
        flex: 1,
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginRight: 10,
        backgroundColor: "#fff",
    },
});
