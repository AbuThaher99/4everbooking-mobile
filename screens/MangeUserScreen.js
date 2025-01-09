import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const AdminControlScreen = () => {

    //dummy data for testing
    const data = [
        { id: '1', email: 'mohammad@gmail.com', phone: '0569782941', role: 'ADMIN' },
        { id: '2', email: 'mohammadabuthaher06@gmail.com', phone: '015903908908', role: 'HALL_OWNER' },
        { id: '3', email: 'mohammadabuthaher24@gmail.com', phone: '0569978971', role: 'CUSTOMER' },
        { id: '4', email: 'm@gmail.com', phone: '0599782941', role: 'CUSTOMER' },
        { id: '5', email: 'mohammadalsalahi4@gmail.com', phone: '0599782941', role: 'CUSTOMER' },
        { id: '6', email: 'moha@gmail.com', phone: '0599782941', role: 'CUSTOMER' },
    ];

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            {/* Header */}
            <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderText}>ID: {item.id}</Text>
            </View>

            {/* Content */}
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
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.detailsButton}>
                        <Text style={styles.buttonText}>VIEW DETAILS</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton}>
                        <Text style={styles.buttonText}>DELETE</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f8f8f8',
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
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
    detailsButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    deleteButton: {
        backgroundColor: '#FF4D4D',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 12,
    },
});

export default AdminControlScreen;
