import React, { useContext, useEffect, useState } from "react";
import { View, Pressable, StyleSheet, Button, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { HallsContext } from "../store/HallsContext";
import { fetchHalls } from "../utill/FBdata";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import HallsOutput from "../components/ui/HallsOutpup";
import { AuthContext } from "../store/auth-context";
import { useIsFocused } from "@react-navigation/native";
import { useSelector } from "react-redux";

function MainScreen({ navigation }) {
    const hallsCtx = useContext(HallsContext);
    const authCtx = useContext(AuthContext);
    const isFocused = useIsFocused();

    const [isFetching, setIsFetching] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterData, setFilterData] = useState({});
    const [searchQuery, setSearchQuery] = useState("");

    const searchQuerySelector = useSelector((state) => state.bookedHalls.searchQuery);
    const userData = useSelector((state) => state.bookedHalls.userData);

    useEffect(() => {
        if (!searchQuerySelector) {
            setFilterData({});
        }
        setSearchQuery(searchQuerySelector);
    }, [searchQuerySelector]);

    useEffect(() => {
        async function getHalls() {
            setIsFetching(true);

            const updatedFilterData = Object.keys(filterData).length ? filterData : {};
            const updatedSearchQuery = searchQuery.trim();

            try {
                const { halls, totalPages } = await fetchHalls(
                    currentPage,
                    3,
                    updatedFilterData,
                    updatedSearchQuery,
                    userData.id,
                );

                hallsCtx.setHall(halls);
                setTotalPages(totalPages);
            } catch (error) {
                console.error("Error fetching halls:", error.message);
            } finally {
                setIsFetching(false);
            }
        }

        getHalls();
    }, [filterData, searchQuery, currentPage]); // Ensure this useEffect depends on filterData

    useEffect(() => {
        if (isFocused) {
            authCtx.setBooked(false);
        }
    }, [isFocused]);

    const handleFilterApply = (data) => {
        setFilterData(data); // Update filterData state
        setCurrentPage(1); // Reset to the first page when filter changes
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

            <View style={styles.paginationContainer}>
                <Button
                    title="Previous"
                    onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                />
                <Text style={styles.pageText}>
                    Page {currentPage} of {totalPages}
                </Text>
                <Button
                    title="Next"
                    onPress={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                />
            </View>

            <Pressable
                style={({ pressed }) => [
                    styles.floatingButton,
                    pressed ? styles.pressedButton : null,
                ]}
                onPress={() => navigation.navigate("Filter", { onApply: handleFilterApply })}
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
    paginationContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 10,
        marginHorizontal: 20,
        marginBottom: 20,
    },
    pageText: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
    },
    floatingButton: {
        position: "absolute",
        bottom: 90,
        right: 20,
        backgroundColor: "#d9a773",
        borderRadius: 30,
        width: 50,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        elevation: 5,
    },
    pressedButton: {
        opacity: 0.5,
    },
});