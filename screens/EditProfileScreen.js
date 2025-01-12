import React, { useContext, useEffect, useState } from "react";
import {
    View,
    Text,
    Button,
    StyleSheet,
    Alert,
    ScrollView,
    ActivityIndicator,
    Platform,
    TouchableOpacity,
    TextInput,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../store/redux/book";
import { BASE_URL } from "../assets/constant/ip";
import { AuthContext } from "../store/auth-context";

export function EditProfileScreen({ navigation }) {
    const userData = useSelector((state) => state.bookedHalls.userData);
    const dispatch = useDispatch();
    const authCtx = useContext(AuthContext);

    const [profileData, setProfileData] = useState({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        address: userData.address || "",
        phone: userData.phone || "",
        dateOfBirth: userData.dateOfBirth
            ? new Date(userData.dateOfBirth)
            : new Date(),
        companyName: userData.companyName || "",
    });

    const [hallOwnerData, setHallOwnerData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        const fetchHallOwnerData = async () => {
            if (userData.role === "HALL_OWNER") {
                setLoading(true);
                try {
                    const response = await fetch(
                        `${BASE_URL}/hallOwner/getHallOwnerByUserId/${userData.id}`,
                        {
                            headers: {
                                accept: "*/*",
                                Authorization: `Bearer ${authCtx.token}`,
                            },
                        }
                    );

                    const rawData = await response.text();
                    const data = rawData ? JSON.parse(rawData) : {};

                    if (!response.ok) {
                        throw new Error(`Failed to fetch hall owner data. Status: ${response.status}`);
                    }

                    setHallOwnerData(data);

                    setProfileData((prevState) => ({
                        ...prevState,
                        companyName: data.companyName || "",
                    }));
                } catch (error) {
                    console.error("Error fetching hall owner data:", error);
                    Alert.alert("Error", "Unable to fetch hall owner data.");
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchHallOwnerData();
    }, [userData.id, userData.role, authCtx.token]);

    const handleInputChange = (field, value) => {
        setProfileData((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setProfileData((prevState) => ({
                ...prevState,
                dateOfBirth: selectedDate,
            }));
        }
    };

    const handleSaveProfile = async () => {
        try {
            const apiUrl =
                userData.role === "HALL_OWNER"
                    ? `${BASE_URL}/hallOwner/UpdateProfile/${userData.id}`
                    : `${BASE_URL}/customer/updateProfile/${userData.id}`;

            // Manually format the date to avoid time zone offset issues
            const formattedDateOfBirth = `${profileData.dateOfBirth.getFullYear()}-${(
                profileData.dateOfBirth.getMonth() + 1
            )
                .toString()
                .padStart(2, "0")}-${profileData.dateOfBirth
                .getDate()
                .toString()
                .padStart(2, "0")}`;

            const bodyData = {
                ...profileData,
                dateOfBirth: formattedDateOfBirth, // Use the manually formatted date
            };

            console.log("API URL:", apiUrl);
            console.log("Request Body:", bodyData);

            const response = await fetch(apiUrl, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authCtx.token}`,
                },
                body: JSON.stringify(bodyData),
            });

            const rawResponse = await response.text();
            console.log("Raw Response:", rawResponse);

            if (!response.ok) {
                throw new Error(
                    `Failed to update profile. Status: ${response.status}, Response: ${rawResponse}`
                );
            }

            if (response.status === 204) {
                Alert.alert("Success", "Profile updated successfully!");
                dispatch(
                    setUserData({
                        ...userData,
                        ...profileData,
                    })
                );
                navigation.goBack();
                return;
            }

            const updatedUserData = JSON.parse(rawResponse);

            dispatch(
                setUserData({
                    ...userData,
                    ...updatedUserData,
                })
            );

            Alert.alert("Success", "Profile updated successfully!");
            navigation.goBack();
        } catch (error) {
            console.error("Error updating profile:", error);
            Alert.alert("Error", "Failed to update profile. Please try again.");
        }
    };



    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#d9a773" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Edit Profile</Text>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                    style={styles.input}
                    value={profileData.firstName}
                    onChangeText={(value) => handleInputChange("firstName", value)}
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                    style={styles.input}
                    value={profileData.lastName}
                    onChangeText={(value) => handleInputChange("lastName", value)}
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Address</Text>
                <TextInput
                    style={styles.input}
                    value={profileData.address}
                    onChangeText={(value) => handleInputChange("address", value)}
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone</Text>
                <TextInput
                    style={styles.input}
                    value={profileData.phone}
                    onChangeText={(value) => handleInputChange("phone", value)}
                    keyboardType="phone-pad"
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Date of Birth</Text>
                <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    style={styles.datePickerButton}
                >
                    <Text style={styles.datePickerText}>
                        {profileData.dateOfBirth
                            ? profileData.dateOfBirth.toDateString()
                            : "Select Date"}
                    </Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        value={profileData.dateOfBirth}
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={handleDateChange}
                    />
                )}
            </View>
            {userData.role === "HALL_OWNER" && (
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Company Name</Text>
                    <TextInput
                        style={styles.input}
                        value={profileData.companyName}
                        onChangeText={(value) => handleInputChange("companyName", value)}
                    />
                </View>
            )}
            <Button title="Save" onPress={handleSaveProfile} color="#d9a773" />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9f9f9",
        padding: 16,
    },
    header: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        backgroundColor: "#fff",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
    },
    datePickerButton: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        backgroundColor: "#fff",
        justifyContent: "center",
    },
    datePickerText: {
        color: "#333",
        fontSize: 16,
    },
});
