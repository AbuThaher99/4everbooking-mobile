import React, {useContext, useEffect, useState} from 'react';
import {useIsFocused} from '@react-navigation/native';
import {AuthContext} from '../store/auth-context';
import {fetchOwnersReservedHalls} from '../utill/FBdata';
import HallsOutput from '../components/ui/HallsOutpup';
import {useSelector} from "react-redux";
import {BASE_URL} from "../assets/constant/ip"; // Assuming a slice for hall owner data

export default function HallOwnerReservedScreen() {
    const [bookedHalls, setBookedHalls] = useState([]);
    const [dataFetched, setDataFetched] = useState(false);
    const [hallOwnerData, setHallOwnerData] = useState(null);
    const authCtx = useContext(AuthContext);
    const isFocused = useIsFocused();
    const userData = useSelector((state) => state.bookedHalls.userData);

    useEffect(() => {
        if (isFocused) {
            authCtx.setBooked(true);

            const fetchHallOwnerData = async () => {
                try {
                    const response = await fetch(
                        `${BASE_URL}/hallOwner/getHallOwnerByUserId/${userData.id}`,
                        {
                            headers: {
                                accept: '*/*',
                                Authorization: `Bearer ${authCtx.token}`, // Use token passed as argument
                            },
                        }
                    );
                    const data = await response.json();
                    setHallOwnerData(data); // Save data locally in state
                } catch (error) {
                    console.error('Error fetching hall owner data:', error);
                }
            };

            const fetchHallsForCurrentUser = async () => {
                try {
                    const halls = await fetchOwnersReservedHalls(authCtx.token, hallOwnerData.id);
                    setBookedHalls(halls);
                    setDataFetched(true);
                } catch (error) {
                    console.error('Error fetching halls:', error);
                }
            };

            // Fetch data
            fetchHallOwnerData();
            fetchHallsForCurrentUser();
        }
    }, [isFocused, authCtx.token, dataFetched]);

    return (
        <HallsOutput
            halls={bookedHalls}
            fallbackText="No Reserved Halls found!"
        />
    );
}
