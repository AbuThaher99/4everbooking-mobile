import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    ActivityIndicator,
    Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { AuthContext } from "../store/auth-context";
import { BASE_URL } from "../assets/constant/ip";

const AddAdminScreen = () => {
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        address: '',
        phone: '',
        dateOfBirth: '',
        email: '',
        password: '',
    });

    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const authCtx = useContext(AuthContext);

    // Handle input change
    const handleChange = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    // Handle Date of Birth change
    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false); // Hide the picker after selection
        if (selectedDate) {
            const formattedDate = selectedDate.toISOString().split('T')[0];
            handleChange('dateOfBirth', formattedDate);
        }
    };

    // Handle form submission
    const handleSubmit = async () => {
        // Validate inputs
        if (
            !form.firstName ||
            !form.lastName ||
            !form.address ||
            !form.phone ||
            !form.dateOfBirth ||
            !form.email ||
            !form.password
        ) {
            Alert.alert('Validation Error', 'All fields are required.');
            return;
        }

        console.log("Submitting payload:", form);

        // Confirm submission
        Alert.alert(
            "Confirm Submission",
            "Are you sure you want to add this admin?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Submit",
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const response = await axios.post(
                                `${BASE_URL}/admin/addAdmin`,
                                form, // Send the flat structure
                                {
                                    headers: {
                                        Authorization: `Bearer ${authCtx.token}`,
                                        "Content-Type": "application/json",
                                        Accept: "*/*",
                                    },
                                }
                            );
                            Alert.alert('Success', `Admin added successfully!`);
                            setForm({
                                firstName: '',
                                lastName: '',
                                address: '',
                                phone: '',
                                dateOfBirth: '',
                                email: '',
                                password: '',
                            });
                        } catch (error) {
                            console.error('Error adding admin:', error.response?.data || error.message);
                            Alert.alert(
                                'Error',
                                error.response?.data?.message || 'Failed to add admin. Please check your input.'
                            );
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Add Admin</Text>
            <TextInput
                style={styles.input}
                placeholder="First Name"
                value={form.firstName}
                onChangeText={(value) => handleChange('firstName', value)}
            />
            <TextInput
                style={styles.input}
                placeholder="Last Name"
                value={form.lastName}
                onChangeText={(value) => handleChange('lastName', value)}
            />
            <TextInput
                style={styles.input}
                placeholder="Address"
                value={form.address}
                onChangeText={(value) => handleChange('address', value)}
            />
            <TextInput
                style={styles.input}
                placeholder="Phone"
                value={form.phone}
                keyboardType="phone-pad"
                onChangeText={(value) => handleChange('phone', value)}
            />
            <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
            >
                <Text style={styles.datePickerButtonText}>
                    {form.dateOfBirth ? `DOB: ${form.dateOfBirth}` : "Select Date of Birth"}
                </Text>
            </TouchableOpacity>
            {showDatePicker && (
                <DateTimePicker
                    value={new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    onChange={handleDateChange}
                    maximumDate={new Date()} // Restrict to past dates
                />
            )}
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={form.email}
                keyboardType="email-address"
                onChangeText={(value) => handleChange('email', value)}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={form.password}
                secureTextEntry={true}
                onChangeText={(value) => handleChange('password', value)}
            />
            {loading ? (
                <ActivityIndicator size="large" color="#007BFF" />
            ) : (
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Add Admin</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        padding: 20,
    },
    header: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
        color: "#333",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 12,
        marginBottom: 15,
        backgroundColor: "#fff",
        fontSize: 16,
        color: "#555",
    },
    datePickerButton: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 15,
        backgroundColor: "#fff",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    datePickerButtonText: {
        color: "#777",
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: "#d9a773",
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    errorText: {
        color: "#e74c3c",
        fontSize: 14,
        marginBottom: 10,
    },
});

export default AddAdminScreen;
