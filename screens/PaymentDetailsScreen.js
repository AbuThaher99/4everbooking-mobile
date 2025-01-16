import React, {useContext, useState} from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import {useDispatch, useSelector} from "react-redux";
import axios from "axios";
import {BASE_URL} from "../assets/constant/ip";
import {AuthContext} from "../store/auth-context";
import {useStripe, CardField} from '@stripe/stripe-react-native';

function PaymentDetailsScreen({route, navigation}) {
    const {id, selectedDate, selectedCategory, selectedServices,selectedPrice} = route.params;
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('usd');
    const [cardholderName, setCardholderName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const dispatch = useDispatch();
    const authCtx = useContext(AuthContext);
    const userData = useSelector((state) => state.bookedHalls.userData);

    const stripe = useStripe();
    const [totalPrice,setTotalPrice] = useState(0);
    // Step 2: Calculate Total Price
    // Calculate total price on mount
    React.useEffect(() => {
        const totalPrices = Object.values(selectedServices).reduce((acc, price) => acc + price, 0) + selectedPrice;
        console.log(totalPrices);
        setAmount(totalPrices.toString()); // Set amount here
        setTotalPrice(totalPrices);
    }, [selectedServices, selectedPrice]);


    const handleSubmit = async () => {
        console.log('handleSubmit called');
        if (!currency || !cardholderName) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        setIsProcessing(true);
        console.log('Processing started');

        try {
            console.log('Fetching connected account ID');
            const connectedAccountResponse = await axios.get(
                `${BASE_URL}/customer/connectedAccountId/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${authCtx.token}`,
                        Accept: "*/*",
                        "Content-Type": "application/json",
                    },
                }
            );

            const connectedAccountId = connectedAccountResponse.data;
            console.log('Connected Account ID:', connectedAccountId);

            console.log('Creating payment intent');
            const paymentIntentResponse = await axios.post(
                `${BASE_URL}/payments/create-payment-intent`,
                {
                    amount: totalPrice * 100,
                    currency,
                    connectedAccountId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${authCtx.token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const { clientSecret } = paymentIntentResponse.data;
            console.log('Client Secret:', clientSecret);

            console.log('Confirming payment with Stripe');
            const { error, paymentIntent } = await stripe.confirmPayment(clientSecret, {
                paymentMethodType: 'Card',
                paymentMethodData: {
                    billingDetails: {
                        name: cardholderName,
                    },
                },
            });

            if (error) {
                console.error('Payment error:', error);
                Alert.alert('Payment Failed', error.message);
                setIsProcessing(false);
                return;
            }

            if (paymentIntent && paymentIntent.status === 'Succeeded') {
                console.log('Payment succeeded, fetching customer data');
                const customerDataResponse = await axios.get(
                    `${BASE_URL}/customer/getCustomerByUserId/${userData.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${authCtx.token}`,
                            "Content-Type": "application/json",
                            Accept: "*/*",
                        },
                    }
                );

                const customerData = customerDataResponse.data;
                console.log('Customer Data:', customerData);

                const newHallInstance = {
                    hallId: id,
                    customerId: customerData,
                    time: selectedDate,
                    services: selectedServices,
                    endTime: selectedDate,
                    selectedCategory,
                };

                console.log('Reserving hall');
                await axios.post(`${BASE_URL}/customer/reserveHall`, newHallInstance, {
                    headers: {
                        Authorization: `Bearer ${authCtx.token}`,
                        Accept: '*/*',
                    },
                });

                Alert.alert('Reservation Success', 'Your reservation is successful');

                try {
                    console.log('Navigating to booked screen');
                    navigation.navigate('tabHome', {
                        screen: 'booked',
                    });
                } catch (err) {
                    console.error('Navigation error:', err);
                }
            }
        } catch (err) {
            console.error('Error:', err);
            Alert.alert('Error', err.message || 'Something went wroقng.');
        } finally {
            console.log('Processing finished');
            setIsProcessing(false);
        }
    };



    return (
        <View style={styles.container}>
            <Text style={styles.header}>Payment Details</Text>

            <TextInput
                style={styles.input}
                value={amount} // Display calculated amount
                editable={false} // Prevent user input
                placeholder="Amount"
                keyboardType="numeric"
            />


            <TextInput
                style={[styles.input, { display: 'none' }]}
                placeholder="Currency (e.g., usd)"
                value={currency}
                onChangeText={setCurrency}
            />


            <TextInput
                style={styles.input}
                placeholder="Cardholder Name"
                value={cardholderName}
                onChangeText={setCardholderName}
            />

            <CardField
                postalCodeEnabled={false}
                placeholder={{
                    number: '4242 4242 4242 4242',
                }}
                cardStyle={styles.card}
                style={styles.cardContainer}
            />

            <TouchableOpacity
                style={[styles.button, isProcessing && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={isProcessing}
            >
                <Text style={styles.buttonText}>
                    {isProcessing ? 'Processing...' : 'Submit Payment'}
                </Text>
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
    cardContainer: {
        height: 50,
        marginBottom: 20,
    },
    card: {
        backgroundColor: '#efefef',
    },
    button: {
        backgroundColor: '#d9a773',
        borderRadius: 5,
        paddingVertical: 15,
        marginTop: 20,
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default PaymentDetailsScreen;
