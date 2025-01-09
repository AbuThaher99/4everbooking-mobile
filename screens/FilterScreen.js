import React, {useState} from 'react';
import {Button, Dimensions, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Chip} from 'react-native-paper';
import {MaterialCommunityIcons, MaterialIcons} from '@expo/vector-icons';
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import {SafeAreaView} from "react-native-safe-area-context";

export function FilterScreen({navigation,route}) {
    const [selectedChips, setSelectedChips] = useState({
        section1: null,
        section2: null,
        priceRange: [500, 3000],
        capacityRange: [10, 200],
    });
    const sliderWidth = Dimensions.get('window').width - 40;
    const thumbRadius = 15;

    const [priceRange, setPriceRange] = useState([500, 3000]);
    const [capacityRange, setCapacityRange] = useState([10, 200]);
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
        console.log(selectedChips)
        setPriceRange(values)
    };

    const handleCapacityChange = (values) => {
        setSelectedChips((prevState) => ({
            ...prevState,
            capacityRange: values,
        }));
        console.log(selectedChips)
        setCapacityRange(values)
    };

    const locations = [
        'Ramallah', 'Jericho', 'Nablus', 'Hebron', 'BetLehem', 'Jenin',
        'Tulkarem', 'Qalqilya', 'Salfit', 'Tubas', 'Azzun', 'BeitJala',
        'BeitSahour', 'Dura', 'Halhul', 'Yatta',
    ];

    const applyFilters = () => {
        if (onApply) {
            onApply(selectedChips); // Pass the data back to MainScreen
        }
        navigation.goBack(); // Navigate back to MainScreen
    };

    const LocationChip = ({location, section}) => (
        <Chip
            mode={selectedChips[section] === location ? 'flat' : 'outlined'}
            selected={selectedChips[section] === location}
            onPress={() => handleChipPress(section, location)}
            icon={({size}) => <MaterialIcons name="business" size={size} color="#c58645"/>}
            style={[
                styles.chipStyle,
                selectedChips[section] === location && styles.chipSelected,
            ]}
            textStyle={[
                selectedChips[section] === location ? styles.chipTextSelected : styles.chipTextUnselected,
            ]}
        >
            {location}
        </Chip>
    );


    const getThumbPosition = (value) => {
        const ratio = value / 100;
        return ratio * (sliderWidth - thumbRadius * 2) + thumbRadius;
    };

    return (
            <ScrollView style={styles.container}>
                <Text style={styles.sectionTitle}>Section 1</Text>
                <View style={styles.chipGroup}>
                    {locations.map((location) => (
                        <LocationChip key={location} location={location} section="section1"/>
                    ))}
                </View>

                <Text style={styles.sectionTitle}>Section 2</Text>
                <View style={styles.chipGroup}>
                    {[
                        {key: 'Party', icon: 'celebration', lib: MaterialIcons},
                        {key: 'Restaurant', icon: 'restaurant', lib: MaterialIcons},
                        {key: 'Funeral', icon: 'grave-stone', lib: MaterialCommunityIcons},
                        {key: 'Meetings', icon: 'restaurant', lib: MaterialIcons},
                        {key: 'Birthday', icon: 'restaurant', lib: MaterialIcons},
                        {key: 'Weddings', icon: 'restaurant', lib: MaterialIcons}
                    ].map(({key, icon, lib: IconLibrary}) => (
                        <Chip
                            key={key}
                            mode={selectedChips.section2 === key ? 'flat' : 'outlined'}
                            selected={selectedChips.section2 === key}
                            onPress={() => handleChipPress('section2', key)}
                            icon={({size}) => (
                                <IconLibrary name={icon} size={size} color={"#c58645"}/>
                            )}
                            style={[
                                styles.chipStyle,
                                selectedChips.section2 === key && styles.chipSelected,
                            ]}
                            textStyle={[
                                selectedChips.section2 === key ? styles.chipTextSelected : styles.chipTextUnselected
                            ]}
                        >
                            {key}
                        </Chip>
                    ))}
                </View>


                <Text style={styles.sectionTitle}>Price Range</Text>
                <View style={styles.sliderContainer}>
                    <Text style={styles.priceText}>${priceRange[0]} - ${priceRange[1]}</Text>
                    <MultiSlider
                        values={priceRange}
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
                    <Text style={styles.priceText}>{capacityRange[0]} - {capacityRange[1]}</Text>
                    <MultiSlider
                        values={capacityRange}
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

                <TouchableOpacity style={styles.floatingButton} title="Apply Filters" onPress={applyFilters}>
                    <Text style={styles.buttonText}>Apply Filter</Text>
                </TouchableOpacity>
            </ScrollView>


    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        backgroundColor: '#f8f8f8',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    chipGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        marginBottom: 20,
    },
    chipStyle: {
        margin: 5,
    },
    chipSelected: {
        backgroundColor: '#d9a773',
        borderColor: 'black',
    },
    chipTextSelected: {
        color: '#FFFFFF',
    },
    chipTextUnselected: {
        color: '#e6cba1',
    },

    sliderContainer: {
        marginTop: 20,
        paddingHorizontal: 10,
    },
    priceText: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    selectedTrack: {
        backgroundColor: '#d9a773',
    },
    unselectedTrack: {
        backgroundColor: '#A9A9A9',
    },
    markerStyle: {
        height: 30,
        width: 30,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#d9a773',
    },
    trackStyle: {
        height: 4,
    },

    floatingButton: {
        left: 0,
        right: 0,
        backgroundColor: '#d9a773',
        borderRadius: 20,
        marginHorizontal: 16,
        padding: 16,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
