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
        backgroundColor: '#fff',
        padding: 16,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 16,
        padding: 10,
    },
    cardHeader: {
        marginBottom: 10,
    },
    cardHeaderText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    label: {
        fontWeight: 'bold',
        color: '#555',
    },
    value: {
        color: '#333',
        marginBottom: 10,
    },
    restoreButton: {
        backgroundColor: '#4caf50',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    paginationButton: {
        padding: 10,
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: '#007BFF',
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    paginationButtonActive: {
        backgroundColor: '#007BFF',
    },
    paginationButtonDisabled: {
        opacity: 0.5,
    },
    paginationButtonText: {
        color: '#007BFF',
        fontWeight: 'bold',
    },
    paginationButtonTextActive: {
        color: '#fff',
    },
});

export default DeletedUsersScreen;
