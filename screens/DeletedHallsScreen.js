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
import { useIsFocused } from '@react-navigation/native';
import { AuthContext } from '../store/auth-context';
import { BASE_URL } from '../assets/constant/ip';
import { useSelector } from 'react-redux';

const DeletedHallsScreen = () => {
    const [deletedHalls, setDeletedHalls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [hallOwnerData, setHallOwnerData] = useState(null);
    const authCtx = useContext(AuthContext);
    const userData = useSelector((state) => state.bookedHalls.userData);
    const isFocused = useIsFocused();
    const pageSize = 5;

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

    useEffect(() => {
        if (hallOwnerData) {
            fetchDeletedHalls(currentPage);
        }
    }, [hallOwnerData, currentPage]);

    const fetchDeletedHalls = async (page) => {
        setLoading(true);
        try {
            const response = await fetch(
                `${BASE_URL}/hallOwner/getDeletedHallsByHallOwner?page=${page}&size=${pageSize}&hallOwnerId=${hallOwnerData.id}`,
                {
                    headers: {
                        accept: '*/*',
                        Authorization: `Bearer ${authCtx.token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch deleted halls');
            }

            const data = await response.json();
            setDeletedHalls(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error('Error fetching deleted halls:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (hallId) => {
        console.log(hallId)
        console.log(authCtx.token)
        try {
            const response = await fetch(
                `${BASE_URL}/hallOwner/restoreHall?id=${hallId}&ownerId=${hallOwnerData.id}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${authCtx.token}`,
                        Accept: '*/*',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to restore hall');
            }

            const data = await response.json();
            Alert.alert('Success', data.message || 'Hall restored successfully!');
            fetchDeletedHalls(currentPage); // Refresh the list after restoring
        } catch (error) {
            console.error('Error restoring hall:', error);
            Alert.alert('Error', 'Failed to restore the hall.');
        }
    };

    const changePage = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const renderPagination = () => (
        <View style={styles.paginationContainer}>
            <TouchableOpacity
                style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
                onPress={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <Text style={styles.paginationText}>Previous</Text>
            </TouchableOpacity>
            <Text style={styles.paginationInfo}>
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
    );

    const renderHallCard = ({ item }) => (
        <View style={styles.card}>
            <Image source={{ uri: item.image.split(',')[0]?.trim() }} style={styles.cardImage} />
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardText}>
                    <Text style={styles.label}>Location:</Text> {item.location}
                </Text>
                <Text style={styles.cardText}>
                    <Text style={styles.label}>Capacity:</Text> {item.capacity}
                </Text>
                <Text style={styles.cardText}>
                    <Text style={styles.label}>Phone:</Text> {item.phone}
                </Text>
                <TouchableOpacity
                    style={styles.restoreButton}
                    onPress={() => handleRestore(item.id)}
                >
                    <Text style={styles.restoreButtonText}>Restore</Text>
                </TouchableOpacity>
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
                        data={deletedHalls}
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
    restoreButton: {
        marginTop: 10,
        paddingVertical: 10,
        backgroundColor: '#2ecc71',
        borderRadius: 8,
        alignItems: 'center',
    },
    restoreButtonText: {
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
    paginationInfo: {
        fontSize: 16,
        color: '#333',
    },
});

export default DeletedHallsScreen;
