import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import axios from 'axios';
import { AuthContext } from "../store/auth-context";
import { BASE_URL } from "../assets/constant/ip";

const DeletedUsersScreen = () => {
    const [deletedUsers, setDeletedUsers] = useState([]); // List of deleted users
    const [loading, setLoading] = useState(false); // Loading state
    const [currentPage, setCurrentPage] = useState(1); // Pagination
    const [totalPages, setTotalPages] = useState(0); // Total pages
    const authCtx = useContext(AuthContext);

    // Fetch deleted users
    const fetchDeletedUsers = async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/admin/DeletedUsers`, {
                headers: {
                    Authorization: `Bearer ${authCtx.token}`,
                    Accept: '*/*',
                },
                params: { page, size: 3 },
            });
            setDeletedUsers(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching deleted users:', error);
        } finally {
            setLoading(false);
        }
    };

    // Restore user
    const restoreUser = async (userId) => {
        Alert.alert(
            "Confirm Restore",
            "Are you sure you want to restore this user?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Restore",
                    style: "default",
                    onPress: async () => {
                        try {
                            await axios.put(
                                `${BASE_URL}/admin/restoreUser/${userId}`,
                                {},
                                {
                                    headers: {
                                        Authorization: `Bearer ${authCtx.token}`,
                                        Accept: '*/*',
                                    },
                                }
                            );
                            alert(`User ID ${userId} restored successfully!`);
                            fetchDeletedUsers(currentPage); // Refresh the list
                        } catch (error) {
                            console.error('Error restoring user:', error);
                        }
                    },
                },
            ]
        );
    };

    // Fetch users on component mount and page change
    useEffect(() => {
        fetchDeletedUsers(currentPage);
    }, [currentPage]);

    // Pagination component
    const renderPagination = () => {
        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

        return (
            <View style={styles.paginationContainer}>
                <TouchableOpacity
                    style={[
                        styles.paginationButton,
                        currentPage === 1 && styles.paginationButtonDisabled,
                    ]}
                    onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                >
                    <Text style={styles.paginationButtonText}>Previous</Text>
                </TouchableOpacity>
                {pages.map((page) => (
                    <TouchableOpacity
                        key={page}
                        style={[
                            styles.paginationButton,
                            currentPage === page && styles.paginationButtonActive,
                        ]}
                        onPress={() => setCurrentPage(page)}
                    >
                        <Text
                            style={[
                                styles.paginationButtonText,
                                currentPage === page && styles.paginationButtonTextActive,
                            ]}
                        >
                            {page}
                        </Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity
                    style={[
                        styles.paginationButton,
                        currentPage === totalPages && styles.paginationButtonDisabled,
                    ]}
                    onPress={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                >
                    <Text style={styles.paginationButtonText}>Next</Text>
                </TouchableOpacity>
            </View>
        );
    };

    // Render user item
    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderText}>{item.firstName} {item.lastName}</Text>
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{item.email}</Text>
                <Text style={styles.label}>Role:</Text>
                <Text style={styles.value}>{item.role}</Text>
                <Text style={styles.label}>Address:</Text>
                <Text style={styles.value}>{item.address}</Text>
                <Text style={styles.label}>Phone:</Text>
                <Text style={styles.value}>{item.phone}</Text>
                <TouchableOpacity
                    style={styles.restoreButton}
                    onPress={() => restoreUser(item.id)}
                >
                    <Text style={styles.buttonText}>Restore</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Deleted Users</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />
            ) : (
                <>
                    <FlatList
                        data={deletedUsers}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
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
        backgroundColor: '#f9f9f9',
        padding: 16,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
        color: '#333',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        marginBottom: 12,
    },
    cardHeaderText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2d2d2d',
    },
    label: {
        fontWeight: '600',
        color: '#555',
        marginTop: 4,
    },
    value: {
        color: '#333',
        marginBottom: 8,
    },
    restoreButton: {
        backgroundColor: '#d9a773',
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    paginationButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: '#d9a773',
        borderRadius: 8,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 1,
    },
    paginationButtonActive: {
        backgroundColor: '#d9a773',
        borderColor: '#d9a773',
    },
    paginationButtonDisabled: {
        opacity: 0.5,
    },
    paginationButtonText: {
        color: '#d9a773',
        fontWeight: 'bold',
    },
    paginationButtonTextActive: {
        color: '#fff',
    },
    loader: {
        marginTop: 20,
    },
});


export default DeletedUsersScreen;
