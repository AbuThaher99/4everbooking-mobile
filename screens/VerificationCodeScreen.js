import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TextInput } from 'react-native-paper';
import axios from 'axios'; // Import axios
import LoadingOverlay from '../components/ui/LoadingOverlay';
import {BASE_URL} from "../assets/constant/ip"; // Import the LoadingOverlay component

function VerificationCodeScreen({ route, navigation }) {
    const { email } = route.params; // Get email from the previous screen
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Loading state

    const handleSubmit = async () => {
        setIsLoading(true); // Start loading

        try {
            const response = await axios.post(
                `${BASE_URL}/whitelist/resetPassword?email=${encodeURIComponent(email)}&verificationCode=${encodeURIComponent(verificationCode)}`,
                JSON.stringify({ newPassword }),
                {
                    headers: {
                        accept: '*/*',
                        'Content-Type': 'application/json',
                    },
                }
            );
            console.log('Password reset response:', response.data);
            // Redirect to login screen or another appropriate screen
            navigation.replace('Login');
        } catch (error) {
            console.error('Error resetting password:', error.response || error.message);
        } finally {
            setIsLoading(false); // Stop loading
        }
    };

    if (isLoading) {
        return <LoadingOverlay message="Resetting password..." />;
    }

    return (
        <LinearGradient
            style={styles.outer}
            colors={['#a97c50', '#d9a773', '#e6cba1', '#a97c50', '#8c5e30', '#6e3d1b']}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
        >
            <View style={styles.container}>
                <Text style={styles.header}>Enter Verification Code</Text>
                <TextInput
                    label="Verification Code"
                    mode="outlined"
                    style={styles.input}
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    keyboardType="default"
                    autoCapitalize="none"
                    outlineColor="#795734"
                    activeOutlineColor="#795734"
                    textColor="#795734"
                    theme={{
                        colors: { placeholder: '#795734', text: '#795734' },
                    }}
                />
                <TextInput
                    label="New Password"
                    mode="outlined"
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    outlineColor="#795734"
                    activeOutlineColor="#795734"
                    textColor="#795734"
                    theme={{
                        colors: { placeholder: '#795734', text: '#795734' },
                    }}
                />
                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.replace("ResetPass")}>
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}

export default VerificationCodeScreen;

const styles = StyleSheet.create({
    outer: {
        flex: 1,
        paddingBottom: "20%",
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    header: {
        color: 'white',
        fontSize: 30,
        textAlign: 'center',
        marginTop: 40,
        fontFamily: "Montserrat-Bold",
        padding: 30,
    },
    input: {
        width: '100%',
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#795734',
        padding: 15,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
        marginBottom: 15,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    backText: {
        color: '#ffffff',
        marginTop: 10,
        fontSize: 14,
        textDecorationLine: 'underline',
    },
});
