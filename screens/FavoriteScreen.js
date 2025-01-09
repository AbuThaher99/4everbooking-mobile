import React, { useState, useContext, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { AuthContext } from '../store/auth-context';
import {fetchBookedHalls, fetchFavoriteHalls} from '../utill/FBdata';
import HallsOutput from '../components/ui/HallsOutpup';
import {useSelector} from "react-redux";

export function FavoriteScreen() {
    const [favoriteHalls, setFavoriteHalls] = useState([]);
    const authCtx = useContext(AuthContext);
    const isFocused = useIsFocused();
    const [dataFetched, setDataFetched] = useState(false);
    const userData = useSelector((state) => state.bookedHalls.userData);


    useEffect(() => {
        if (isFocused) {
            authCtx.setBooked(false);
            const fetchHallsForCurrentUser = async () => {
                try {
                    const halls = await fetchFavoriteHalls(userData.id,authCtx.token);

                    setFavoriteHalls(halls);
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
            halls={favoriteHalls}
            fallbackText="No Favorite Halls found!"
        />
    );
}

