import React, { useContext, useEffect, useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // For the filter icon
import { HallsContext } from "../store/HallsContext";
import { fetchHalls } from "../utill/FBdata";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import HallsOutput from "../components/ui/HallsOutpup";
import { AuthContext } from "../store/auth-context";
import { useIsFocused } from "@react-navigation/native";
import { useSelector } from "react-redux";

function MainScreen({ navigation, route }) {
    React.useEffect(() => {
        navigation.setParams({ activeTab: "Home" });
    }, [navigation]);

    const hallsCtx = useContext(HallsContext);
    const [isFetching, setIsFetching] = useState(false);
    const authCtx = useContext(AuthContext);
    const isFocused = useIsFocused();
    const [filterData, setFilterData] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const searchQuerySelector = useSelector((state) => state.bookedHalls.searchQuery);

    // Update search query and clear filter when searchQuerySelector is cleared
    useEffect(() => {
        if (!searchQuerySelector) {
            setFilterData({}); // Reset filter data when query is cleared
        }
        setSearchQuery(searchQuerySelector);
    }, [searchQuerySelector]);

    // Fetch halls when filterData or searchQuery changes
    useEffect(() => {
        async function getHalls() {
            setIsFetching(true);

            // Only use filterData and searchQuery if they are valid
            const updatedFilterData = Object.keys(filterData).length ? filterData : {};
            const updatedSearchQuery = searchQuery.trim();

            const halls = await fetchHalls(1, 10, updatedFilterData, updatedSearchQuery);

            console.log("API called with filterData:", updatedFilterData, "searchQuery:", updatedSearchQuery);

            setIsFetching(false);
            hallsCtx.setHall(halls);
        }

        getHalls();
    }, [filterData, searchQuery]);

    // Reset booked state when screen is focused
    useEffect(() => {
        if (isFocused) {
            authCtx.setBooked(false);
        }
    }, [isFocused]);

    // Handle filter application
    const handleFilterApply = (data) => {
        setFilterData(data);
        console.log("Filter applied with data:", data); // Logs the new filter data correctly
    };

    if (isFetching) {
        return <LoadingOverlay />;
    }

    return (
        <View style={styles.container}>
            <HallsOutput
                halls={hallsCtx.halls}
                fallbackText="No halls found based on the applied filters!"
            />

            <Pressable
                style={({ pressed }) => [
                    styles.floatingButton,
                    pressed ? styles.pressedButton : null,
                ]}
                onPress={() => {
                    navigation.navigate("Filter", { onApply: handleFilterApply });
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
        opacity: 0.5,
    },
});