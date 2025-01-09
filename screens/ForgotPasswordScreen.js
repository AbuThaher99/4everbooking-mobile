import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TextInput } from 'react-native-paper';
import axios from 'axios';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import {BASE_URL} from "../assets/constant/ip";

function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Loading state

    const handleSubmit = async () => {
        setIsLoading(true); // Start loading
        try {
            const response = await axios.post(
                `${BASE_URL}/whitelist/send-verification-code?email=${encodeURIComponent(email)}`,
                {},
                {
                    headers: {
                        accept: '*/*',
                    },
                }
            );
            console.log('Verification code sent:', response.data);
            // navigation.replace('Verify', { email });
        } catch (error) {
            console.error('Error sending verification code:', error.response || error.message);
        } finally {
            setIsLoading(false); // Stop loading
        }
    };

    if (isLoading) {
        return <LoadingOverlay message="Sending verification code..." />;
    }

    return (
        <LinearGradient
            style={styles.outer}
            colors={['#a97c50', '#d9a773', '#e6cba1', '#a97c50', '#8c5e30', '#6e3d1b']}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
        >
            <View style={styles.container}>
                <Text style={styles.header}>Forgot Password</Text>
                <TextInput
                    label="Email"
                    mode="outlined"
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
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

                <TouchableOpacity onPress={() => navigation.replace("Login")}>
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}

export default ForgotPasswordScreen;

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
