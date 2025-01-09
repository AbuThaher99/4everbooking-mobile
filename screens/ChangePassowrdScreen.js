import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TextInput } from 'react-native-paper';
import {BASE_URL} from "../assets/constant/ip";

function ChangePasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleSubmit = async () => {
        // try {
        //     const response = await axios.post(
        //         `${BASE_URL}/common/changePassword?email=${encodeURIComponent(email)}&oldPassword=${encodeURIComponent(oldPassword)}&newPassword=${encodeURIComponent(newPassword)}`,
        //         {},
        //         {
        //             headers: {
        //                 accept: '*/*',
        //                 // Authorization: `Bearer ${token}`,
        //             },
        //         }
        //     );
        //     console.log('Password changed successfully:', response.data);
        //     // Optionally, you can navigate to another screen or show a success message
        // } catch (error) {
        //     console.error('Error changing password:', error.response || error.message);
        // }
    };

    return (
        <View style={styles.outer}>
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
                <TextInput
                    label="Old Password"
                    mode="outlined"
                    style={styles.input}
                    value={oldPassword}
                    onChangeText={setOldPassword}
                    secureTextEntry
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
                        colors: { placeholder: '#d9a773', text: '#d9a773' },
                    }}
                />

                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.replace("Login")}>
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default ChangePasswordScreen;

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
        color: '#d9a773',
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
        backgroundColor: '#d9a773',
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
