import React, { useState, useEffect, useContext } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Linking,
    Modal,
    TextInput,
    Button,
} from 'react-native';
import axios from 'axios';
import { BASE_URL } from "../assets/constant/ip";
import { AuthContext } from "../store/auth-context";

export default function AdminHallApprovalScreen() {
    const [halls, setHalls] = useState([]); // Stores halls data
    const [loading, setLoading] = useState(false); // Loader state
    const [currentPage, setCurrentPage] = useState(1); // Current page
    const [totalPages, setTotalPages] = useState(0); // Total pages
    const [modalVisible, setModalVisible] = useState(false); // Modal visibility
    const [selectedHallId, setSelectedHallId] = useState(null); // Selected hall ID for rejection
    const [rejectionReason, setRejectionReason] = useState(''); // Reason for rejection
    const authCtx = useContext(AuthContext);

    // Fetch halls data
    const fetchHalls = async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/admin/getAllHallIsProcessed`, {
                headers: {
                    Authorization: `Bearer ${authCtx.token}`, // Use token from context
                    Accept: '*/*',
                    'Content-Type': 'application/json',
                },
                params: { page, size: 3 },
            });

            setHalls(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error(
                'Error fetching halls:',
                error.response?.data || error.message // Detailed error response
            );
        } finally {
            setLoading(false);
        }
    };

    // Handle "Reject" action
    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            alert("Please provide a rejection reason.");
            return;
        }
        try {
            await axios.delete(`${BASE_URL}/admin/rejectHall/${selectedHallId}`, {
                headers: {
                    Authorization: `Bearer ${authCtx.token}`,
                    Accept: '*/*',
                    'Content-Type': 'application/json',
                },
                data: rejectionReason, // Add rejection reason in the body
            });
            alert(`Hall ID ${selectedHallId} rejected successfully!`);
            setModalVisible(false); // Close the modal
            setRejectionReason(''); // Clear the reason
            fetchHalls(currentPage); // Refresh the list
        } catch (error) {
            console.error('Error rejecting hall:', error.response?.data || error.message);
        }
    };

    // Handle "View Proof" action
    const handleViewProof = (proofUrl) => {
        Linking.openURL(proofUrl).catch((err) =>
            console.error('Failed to open proof URL:', err)
        );
    };

    // Handle "Approve" action
    const handleApprove = async (id) => {
        console.log(id)
        try {
            await axios.put(
                `${BASE_URL}/admin/processHall/${id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${authCtx.token}`,
                        Accept: '*/*',
                        'Content-Type': 'application/json',
                    },
                }
            );
            alert(`Hall ID ${id} approved!`);
            fetchHalls(currentPage); // Refresh the list
        } catch (error) {
            console.error('Error approving hall:', error.response?.data || error.message);
        }
    };

    // Fetch halls on initial render or page change
    useEffect(() => {
        fetchHalls(currentPage);
    }, [currentPage]);

    // Pagination Component
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
                    <Text style={styles.paginationText}>Previous</Text>
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
                                styles.paginationText,
                                currentPage === page && styles.paginationTextActive,
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
                    onPress={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                >
                    <Text style={styles.paginationText}>Next</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Hall Approval</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#007BFF" />
            ) : (
                <ScrollView>
                    {halls.map((hall) => (
                        <View key={hall.id} style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardHeaderText}>Hall Information</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Name:</Text>
                                <Text style={styles.value}>{hall.name}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Location:</Text>
                                <Text style={styles.value}>{hall.location}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Capacity:</Text>
                                <Text style={styles.value}>{hall.capacity}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Description:</Text>
                                <Text style={styles.value}>{hall.description}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Phone:</Text>
                                <Text style={styles.value}>{hall.phone}</Text>
                            </View>
                            <View style={styles.actions}>
                                <TouchableOpacity
                                    style={styles.viewButton}
                                    onPress={() => handleViewProof(hall.proofFile)}
                                >
                                    <Text style={styles.buttonText}>View Proof</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.approveButton}
                                    onPress={() => handleApprove(hall.id)}
                                >
                                    <Text style={styles.buttonText}>Approve</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.rejectButton}
                                    onPress={() => {
                                        setSelectedHallId(hall.id);
                                        setModalVisible(true); // Show rejection modal
                                    }}
                                >
                                    <Text style={styles.buttonText}>Reject</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}
            {!loading && renderPagination()}

            {/* Rejection Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Reject Hall</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter rejection reason"
                            value={rejectionReason}
                            onChangeText={setRejectionReason}
                        />
                        <View style={styles.modalActions}>
                            <Button title="Cancel" onPress={() => setModalVisible(false)} />
                            <Button title="Submit" onPress={handleReject} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        padding: 16,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
    },
    card: {
        marginBottom: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        overflow: 'hidden',
    },
    cardHeader: {
        backgroundColor: '#d4a373',
        padding: 8,
    },
    cardHeaderText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    label: {
        fontWeight: 'bold',
        color: '#333',
        width: '40%',
    },
    value: {
        textAlign: 'right',
        color: '#555',
        width: '60%',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 8,
        backgroundColor: '#f9f9f9',
    },
    viewButton: {
        backgroundColor: '#d4a373',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    approveButton: {
        backgroundColor: '#4caf50',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
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
    paginationText: {
        color: '#007BFF',
        fontWeight: 'bold',
    },
    paginationTextActive: {
        color: '#fff',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
        backgroundColor: '#fff',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    rejectButton: {
        backgroundColor: '#FF4D4D',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
});
