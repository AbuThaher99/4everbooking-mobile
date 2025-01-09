import React, { useState, useContext, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { AuthContext } from '../store/auth-context';
import {fetchBookedHalls} from '../utill/FBdata';
import HallsOutput from '../components/ui/HallsOutpup';
import {useSelector} from "react-redux";

export function BookedScreen() {
    const [bookedHalls, setBookedHalls] = useState([]);
    const authCtx = useContext(AuthContext);
    const isFocused = useIsFocused();
    const [dataFetched, setDataFetched] = useState(false);
    const userData = useSelector((state) => state.bookedHalls.userData);


    useEffect(() => {
        if (isFocused) {
            authCtx.setBooked(true);
            const fetchHallsForCurrentUser = async () => {
                try {
                    const halls = await fetchBookedHalls(userData.id,authCtx.token);

                    setBookedHalls(halls);
                    setDataFetched(true);
                } catch (error) {
                    console.error('Error fetching halls:', error);
                }
            };

            fetchHallsForCurrentUser();
        }
    }, [isFocused, authCtx.token, dataFetched]);


    return (
        <HallsOutput
            halls={bookedHalls}
            fallbackText="No Booked Halls found!"
        />
    );
}

