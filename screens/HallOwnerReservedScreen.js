import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { AuthContext } from '../store/auth-context';
import { fetchOwnersReservedHalls } from '../utill/FBdata';
import { BASE_URL } from '../assets/constant/ip';
import { useSelector } from 'react-redux';

const HallOwnerReservedScreen = () => {
    const [reservedHalls, setReservedHalls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [hallOwnerData, setHallOwnerData] = useState(null);
    const authCtx = useContext(AuthContext);
    const userData = useSelector((state) => state.bookedHalls.userData);
    const isFocused = useIsFocused();

    const pageSize = 3; // Number of items per page

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

    useEffect(() => {
        if (hallOwnerData) {
            fetchReservedHalls(currentPage);
        }
    }, [hallOwnerData, currentPage]);

    const fetchReservedHalls = async (page) => {
        setLoading(true);
        try {
            const { reservedHalls, totalElements } = await fetchOwnersReservedHalls(
                authCtx.token,
                hallOwnerData.id,
                page,
                pageSize
            );

            setReservedHalls(reservedHalls);
            setTotalPages(Math.ceil(totalElements / pageSize));
        } catch (error) {
            console.error('Error fetching reserved halls:', error);
        } finally {
            setLoading(false);
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
            <Text style={styles.cardTitle}>{item.hallName}</Text>
            <Text style={styles.cardText}>
                <Text style={styles.label}>Time:</Text> {item.time ? new Date(item.time).toLocaleString() : 'N/A'}
            </Text>
            {item.endTime && (
                <Text style={styles.cardText}>
                    <Text style={styles.label}>End Time:</Text> {new Date(item.endTime).toLocaleString()}
                </Text>
            )}
            <Text style={styles.cardText}>
                <Text style={styles.label}>Category:</Text> {item.category || 'N/A'}
            </Text>
            <Text style={styles.cardText}>
                <Text style={styles.label}>Total Price:</Text> ${item.totalPrice || 'N/A'}
            </Text>
            {item.services && (
                <View style={styles.servicesContainer}>
                    <Text style={styles.label}>Services:</Text>
                    {Object.entries(item.services).map(([service, price]) => (
                        <Text key={service} style={styles.serviceText}>
                            - {service}: ${price}
                        </Text>
                    ))}
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#007BFF" />
            ) : (
                <>
                    <FlatList
                        data={reservedHalls}
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
        padding: 16,
        backgroundColor: '#f8f8f8',
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
        marginBottom: 4,
    },
    label: {
        fontWeight: 'bold',
        color: '#333',
    },
    servicesContainer: {
        marginTop: 8,
    },
    serviceText: {
        fontSize: 14,
        color: '#555',
        marginLeft: 8,
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    paginationButton: {
        padding: 10,
        backgroundColor: '#007BFF',
        borderRadius: 5,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    paginationText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    paginationInfo: {
        fontSize: 16,
        color: '#333',
    },
});

export default HallOwnerReservedScreen;
