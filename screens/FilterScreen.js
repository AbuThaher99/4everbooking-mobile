import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Button } from 'react-native-paper';
import { Chip } from 'react-native-paper';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

const LocationChip = React.memo(({ location, section, selectedChips, handleChipPress }) => (
    <View style={styles.chipContainer}>
        <Chip
            mode={selectedChips[section] === location ? 'flat' : 'outlined'}
            selected={selectedChips[section] === location}
            style={[
                styles.chipStyle,
                selectedChips[section] === location && styles.chipSelected,
            ]}
            textStyle={[
                selectedChips[section] === location
                    ? styles.chipTextSelected
                    : styles.chipTextUnselected,
            ]}
            onPress={() => handleChipPress(section, location)}
        >
            {location}
        </Chip>
    </View>
));

export function FilterScreen({ navigation, route }) {
    const [selectedChips, setSelectedChips] = useState({
        section1: null,
        section2: null,
        priceRange: [500, 5000],
        capacityRange: [10, 1000],
    });
    const { onApply } = route.params;

    const handleChipPress = (section, chip) => {
        setSelectedChips((prevState) => ({
            ...prevState,
            [section]: chip,
        }));
    };

    const handlePriceChange = (values) => {
        setSelectedChips((prevState) => ({
            ...prevState,
            priceRange: values,
        }));
    };

    const handleCapacityChange = (values) => {
        setSelectedChips((prevState) => ({
            ...prevState,
            capacityRange: values,
        }));
    };

    const locations = [
        'Ramallah',
        'Jericho',
        'Nablus',
        'Hebron',
        'Bethlehem',
        'Jenin',
        'Tulkarem',
        'Qalqilya',
        'Salfit',
        'Tubas',
        'Azzun',
        'Beit Jala',
        'Beit Sahour',
        'Dura',
        'Halhul',
        'Yatta',
    ];

    const applyFilters = () => {
        if (onApply) {
            onApply(selectedChips);
        }
        navigation.goBack();
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <Text style={styles.sectionTitle}>Section 1</Text>
                <View style={styles.chipGroup}>
                    {locations.map((location) => (
                        <LocationChip
                            key={location}
                            location={location}
                            section="section1"
                            selectedChips={selectedChips}
                            handleChipPress={handleChipPress}
                        />
                    ))}
                </View>

                <Text style={styles.sectionTitle}>Section 2</Text>
                <View style={styles.chipGroup}>
                    {['PARTIES', 'FUNERALS', 'MEETINGS', 'BIRTHDAYS', 'WEDDINGS'].map((key) => (
                        <LocationChip
                            key={key}
                            location={key}
                            section="section2"
                            selectedChips={selectedChips}
                            handleChipPress={handleChipPress}
                        />
                    ))}
                </View>

                <Text style={styles.sectionTitle}>Price Range</Text>
                <View style={styles.sliderContainer}>
                    <Text style={styles.priceText}>
                        ${selectedChips.priceRange[0]} - ${selectedChips.priceRange[1]}
                    </Text>
                    <MultiSlider
                        values={selectedChips.priceRange}
                        min={500}
                        max={5000}
                        step={100}
                        onValuesChange={handlePriceChange}
                        selectedStyle={styles.selectedTrack}
                        unselectedStyle={styles.unselectedTrack}
                        markerStyle={styles.markerStyle}
                        trackStyle={styles.trackStyle}
                    />
                </View>

                <Text style={styles.sectionTitle}>Capacity</Text>
                <View style={styles.sliderContainer}>
                    <Text style={styles.priceText}>
                        {selectedChips.capacityRange[0]} - {selectedChips.capacityRange[1]}
                    </Text>
                    <MultiSlider
                        values={selectedChips.capacityRange}
                        min={10}
                        max={1000}
                        step={10}
                        onValuesChange={handleCapacityChange}
                        selectedStyle={styles.selectedTrack}
                        unselectedStyle={styles.unselectedTrack}
                        markerStyle={styles.markerStyle}
                        trackStyle={styles.trackStyle}
                    />
                </View>

                <Button style={styles.applyButton} onPress={applyFilters} mode="contained">
                    Apply
                </Button>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        paddingBottom: 40, // Ensures Apply button is always scrollable
    },
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginVertical: 10,
    },
    chipGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
    },
    chipContainer: {
        margin: 5,
    },
    chipStyle: {
        borderColor: '#c58645',
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    chipSelected: {
        backgroundColor: '#c58645',
    },
    chipTextUnselected: {
        color: '#333',
    },
    chipTextSelected: {
        color: '#fff',
    },
    sliderContainer: {
        marginBottom: 20,
    },
    priceText: {
        fontSize: 16,
        marginBottom: 10,
        color: '#666',
    },
    selectedTrack: {
        backgroundColor: '#c58645',
    },
    unselectedTrack: {
        backgroundColor: '#ccc',
    },
    markerStyle: {
        backgroundColor: '#c58645',
        height: 20,
        width: 20,
        borderRadius: 10,
    },
    trackStyle: {
        height: 4,
    },
    applyButton: {
        marginBottom: 20,
        backgroundColor: '#c58645',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
});
