import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    FlatList,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
} from "react-native";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../assets/constant/ip";

export default function ChatbotPage() {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const flatListRef = useRef(null); // FlatList reference
    const userData = useSelector((state) => state.bookedHalls.userData);
    const userId = userData?.id;

    useEffect(() => {
        // Clear chat after 60 minutes
        const timer = setTimeout(() => {
            setMessages([]);
            console.log("Chat cleared after 60 minutes");
        }, 60 * 60 * 1000);

        return () => clearTimeout(timer);
    }, []);

    const scrollToBottom = () => {
        if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    };

    useEffect(() => {
        // Scroll to the end whenever messages change
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        const query = inputMessage;
        setInputMessage("");
        if (!inputMessage.trim()) return;

        setMessages((prevMessages) => [
            ...prevMessages,
            { id: Date.now().toString(), type: "user", text: query },
        ]);

        try {
            const response = await axios.post(
                `${BASE_URL}/chatbot/query?userId=${userId}`,
                { query: query },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "*/*",
                    },
                }
            );

            setMessages((prevMessages) => [
                ...prevMessages,
                { id: Date.now().toString(), type: "bot", text: response.data.response },
            ]);
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages((prevMessages) => [
                ...prevMessages,
                { id: Date.now().toString(), type: "bot", text: "Failed to get a response. Please try again." },
            ]);
        }
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
                ref={flatListRef}
                data={messages}
                renderItem={renderMessageItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.chatContainer}
                onContentSizeChange={scrollToBottom} // Scroll when content size changes
                onLayout={scrollToBottom} // Ensure it scrolls when layout changes
            />

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Type your message..."
                    value={inputMessage}
                    onChangeText={setInputMessage}
                />
                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={sendMessage}
                    activeOpacity={0.7}
                >
                    <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
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
    sendButton: {
        backgroundColor: "#d9a773", // Button background color
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    sendButtonText: {
        color: "#fff", // Button text color
        fontWeight: "bold",
        fontSize: 16,
    },
});
