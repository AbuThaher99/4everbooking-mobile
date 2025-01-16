import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    Pressable,
} from 'react-native';
import { RadioButton } from 'react-native-paper';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

const LocationChip = React.memo(({ location, section, selectedChips, handleChipPress }) => (
    <Pressable
        style={[
            styles.chipStyle,
            selectedChips[section] === location && styles.chipSelected,
        ]}
        onPress={() => handleChipPress(section, location)}
    >
        <Text
            style={
                selectedChips[section] === location
                    ? styles.chipTextSelected
                    : styles.chipTextUnselected
            }
        >
            {location}
        </Text>
    </Pressable>
));

export function FilterScreen({ navigation, route }) {
    const [selectedChips, setSelectedChips] = useState({
        section1: null,
        section2: null,
        priceRange: [500, 5000],
        capacityRange: [10, 1000],
        selectedType: null,
    });
    const { onApply } = route.params || {};

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

    const handleSortChange = (value, label) => {
        setSelectedChips((prevState) => ({
            ...prevState,
            selectedType: { value, label },
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

    const eventTypes = ['PARTIES', 'FUNERALS', 'MEETINGS', 'BIRTHDAYS', 'WEDDINGS'];

    const applyFilters = () => {
        if (onApply) {
            onApply(selectedChips); // Pass the selected filters to the MainScreen
        }
        navigation.goBack(); // Close the modal after applying filters
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    contentContainerStyle={styles.contentContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Section 1: Locations */}
                    <Text style={styles.sectionTitle}>Locations</Text>
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

                    {/* Section 2: Event Types */}
                    <Text style={styles.sectionTitle}>Event Types</Text>
                    <View style={styles.chipGroup}>
                        {eventTypes.map((eventType) => (
                            <LocationChip
                                key={eventType}
                                location={eventType}
                                section="section2"
                                selectedChips={selectedChips}
                                handleChipPress={handleChipPress}
                            />
                        ))}
                    </View>

                    {/* Price Range Slider */}
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

                    {/* Capacity Slider */}
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

                    {/* Radio Buttons for Sorting */}
                    <Text style={styles.sectionTitle}>Choose Type</Text>
                    <RadioButton.Group
                        onValueChange={(value) => {
                            const labelMap = {
                                sortByPrice: 'Sort by Price',
                                sortByLocation: 'Sort by Location',
                                sortByRecommended: 'Sort by Recommended',
                            };
                            handleSortChange(value, labelMap[value]);
                        }}
                        value={selectedChips.selectedType?.value}
                    >
                        <View style={styles.radioButtonContainer}>
                            <RadioButton.Item
                                label="Sort by Price"
                                value="SortByPrice"
                            />
                            <RadioButton.Item
                                label="Sort by Location"
                                value="SortByLocation"
                            />
                            <RadioButton.Item
                                label="Sort by Recommended"
                                value="SortByRecommended"
                            />
                        </View>
                    </RadioButton.Group>

                    {/* Apply Button */}
                    <Pressable
                        style={styles.applyButton}
                        onPress={applyFilters}
                    >
                        <Text style={styles.applyButtonText}>Apply</Text>
                    </Pressable>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 40,
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
    chipStyle: {
        borderWidth: 1,
        borderColor: '#c58645',
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 15,
        margin: 5,
        borderRadius: 20,
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
    radioButtonContainer: {
        marginBottom: 20,
    },
    applyButton: {
        marginVertical: 20,
        backgroundColor: '#c58645',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    applyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});