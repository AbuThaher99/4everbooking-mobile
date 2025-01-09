import axios from "axios";
import {BASE_URL} from "../assets/constant/ip";
import {Linking} from 'react-native'

const API = "AIzaSyBh8hinGssigzfcFW4njpqP45idaAqzECA";

export async function authenticate(email, phoneNumber, password, firstName, lastName, companyName, dateOfBirth, role) {
    let response = null;
    if (role === "buyer") {
        const url = `${BASE_URL}/whitelist/CustomerRegister`;

        response = await axios.post(url, {
            user: {
                email: email,
                phone: phoneNumber,
                password: password,
                firstName: firstName,
                lastName: lastName,
                dateOfBirth: dateOfBirth,
                address: 'sdawdw'
            }
        });
    } else {
        const url = `${BASE_URL}/whitelist/RegisterHallOwner`;

        response = await axios.post(url, {
            companyName: companyName,
            user: {
                email: email,
                phone: phoneNumber,
                password: password,
                firstName: firstName,
                lastName: lastName,
                dateOfBirth: dateOfBirth,
                address: 'sdawdw'

            }
        });
        const getUser = await axios.get(`${BASE_URL}/whitelist/getUser`, {
            headers: {
                Authorization: `Bearer ${response.data.access_token}`,
                Accept: '*/*'
            }
        });

        const userId = getUser.data.id; // Assuming `getUser.data.id` contains the user ID
        const stripeAccountResponse = await axios.post(
            `${BASE_URL}/whitelist/createHallOwnerStripeAccount/${userId}`,
            {}, // Empty body as per the cURL request
            {
                headers: {
                    Accept: '*/*'
                }
            }
        );

        console.log("Stripe Account Response:", stripeAccountResponse.data);

        console.log(stripeAccountResponse.data);
        Linking.openURL(stripeAccountResponse.data).catch(error => console.log(error));
    }
}

export async function login(email, password) {
    const url = `${BASE_URL}/auth/login`;

    try {
        const response = await axios.post(url, {
            password: password,
            email: email
        });
        return response.data.access_token;
    } catch (error) {
        throw new Error("Login failed. Please check your credentials.");
    }
}

