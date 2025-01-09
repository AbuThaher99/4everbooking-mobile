import {useContext, useState} from 'react';
import {Alert, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {useDispatch, useSelector} from "react-redux";
import axios from "axios";
import {BASE_URL} from "../assets/constant/ip";
import {AuthContext} from "../store/auth-context";
import {useStripe} from '@stripe/stripe-react-native';

function PaymentDetailsScreen({route, navigation}) {
    const {id, selectedDate,selectedCategory, selectedServices} = route.params;
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const dispatch = useDispatch();
    const authCtx = useContext(AuthContext);
    const userData = useSelector((state) => state.bookedHalls.userData);
    const hallData = useSelector((state) => state.bookedHalls.hallData);

    const stripe = useStripe();  // Initialize Stripe
    const formatCardNumber = (text) => {
        const cleaned = text.replace(/\D/g, '');
        const formatted = cleaned.match(/.{1,4}/g)?.join('-') || '';
        return formatted;
    };

    const formatExpiryDate = (text) => {
        const cleaned = text.replace(/\D/g, '');
        const formatted = cleaned.slice(0, 2) + (cleaned.length > 2 ? '/' + cleaned.slice(2, 4) : '');
        return formatted;
    };

    function handleCardNumberChange(text) {
        setCardNumber(formatCardNumber(text));
    }

    function handleExpiryDateChange(text) {
        setExpiryDate(formatExpiryDate(text));
    }

    const handleSubmit = async () => {
        if (cardNumber === '' || expiryDate === '' || cvv === '') {
            Alert.alert('Please fill in all fields');
            return;
        }

        try {
            console.log(id)
            const connected = await axios.get(`${BASE_URL}/customer/connectedAccountId/${id}`, {
                headers: {
                    Authorization: `Bearer ${authCtx.token}`,
                    Accept: "*/*",
                    "Content-Type": "application/json" // Fixed header key
                }
            });
            console.log(connected.data)
            console.log(selectedCategory)
            console.log(selectedServices)

            // const response = await axios.post(
            //     `${BASE_URL}/payments/create-payment-intent`,
            //     {
            //         amount: 50000, // Example amount, replace as needed
            //         currency: 'usd', // Example currency, replace as needed
            //         connectedAccountId: "acct_1QeK012agRCe4aIy", // Assuming userData contains the connected account ID
            //     },
            //     {
            //         headers: {
            //             Authorization: `Bearer ${authCtx.token}`,
            //             Accept: '*/*',
            //             'Content-Type': 'application/json',
            //         },
            //     }
            // );

            // Extract client secret from the response
            // const {clientSecret} = response.data;
            // setClientSecret(clientSecret);

            // console.log('Payment intent created:', response.data);

            // Use Stripe's confirmPayment method to complete the payment
            // const {error, paymentIntent} = await stripe.confirmCardPayment(clientSecret, {
            //     payment_method: {
            //         type: 'Card',
            //         billingDetails: { // Provide the necessary billing details
            //             name: userData.name,  // Replace with actual user data
            //             email: userData.email, // Replace with actual user data
            //         },
            //     }
            // });

            // if (error) {
            //     console.error('Payment failed:', error.message);
            //     Alert.alert('Payment Error', error.message);
            // } else if (paymentIntent) {
            //     console.log('Payment successful:', paymentIntent);

                // Proceed with reserving the hall if the payment was successful

            const customerData = await axios.get(`${BASE_URL}/customer/getCustomerByUserId/${userData.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${authCtx.token}`,
                        "Content-Type": "application/json",
                        Accept: "*/*"
                    }
                }
        );

            console.log(customerData.data)

                const newHallInstance = {
                    hallId: id,
                    customerId: customerData.data,
                    time: selectedDate,
                    services: selectedServices,
                    endTime: null,
                    selectedCategory: selectedCategory,
                };

            console.log(newHallInstance)

                await axios.post(`${BASE_URL}/customer/reserveHall`, newHallInstance, {
                    headers: {
                        Authorization: `Bearer ${authCtx.token}`,
                        Accept: '*/*',
                    },
                });

                console.log("Reservation successful.");
                Alert.alert('Payment and Reservation', 'Your payment and reservation were successful.');
                navigation.navigate('tabHome'); // Navigate after successful payment/reservation
            // }

        } catch (error) {
            console.error('Payment or reservation failed:', error.response?.data || error.message);
            Alert.alert('Error', 'Payment or reservation failed. Please try again.');
        }
    };


    return (
        <View style={styles.container}>
            <Text style={styles.header}>Payment Details</Text>

            <TextInput
                style={styles.input}
                placeholder="Card Number"
                keyboardType="numeric"
                maxLength={19}
                onChangeText={handleCardNumberChange}
                value={cardNumber}
            />

            <TextInput
                style={styles.input}
                placeholder="Expiry Date (MM/YY)"
                keyboardType="numeric"
                maxLength={5}
                onChangeText={handleExpiryDateChange}
                value={expiryDate}
            />

            <TextInput
                style={styles.input}
                placeholder="CVV"
                keyboardType="numeric"
                maxLength={4}
                onChangeText={setCvv}
                value={cvv}
            />

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f8f8f8',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 15,
        paddingHorizontal: 10,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#d9a773',
        borderRadius: 5,
        paddingVertical: 15,
        marginTop: 20,
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default PaymentDetailsScreen;
