import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Linking,
    Alert,
    ScrollView,
} from 'react-native';
import { AuthContext } from "../store/auth-context";
import { BASE_URL } from "../assets/constant/ip";
import { useSelector } from "react-redux";

const HallOwnerReportScreen = () => {
    const authCtx = useContext(AuthContext);
    const [hallOwnerData, setHallOwnerData] = useState(null); // Stores Hall Owner data
    const [reportUrl, setReportUrl] = useState(''); // Stores the generated report URL
    const [loading, setLoading] = useState(false); // Loading state
    const userData = useSelector((state) => state.bookedHalls.userData);

    // Fetch Hall Owner data to get Hall Owner ID
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
                throw new Error('Failed to fetch Hall Owner data.');
            }

            const data = await response.json();
            setHallOwnerData(data);
        } catch (error) {
            console.error('Error fetching Hall Owner data:', error);
            Alert.alert('Error', 'Failed to fetch Hall Owner data.');
        }
    };

    // Fetch Hall Owner's Report
    const fetchReport = async (hallOwnerId) => {
        setLoading(true);
        try {
            const response = await fetch(
                `${BASE_URL}/hallOwner/hallsReservationReport/${hallOwnerId}?headerColor=%233498db&evenRowColor=%23ecf0f1&oddRowColor=%23ffffff`,
                {
                    headers: {
                        accept: '*/*',
                        Authorization: `Bearer ${authCtx.token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch the report.');
            }

            const reportUrl = await response.text(); // API returns a plain URL
            setReportUrl(reportUrl);
        } catch (error) {
            console.error('Error fetching report:', error);
            Alert.alert('Error', 'Failed to fetch the report.');
        } finally {
            setLoading(false);
        }
    };

    // Handle Download Report
    const handleDownloadReport = () => {
        if (reportUrl) {
            Linking.openURL(reportUrl).catch((err) => {
                console.error('Error opening URL:', err);
                Alert.alert('Error', 'Failed to open the report URL.');
            });
        } else {
            Alert.alert('No Report', 'No report available to download.');
        }
    };

    // Fetch Hall Owner data on component mount
    useEffect(() => {
        fetchHallOwnerData();
    }, []);

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Hall Reservation Report</Text>

            {loading && (
                <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />
            )}

            {!loading && hallOwnerData && (
                <>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => fetchReport(hallOwnerData.id)}
                    >
                        <Text style={styles.buttonText}>Generate Report</Text>
                    </TouchableOpacity>

                    {reportUrl && (
                        <>
                            <Text style={styles.reportLabel}>Report Link:</Text>
                            <Text
                                style={styles.reportUrl}
                                onPress={() => handleDownloadReport()}
                            >
                                {reportUrl}
                            </Text>
                            <TouchableOpacity
                                style={[styles.button, styles.downloadButton]}
                                onPress={handleDownloadReport}
                            >
                                <Text style={styles.buttonText}>Download Report</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </>
            )}

            {!loading && !hallOwnerData && (
                <Text style={styles.errorMessage}>
                    Unable to fetch hall owner information. Please try again later.
                </Text>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f8f8f8',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    infoContainer: {
        marginBottom: 20,
        padding: 15,
        borderRadius: 8,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
        elevation: 3,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#555',
        marginBottom: 5,
    },
    value: {
        fontSize: 16,
        color: '#333',
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#3498db',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    downloadButton: {
        backgroundColor: '#2ecc71',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    reportLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#555',
        marginBottom: 10,
    },
    reportUrl: {
        fontSize: 14,
        color: '#2980b9',
        marginBottom: 20,
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
    errorMessage: {
        textAlign: 'center',
        color: '#e74c3c',
        fontSize: 16,
    },
    loader: {
        marginTop: 20,
    },
});

export default HallOwnerReportScreen;
