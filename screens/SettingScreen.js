import React, { useState, useContext } from 'react';
import {View, Text, Switch, Button, StyleSheet, Alert, TouchableOpacity, Image, ScrollView} from 'react-native';
import { AuthContext } from '../store/auth-context';
import { Ionicons } from '@expo/vector-icons';
import {useSelector} from "react-redux";

export function SettingScreen({navigation}) {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [language, setLanguage] = useState('en');
    const authCtx = useContext(AuthContext);
    const userData = useSelector((state) => state.bookedHalls.userData);

    const toggleDarkMode = () => {
        setIsDarkMode(previousState => !previousState);
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

    React.useEffect(() => {
        navigation.setParams({ activeTab: 'Settings' });
    }, [navigation]);

    return (
        <ScrollView style={styles.container}>
            {/* Profile Section */}
            <View style={styles.profileSection}>
                <View style={styles.profileImageContainer}>
                    <Image
                        source={require('../assets/placeHolder.jpg')}
                        style={styles.profileImage}
                    />
                    <TouchableOpacity style={styles.cameraIcon}>
                        <Ionicons name="camera" size={24} color="white" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.name}>{userData.firstName} {userData.lastName}</Text>
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
                    <Button title="Change Password" onPress={() => {navigation.navigate("changePass")}} color="#d9a773" />
                </View>
            </View>
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
    info: {
        fontSize: 16,
        color: '#777',
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
    },
});
