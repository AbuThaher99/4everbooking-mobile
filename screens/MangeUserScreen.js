import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Modal,
    ScrollView,
    Image,
    Button,
    Alert,
} from 'react-native';
import axios from 'axios';
import { AuthContext } from "../store/auth-context";
import { BASE_URL } from "../assets/constant/ip";
import {useSelector} from "react-redux";

const AdminControlScreen = () => {
    const [data, setData] = useState([]); // List of users
    const [loading, setLoading] = useState(false); // For initial loading
    const [selectedUser, setSelectedUser] = useState(null); // For the modal
    const [modalVisible, setModalVisible] = useState(false); // Modal visibility
    const [totalPages, setTotalPages] = useState(0); // Total pages
    const authCtx = useContext(AuthContext);
    const userData = useSelector((state) => state.bookedHalls.userData);

    const [filters, setFilters] = useState({
        email: '',
        role: '',
        page: 1,
        size: 3, // Number of items per page
    });

    // Fetch users from the API
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/admin/users`, {
                headers: {
                    Authorization: `Bearer ${authCtx.token}`,
                    Accept: '*/*',
                    "Content-Type": "application/json",
                },
                params: filters,
            });
            setData(response.data.content);
            setTotalPages(response.data.totalPages); // Set the total number of pages
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch data whenever filters change
    useEffect(() => {
        fetchUsers();
    }, [filters]);

    const handleRoleChange = (role) => {
        setFilters((prev) => ({ ...prev, role, page: 1 })); // Reset to page 1 when filter changes
    };

    const handleEmailChange = (email) => {
        setFilters((prev) => ({ ...prev, email, page: 1 })); // Reset to page 1 when filter changes
    };

    const clearFilters = () => {
        setFilters({
            email: '',
            role: '',
            page: 1,
            size: 3,
        });
    };

    // Change the current page
    const changePage = (page) => {
        if (page > 0 && page <= totalPages) {
            setFilters((prev) => ({ ...prev, page }));
        }
    };

    const viewUserDetails = async (userId) => {
        try {
            const response = await axios.get(`${BASE_URL}/admin/getUser/${userId}`, {
                headers: {
                    Authorization: `Bearer ${authCtx.token}`,
                    Accept: '*/*',
                },
            });
            setSelectedUser(response.data);
            setModalVisible(true);
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    const deleteUser = async (userId) => {
        Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete this user?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await axios.delete(`${BASE_URL}/admin/deleteUser/${userId}`, {
                                headers: {
                                    Authorization: `Bearer ${authCtx.token}`,
                                    Accept: '*/*',
                                },
                            });
                            alert(`User ID ${userId} deleted successfully!`);
                            fetchUsers(); // Refresh the user list
                        } catch (error) {
                            console.error('Error deleting user:', error);
                        }
                    },
                },
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderText}>
                    {item.firstName} {item.lastName}
                </Text>
            </View>
            <View style={styles.cardContent}>
                <View style={styles.row}>
                    <Text style={styles.label}>Email:</Text>
                    <Text style={styles.value}>{item.email}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Phone:</Text>
                    <Text style={styles.value}>{item.phone}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Role:</Text>
                    <Text style={styles.value}>{item.role}</Text>
                </View>
                <TouchableOpacity
                    style={styles.detailsButton}
                    onPress={() => viewUserDetails(item.id)}
                >
                    <Text style={styles.buttonText}>VIEW DETAILS</Text>
                </TouchableOpacity>
                {/* Conditionally render the delete button */}
                {userData.role === "SUPER_ADMIN" && (
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => deleteUser(item.id)}
                    >
                        <Text style={styles.buttonText}>DELETE</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    const renderPagination = () => {
        const pages = Array.from({ length: totalPages }, (_, i) => i + 1); // Create array [1, 2, ..., totalPages]

        return (
            <View style={styles.paginationContainer}>
                <TouchableOpacity
                    style={[
                        styles.paginationButton,
                        filters.page === 1 && styles.paginationButtonDisabled,
                    ]}
                    onPress={() => changePage(filters.page - 1)}
                    disabled={filters.page === 1}
                >
                    <Text style={styles.paginationButtonText}>Previous</Text>
                </TouchableOpacity>
                {pages.map((page) => (
                    <TouchableOpacity
                        key={page}
                        style={[
                            styles.paginationButton,
                            filters.page === page && styles.paginationButtonActive,
                        ]}
                        onPress={() => changePage(page)}
                    >
                        <Text
                            style={[
                                styles.paginationButtonText,
                                filters.page === page && styles.paginationButtonTextActive,
                            ]}
                        >
                            {page}
                        </Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity
                    style={[
                        styles.paginationButton,
                        filters.page === totalPages && styles.paginationButtonDisabled,
                    ]}
                    onPress={() => changePage(filters.page + 1)}
                    disabled={filters.page === totalPages}
                >
                    <Text style={styles.paginationButtonText}>Next</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Filters */}
            <View style={styles.filterContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Filter by email"
                    value={filters.email}
                    onChangeText={handleEmailChange}
                />
                <View style={styles.rolesContainer}>
                    {['ADMIN', 'CUSTOMER', 'HALL_OWNER', 'SUPER_ADMIN'].map((role) => (
                        <TouchableOpacity
                            key={role}
                            style={[
                                styles.roleButton,
                                filters.role === role && styles.roleButtonSelected,
                            ]}
                            onPress={() => handleRoleChange(role)}
                        >
                            <Text
                                style={[
                                    styles.roleButtonText,
                                    filters.role === role && styles.roleButtonTextSelected,
                                ]}
                            >
                                {role}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                    <Text style={styles.clearButtonText}>Clear Filters</Text>
                </TouchableOpacity>
            </View>
            {loading ? (
                <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />
            ) : (
                <>
                    <FlatList
                        data={data}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                    />
                    {renderPagination()}
                </>
            )}
            {/* Modal for User Details */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {selectedUser ? (
                            <ScrollView>
                                <Image
                                    source={{ uri: selectedUser.image }}
                                    style={styles.image}
                                />
                                <Text style={styles.label}>Name:</Text>
                                <Text style={styles.value}>
                                    {selectedUser.firstName} {selectedUser.lastName}
                                </Text>
                                <Text style={styles.label}>Email:</Text>
                                <Text style={styles.value}>{selectedUser.email}</Text>
                                <Text style={styles.label}>Phone:</Text>
                                <Text style={styles.value}>{selectedUser.phone}</Text>
                                <Text style={styles.label}>Role:</Text>
                                <Text style={styles.value}>{selectedUser.role}</Text>
                                <Text style={styles.label}>Address:</Text>
                                <Text style={styles.value}>{selectedUser.address}</Text>
                                <Text style={styles.label}>Date of Birth:</Text>
                                <Text style={styles.value}>
                                    {new Date(selectedUser.dateOfBirth).toLocaleDateString()}
                                </Text>
                                <Text style={styles.label}>Created Date:</Text>
                                <Text style={styles.value}>
                                    {new Date(selectedUser.createdDate).toLocaleDateString()}
                                </Text>
                                <Button
                                    title="Close"
                                    onPress={() => setModalVisible(false)}
                                    color="#007BFF"
                                />
                            </ScrollView>
                        ) : (
                            <ActivityIndicator size="large" color="#007BFF" />
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};


const styles = StyleSheet.create({
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    paginationButton: {
        padding: 10,
        marginHorizontal: 5,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#007BFF',
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
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f8f8f8',
    },
    filterContainer: {
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    rolesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    roleButton: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#007BFF',
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    roleButtonSelected: {
        backgroundColor: '#007BFF',
    },
    roleButtonText: {
        color: '#007BFF',
        fontWeight: 'bold',
    },
    roleButtonTextSelected: {
        color: '#fff',
    },
    clearButton: {
        marginTop: 10,
        alignItems: 'center',
        backgroundColor: '#FF4D4D',
        paddingVertical: 10,
        borderRadius: 5,
    },
    clearButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 15,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
        elevation: 3,
    },
    cardHeader: {
        backgroundColor: '#d4a373',
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    cardHeaderText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cardContent: {
        padding: 15,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#555',
        flex: 1,
        textAlign: 'left',
    },
    value: {
        fontSize: 14,
        color: '#333',
        flex: 2,
        textAlign: 'right',
    },
    detailsButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 12,
    },
    loader: {
        marginTop: 20,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 20,
    },
    deleteButton: {
        backgroundColor: '#FF4D4D',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
        marginTop: 10,
    },
});

export default AdminControlScreen;
