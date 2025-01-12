import React, {useState, useContext, useEffect} from 'react';
import {
    View,
    Text,
    Switch,
    Button,
    StyleSheet,
    Alert,
    TouchableOpacity,
    Image,
    ScrollView,
} from 'react-native';
import { AuthContext } from '../store/auth-context';
import { Ionicons } from '@expo/vector-icons';
import {useDispatch, useSelector} from 'react-redux';
import * as ImagePicker from "expo-image-picker";
import {BASE_URL} from "../assets/constant/ip";
import {setUserData, updateUserImage} from '../store/redux/book.js';
import {isLoaded} from "expo-font";
import LoadingOverlay from "../components/ui/LoadingOverlay"; // Adjust the path as needed

export function SettingScreen({ navigation }) {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [language, setLanguage] = useState('en');
    const authCtx = useContext(AuthContext);
    const userData = useSelector((state) => state.bookedHalls.userData);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const toggleDarkMode = () => {
        setIsDarkMode((previousState) => !previousState);
    };

    const changeLanguage = (newLanguage) => {
        setLanguage(newLanguage);
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                onPress: () => {
                    authCtx.logout();
                },
            },
        ]);
    };
    // Function to fetch the latest user data
    const refreshUserData = async () => {
        try {
            const response = await fetch(`${BASE_URL}/whitelist/getUser`, {
                method: "GET",
                headers: {
                    Accept: "*/*",
                    Authorization: `Bearer ${authCtx.token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to refresh user data. Status: ${response.status}`);
            }

            const data = await response.json();
            dispatch(setUserData(data)); // Update Redux state
        } catch (error) {
            console.error("Error refreshing user data:", error);
            Alert.alert("Error", "Failed to refresh user data.");
        }
    };

    useEffect(() => {
        navigation.setParams({ activeTab: 'Settings' });

        // Refresh user data whenever the screen gains focus
        const unsubscribe = navigation.addListener('focus', refreshUserData);

        return unsubscribe; // Cleanup listener on unmount
    }, [navigation]);
    return (
        <ScrollView style={styles.container}>
            {/* Profile Section */}
            {loading ? (
                <LoadingOverlay message={"Loading Profile Image"} />
            ) : (
                <>
            <View style={styles.profileSection}>
                <View style={styles.profileImageContainer}>
                    <Image
                        source={
                            userData.image
                                ? { uri: userData.image }
                                : require('../assets/placeHolder.jpg')
                        }
                        style={styles.profileImage}
                    />

                    <TouchableOpacity
                        style={styles.cameraIcon}
                        onPress={async () => {
                            try {
                                setLoading(true);
                                // Step 1: Request permissions
                                const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

                                if (!permissionResult.granted) {
                                    Alert.alert(
                                        "Permission Required",
                                        "Permission to access the media library is required to upload an image."
                                    );
                                    return;
                                }

                                // Step 2: Launch Image Picker
                                const result = await ImagePicker.launchImageLibraryAsync({
                                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                    allowsEditing: true,
                                    aspect: [1, 1],
                                    quality: 1,
                                });

                                if (!result.canceled) {
                                    const uri = result.assets[0].uri;
                                    const name = result.assets[0].fileName || uri.split("/").pop();
                                    const type = "image/jpeg"; // Default MIME type

                                    // Step 3: Create FormData
                                    const formData = new FormData();
                                    formData.append("image", {
                                        uri,
                                        name,
                                        type,
                                    });

                                    console.log("BASE_URL:", BASE_URL);
                                    console.log(
                                        "Request URL:",
                                        `${BASE_URL}/common/uploadImageToProfile?id=${userData.id}`
                                    );
                                    console.log("FormData Parts:", formData._parts);

                                    // Step 4: Upload the Image
                                    const response = await fetch(
                                        `${BASE_URL}/common/uploadImageToProfile?id=${userData.id}`,
                                        {
                                            method: "POST",
                                            headers: {
                                                Authorization: `Bearer ${authCtx.token}`,
                                            },
                                            body: formData,
                                        }
                                    );

                                    if (!response.ok) {
                                        const responseText = await response.text();
                                        console.error("Backend Error: ", responseText);
                                        throw new Error(
                                            `Failed to upload profile image. Status: ${response.status}`
                                        );
                                    }

                                    // Step 5: Update User Data
                                    Alert.alert("Success", "Profile image updated successfully!");
                                    const userResponse = await fetch(
                                        `${BASE_URL}/whitelist/getUser`,
                                        {
                                            method: "GET",
                                            headers: {
                                                Accept: "*/*",
                                                Authorization: `Bearer ${authCtx.token}`, // Fixed backticks
                                            },
                                        }
                                    );

                                    const data = await userResponse.json();
                                    dispatch(setUserData(data));
                                    setLoading(false);
                                }
                            } catch (error) {
                                console.error("Error uploading profile image:", error);
                                Alert.alert("Error", "Failed to update profile image. Please try again.");
                            }
                        }}
                    >
                        <Ionicons name="camera" size={24} color="white" />
                    </TouchableOpacity>

                </View>
                <Text style={styles.name}>
                    {userData.firstName} {userData.lastName}
                </Text>
            </View>

            {/* Personal Information Section */}
            <View style={styles.personalInfoSection}>
                <Text style={styles.infoHeader}>Personal Info</Text>
                <View style={styles.infoItem}>
                    <Ionicons name="mail-outline" size={24} color="#d9a773" />
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoText}>{userData.email}</Text>
                </View>
                <View style={styles.infoItem}>
                    <Ionicons name="call-outline" size={24} color="#d9a773" />
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoText}>+{userData.phone}</Text>
                </View>
                <View style={styles.infoItem}>
                    <Ionicons name="location-outline" size={24} color="#d9a773" />
                    <Text style={styles.infoLabel}>Location</Text>
                    <Text style={styles.infoText}>{userData.address}</Text>
                </View>
            </View>

            {/* Settings Section */}
            <View style={styles.settingContainer}>
                <View style={styles.setting}>
                    <Text style={styles.label}>Dark Mode</Text>
                    <Switch value={isDarkMode} onValueChange={toggleDarkMode} />
                </View>

                <View style={styles.setting}>
                    <Text style={styles.label}>Language</Text>
                    <Button
                        title={language === 'en' ? 'English' : 'Arabic'}
                        onPress={() => changeLanguage(language === 'en' ? 'ar' : 'en')}
                        color="#d9a773"
                    />
                </View>

                <View style={styles.setting}>
                    <Button title="Logout" onPress={handleLogout} color="#d9a773" />
                </View>
                <View style={styles.setting}>
                    <Button
                        title="Change Password"
                        onPress={() => {
                            navigation.navigate('changePass');
                        }}
                        color="#d9a773"
                    />
                </View>
            </View>
            <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate('EditProfile')}
            >
                <Ionicons name="create-outline" size={20} color="#fff" />
                <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
                </>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        padding: 16,
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    profileImageContainer: {
        position: 'relative',
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: '#d9a773',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#d9a773',
        padding: 6,
        borderRadius: 50,
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 10,
    },
    personalInfoSection: {
        marginTop: 20,
    },
    infoHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 10,
        padding: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },
    infoLabel: {
        fontSize: 16,
        marginLeft: 10,
        flex: 1,
        color: '#333',
    },
    infoText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flex: 2,
        textAlign: 'right',
    },
    settingContainer: {
        marginTop: 20,
    },
    setting: {
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },
    label: {
        fontSize: 16,
        color: '#333',
    },editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#d9a773',
        padding: 10,
        borderRadius: 10,
        marginTop: 20,
    },
    editButtonText: {
        color: '#fff',
        fontSize: 16,
        marginLeft: 5,
    },

});
