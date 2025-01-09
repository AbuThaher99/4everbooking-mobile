import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, toDateId } from "@marceloterreiro/flash-calendar";
import Icon from "react-native-vector-icons/Ionicons";
import { BASE_URL } from "../assets/constant/ip";

export function TimePickScreen({ navigation, route }) {
    const { id , selectedCategory , selectedServices,selectedPrice} = route.params;

    const today = toDateId(new Date());
    const [selectedDate, setSelectedDate] = useState(today);
    const [localizedDate, setLocalizedDate] = useState(new Date().toLocaleDateString()); // Localized date display
    const [reservedDates, setReservedDates] = useState([]);

    useEffect(() => {
        const fetchReservedDays = async () => {
            try {
                const currentYear = new Date().getFullYear(); // Get the current year dynamically
                const response = await fetch(
                    `${BASE_URL}/whitelist/reserved-days-years/${id}?year=${currentYear}`
                );
                const data = await response.json();

                const allReservedDates = data.reduce((acc, monthObj) => {
                    const month = Object.keys(monthObj)[0]; // Get the month as a string (e.g., "1", "2")
                    const days = Object.values(monthObj)[0]; // Get the array of days for this month
                    const formattedDates = days.map((day) =>
                        `${currentYear}-${month.padStart(2, "0")}-${String(day).padStart(2, "0")}`
                    );
                    return [...acc, ...formattedDates]; // Merge with the accumulator
                }, []);

                setReservedDates(allReservedDates); // Store the formatted reserved dates
            } catch (error) {
                console.error('Error fetching reserved days:', error);
            }
        };

        fetchReservedDays();
    }, [id]);

    const handleDateSelect = (dateId) => {
        setSelectedDate(dateId);

        // Convert the dateId to a local format for display
        const [year, month, day] = dateId.split('-').map(Number); // Assuming dateId is "YYYY-MM-DD"
        const localDate = new Date(year, month - 1, day).toLocaleDateString(); // Convert to local format
        setLocalizedDate(localDate);
    };

    const handleNavigateToPayment = () => {
        // Convert selectedDate to ISO format (e.g., "2025-06-06T18:32:23.122Z")
        const [year, month, day] = selectedDate.split('-').map(Number);
        const isoDate = new Date(Date.UTC(year, month - 1, day)).toISOString();

        navigation.navigate('pay', {
            id: id,
            selectedDate: isoDate, // Send the ISO date format
            selectedCategory: selectedCategory,
            selectedServices: selectedServices,
            selectedPrice:selectedPrice
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Selected date: {localizedDate}</Text>
            <Calendar.List
                calendarActiveDateRanges={[
                    {
                        startId: selectedDate,
                        endId: selectedDate,
                    },
                ]}
                calendarInitialMonthId={today}
                onCalendarDayPress={handleDateSelect}
                calendarDisabledDateIds={reservedDates}

            />
            <TouchableOpacity
                style={styles.floatingButton}
                onPress={handleNavigateToPayment}
            >
                <Icon name="arrow-forward-circle" size={30} color="white" />
                <Text style={styles.buttonText}>Proceed</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: 'white',
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    floatingButton: {
        position: 'absolute',
        bottom: Platform.OS === "android" ? "12%" : 20,
        right: "1%",
        backgroundColor: '#d9a773',
        borderRadius: 50,
        padding: 15,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        marginLeft: 10,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default TimePickScreen;
