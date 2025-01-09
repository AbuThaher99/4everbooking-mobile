import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Alert,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native'; // Import navigation hooks
import { AuthContext } from '../store/auth-context';
import { fetchOwnersHalls } from '../utill/FBdata';
import { BASE_URL } from '../assets/constant/ip';
import { useSelector } from 'react-redux';

const OwnersHallsScreen = () => {
    const [halls, setHalls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [filters, setFilters] = useState({
        page: 1,
        size: 5, // Default page size
    });
    const authCtx = useContext(AuthContext);
    const userData = useSelector((state) => state.bookedHalls.userData);
    const [hallOwnerData, setHallOwnerData] = useState(null);
    const isFocused = useIsFocused();
    const navigation = useNavigation(); // Use navigation hook

    // Fetch hall owner data
    useEffect(() => {
        if (isFocused) {
            const fetchHallOwnerData = async () => {
                try {
                    const response = await fetch(
                        `${BASE_URL}/hallOwner/getHallOwnerByUserId/${userData.id}`,
                        {
                            headers: {
                                accept: '*/*',
                                Authorization: `Bearer ${authCtx.token}`,
                            },
                        }
                    );

                    if (!response.ok) {
                        throw new Error('Failed to fetch hall owner data');
                    }

                    const data = await response.json();
                    setHallOwnerData(data);
                } catch (error) {
                    console.error('Error fetching hall owner data:', error);
                }
            };

            fetchHallOwnerData();
        }
    }, [isFocused]);

    // Fetch halls whenever filters or hall owner data changes
    useEffect(() => {
        if (hallOwnerData) {
            fetchHalls();
        }
    }, [filters, hallOwnerData]);

    const fetchHalls = async () => {
        setLoading(true);
        try {
            const hallsResponse = await fetchOwnersHalls(
                authCtx.token,
                hallOwnerData.id,
                filters.page,
                filters.size
            );

            setHalls(hallsResponse.halls);
            setTotalPages(Math.ceil(hallsResponse.totalElements / filters.size));
        } catch (error) {
            console.error('Error fetching halls:', error);
        } finally {
            setLoading(false);
        }
    };

    // Change the current page
    const changePage = (page) => {
        if (page > 0 && page <= totalPages) {
            setFilters((prev) => ({ ...prev, page }));
        }
    };

    const handleDelete = async (hallId) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this hall?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await fetch(
                                `${BASE_URL}/hallOwner/?id=${hallId}&OwnerId=${hallOwnerData.id}`,
                                {
                                    method: 'DELETE',
                                    headers: {
                                        Authorization: `Bearer ${authCtx.token}`,
                                        Accept: '*/*',
                                    },
                                }
                            );

                            if (!response.ok) {
                                throw new Error('Failed to delete the hall.');
                            }

                            const data = await response.json();
                            alert(data.message || 'Hall deleted successfully!');
                            fetchHalls(); // Refresh the list after deletion
                        } catch (error) {
                            console.error('Error deleting hall:', error);
                            alert('Error deleting the hall.');
                        }
                    },
                },
            ]
        );
    };

    const handleUpdate = (hallId) => {
        navigation.navigate('UpdateHall', { hallId }); // Navigate to UpdateHallScreen
    };

    const renderPagination = () => {
        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

        return (
            <View style={styles.paginationContainer}>
                <TouchableOpacity
                    style={[styles.paginationButton, filters.page === 1 && styles.paginationButtonDisabled]}
                    onPress={() => changePage(filters.page - 1)}
                    disabled={filters.page === 1}
                >
                    <Text style={styles.paginationButtonText}>Previous</Text>
                </TouchableOpacity>

                {pages.map((page) => (
                    <TouchableOpacity
                        key={page}
                        style={[styles.paginationButton, filters.page === page && styles.paginationButtonActive]}
                        onPress={() => changePage(page)}
                    >
                        <Text style={[styles.paginationButtonText, filters.page === page && styles.paginationButtonTextActive]}>
                            {page}
                        </Text>
                    </TouchableOpacity>
                ))}

                <TouchableOpacity
                    style={[styles.paginationButton, filters.page === totalPages && styles.paginationButtonDisabled]}
                    onPress={() => changePage(filters.page + 1)}
                    disabled={filters.page === totalPages}
                >
                    <Text style={styles.paginationButtonText}>Next</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderHallCard = ({ item }) => (
        <View style={styles.card}>
            <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardText}>
                    <Text style={styles.label}>Location:</Text> {item.location}
                </Text>
                <Text style={styles.cardText}>
                    <Text style={styles.label}>Capacity:</Text> {item.capacity}
                </Text>
                <Text style={styles.cardText}>
                    <Text style={styles.label}>Phone:</Text> {item.phoneNumber}
                </Text>
                <View style={styles.buttonGroup}>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete(item.id)}
                    >
                        <Text style={styles.buttonText}>Delete</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.updateButton}
                        onPress={() => handleUpdate(item.id)} // Pass the hallId here
                    >
                        <Text style={styles.updateButtonText}>Update</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#007BFF" />
            ) : (
                <>
                    <FlatList
                        data={halls}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderHallCard}
                        contentContainerStyle={styles.listContainer}
                    />
                    {renderPagination()}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
        padding: 16,
    },
    listContainer: {
        paddingBottom: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 4,
        overflow: 'hidden',
    },
    cardImage: {
        width: '100%',
        height: 180,
        resizeMode: 'cover',
    },
    cardContent: {
        padding: 16,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    cardText: {
        fontSize: 14,
        color: '#555',
        marginBottom: 8,
    },
    label: {
        fontWeight: 'bold',
        color: '#333',
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    deleteButton: {
        backgroundColor: '#e74c3c',
        padding: 10,
        borderRadius: 8,
        flex: 1,
        marginRight: 5,
        alignItems: 'center',
    },
    updateButton: {
        backgroundColor: '#3498db',
        padding: 10,
        borderRadius: 8,
        flex: 1,
        marginLeft: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
    },
    paginationButton: {
        padding: 10,
        marginHorizontal: 5,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#3498db',
        backgroundColor: '#fff',
    },
    paginationButtonActive: {
        backgroundColor: '#3498db',
    },
    paginationButtonDisabled: {
        opacity: 0.5,
    },
    paginationButtonText: {
        color: '#3498db',
        fontWeight: 'bold',
    },
    paginationButtonTextActive: {
        color: '#fff',
    },
});

export default OwnersHallsScreen;
