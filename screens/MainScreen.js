import React, { useContext, useEffect, useState } from "react";
import { View, Pressable, StyleSheet,Text  } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // For the filter icon
import { HallsContext } from "../store/HallsContext";
import { fetchHalls } from "../utill/FBdata";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import HallsOutput from "../components/ui/HallsOutpup";
import { AuthContext } from "../store/auth-context";
import { useIsFocused } from "@react-navigation/native";
import {useDispatch, useSelector} from "react-redux";
import {setUserData} from "../store/redux/book";
import {BASE_URL} from "../assets/constant/ip";

function MainScreen({navigation,route}) {
    React.useEffect(() => {
        navigation.setParams({ activeTab: 'Home' });
    }, [navigation]);

    const hallsCtx = useContext(HallsContext);
    const [isFetching, setIsFetching] = useState(false);
    const authCtx = useContext(AuthContext);
    const isFocused = useIsFocused();
    const [filterData, setFilterData] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const searchQuerySelector = useSelector((state) => state.bookedHalls.searchQuery);

    useEffect(() => {
        setSearchQuery(searchQuerySelector);
    }, [searchQuerySelector]);



    useEffect(() => {
        setIsFetching(true);
        async function getHalls() {
            const halls = await fetchHalls(1,10,filterData,searchQuery);
            setIsFetching(false);
            hallsCtx.setHall(halls);
        }

        getHalls();
    }, [filterData,searchQuery]);

    useEffect(() => {
        if (isFocused) {
            authCtx.setBooked(false);
        }
    }, [isFocused]);

    if (isFetching) {
        return <LoadingOverlay />;
    }


    const handleFilterApply = (data) => {
        setFilterData(data);
        console.log('Filter Data:', filterData);

    };

    return (
        <View style={styles.container}>
            <HallsOutput
                halls={hallsCtx.halls}
                fallbackText="No registered expenses found!"
            />

            <Pressable
                style={({pressed}) =>  [styles.floatingButton, pressed ? styles.pressedButton : null]}
                onPress={() => {
                    navigation.navigate('Filter', { onApply: handleFilterApply })
                }}
            >
                <Ionicons name="options" size={24} color="white" />
            </Pressable>


        </View>
    );
}

export default MainScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    floatingButton: {
        position: "absolute",
        bottom: 20, // Distance from the bottom
        right: 20, // Distance from the right
        backgroundColor: "#d9a773", // Button background color
        borderRadius: 30, // Round shape
        width: 50, // Button size
        height: 50, // Button size
        justifyContent: "center",
        alignItems: "center", // Center the icon
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        elevation: 5, // For Android shadow
    },
    pressedButton: {
        opacity: 0.50
    }
});
