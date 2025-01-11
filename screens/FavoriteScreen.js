import React, { useState, useContext, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { AuthContext } from '../store/auth-context';
import { fetchFavoriteHalls } from '../utill/FBdata';
import { useSelector } from 'react-redux';
import HallItems from '../components/ui/HallItems'; // Import the HallItems component

export function FavoriteScreen() {
    const [favoriteHalls, setFavoriteHalls] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const authCtx = useContext(AuthContext);
    const isFocused = useIsFocused();
    const userData = useSelector((state) => state.bookedHalls.userData);

    const pageSize = 3;

    const fetchHallsForCurrentUser = async (page = 1) => {
        setLoading(true);
        try {
            const { halls, totalPages } = await fetchFavoriteHalls(
                userData.id,
                authCtx.token,
                page,
                pageSize
            );

            setFavoriteHalls(halls);
            setTotalPages(totalPages);
        } catch (error) {
            console.error('Error fetching halls:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFocused) {
            fetchHallsForCurrentUser(currentPage);
        }
    }, [isFocused, currentPage]);

    const changePage = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const renderHallItem = ({ item }) => (
        <HallItems
            id={item.id}
            name={item.name}
            imageUrl={item.imageUrl}
            location={item.location}
            phoneNumber={item.phoneNumber}
            services={item.services}
            capacity={item.capacity}
            description={item.description}
            categories={item.categories}
            longitude={item.longitude}
            latitude={item.latitude}
            averageRating={item.averageRating}
            HallRatings={item.HallRatings}
        />
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />
            ) : (
                <>
                    <FlatList
                        data={favoriteHalls}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderHallItem}
                        contentContainerStyle={styles.list}
                    />
                    <View style={styles.paginationContainer}>
                        <TouchableOpacity
                            style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
                            onPress={() => changePage(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <Text style={styles.paginationText}>Previous</Text>
                        </TouchableOpacity>
                        <Text style={styles.pageIndicator}>
                            Page {currentPage} of {totalPages}
                        </Text>
                        <TouchableOpacity
                            style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]}
                            onPress={() => changePage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            <Text style={styles.paginationText}>Next</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    list: {
        padding: 16,
    },
    loader: {
        marginTop: 20,
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    paginationButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#d9a773',
        borderRadius: 8,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    paginationText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    pageIndicator: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
});
