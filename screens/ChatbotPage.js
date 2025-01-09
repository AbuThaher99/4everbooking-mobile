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
} from "react-native";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../assets/constant/ip";

export default function ChatbotPage() {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
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
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <FlatList
                data={messages}
                renderItem={renderMessageItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.chatContainer}
            />

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Type your message..."
                    value={inputMessage}
                    onChangeText={setInputMessage}
                />
                <Button title="Send" onPress={sendMessage} />
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f8f8",
    },
    chatContainer: {
        padding: 10,
    },
    messageContainer: {
        marginVertical: 5,
        padding: 10,
        borderRadius: 8,
        maxWidth: "80%",
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
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderTopWidth: 1,
        borderColor: "#ccc",
    },
    input: {
        flex: 1,
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginRight: 10,
    },
});
