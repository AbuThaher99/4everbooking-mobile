import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';

//dummy data for testing
const halls = [
    {
        id: 1,
        name: 'Mohammad',
        location: 'Ramallah',
        capacity: 250,
        description: 'nice venue',
        phone: '0569482508',
    },
    {
        id: 2,
        name: 'Pietro Berger',
        location: 'Nablus',
        capacity: 1500,
        description: 'asfasfasfasf',
        phone: '015903908908',
    },
    {
        id: 3,
        name: 'Mietro Berger',
        location: 'Nablus',
        capacity: 220,
        description: 'safasfasfas',
        phone: '015903908908',
    },
];

export default function AdminHallApprovalScreen() {
    const handleViewProof = (id) => {
        alert(`Viewing proof for hall ID: ${id}`);
    };

    const handleApprove = (id) => {
        alert(`Hall ID ${id} approved!`);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Hall Approval</Text>
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
                                onPress={() => handleViewProof(hall.id)}
                            >
                                <Text style={styles.buttonText}>View Proof</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.approveButton}
                                onPress={() => handleApprove(hall.id)}
                            >
                                <Text style={styles.buttonText}>Approve</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>
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
});
