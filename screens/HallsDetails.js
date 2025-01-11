import React, {useContext, useEffect, useState} from 'react';
import {Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Icon} from 'react-native-elements';
import {AuthContext} from "../store/auth-context";
import {useDispatch} from "react-redux";
import {setHallData} from "../store/redux/book";
import {Checkbox, TextInput} from "react-native-paper";
import {AirbnbRating} from 'react-native-ratings';
import DropDownPicker from "react-native-dropdown-picker";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import {FontAwesome} from "@expo/vector-icons";

export function HallsDetails({route, navigation}) {
    const {id, name, imageUrl, location, phoneNumber, services, description, categories  ,longitude, latitude,HallRatings} = route.params;
    const [selected, setSelected] = useState('About');
    const [text, setText] = useState(description);
    const [reviewText, setReviewText] = useState('');
    const authCtx = useContext(AuthContext);
    const isBooked = authCtx.isBooked;
    const dispatch = useDispatch();
    const [rating, setRating] = useState(0);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState([]);
    const [selectedLabel, setSelectedLabel] = useState(null);
    const [checkedItems, setCheckedItems] = useState({});
    const [serviceList, setServiceList] = useState([]);
    const [selectedServiceList, setSelectedServiceList] = useState({});
    const [selectedPrice, setSelectedPrice] = useState({});
    const [mapKey, setMapKey] = useState(1); // Add state to force re-render
const [markerPosition, setMarkerPosition] = useState({
    latitude: latitude,
    longitude: longitude
  });

    useEffect(() => {
            if ( selected === "About") {
                setMapKey(prevKey => prevKey + 1); // Force re-render when "About" is selected
            }

    }, [selected]);
    useEffect(() => {
        dispatch(setHallData(route.params));

        const transformedItems = Object.entries(categories).map(([key, value]) => ({
            label: key,
            value: value
        }));

        setItems(transformedItems);

        const transformedServices = Object.entries(services).map(([key, value]) => ({
            name: key,
            price: value,
            checked: false
        }));
        setServiceList(transformedServices);
    }, [dispatch, id, name, location, phoneNumber, services, description, categories]);


    function AboutHandler() {
        setSelected("About");
        setText(description);
    }

    const handleCheckboxToggle = (serviceName,servicePrice) => {
        setCheckedItems(prev => ({
            ...prev,
            [serviceName]: !prev[serviceName]
        }));

        setSelectedServiceList(prev => {
            if (prev[serviceName]) {
                // Remove the service if it is already in the list
                const updatedList = {...prev};
                delete updatedList[serviceName];
                return updatedList;
            } else {
                // Add the service to the list
                return {
                    ...prev,
                    [serviceName]: servicePrice
                };
            }
        });

    };
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <FontAwesome
                    key={i}
                    name="star"
                    size={16}
                    color={i <= rating ? "#cba36b" : "#ccc"}
                    style={styles.star}
                />
            );
        }
        return stars;
    };

    function reviewHandler() {
        setSelected("Reviews");
        setText(null);
    }

    function servicesHandler() {
        setSelected("Services");
        setText(null);
    }

    function commentHandler(text) {
        setReviewText(text);
    }

    function onRateChange(number) {
        setRating(number);
    }

    function handleValueChange(value) {
        const selectedItem = items.find(item => item.value === value);
        setSelectedLabel(selectedItem ? selectedItem.label : null);
        console.log(selectedItem)
        setValue(value);
        console.log(value)

    }


    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.mealItem}>
                    <View style={styles.imageContainer}>
                        <Image source={{uri: imageUrl}} style={styles.image}/>
                        <View style={styles.overlay}/>
                        <View style={styles.textContainer}>
                            <View style={styles.bulletPoint}/>
                            <Text style={styles.imageText}>{name}</Text>
                        </View>
                    </View>
                    <View>

                        <View style={styles.location}>
                            <Icon
                                name="map-marker"
                                type="material-community"
                                size={25}
                                color="#d9a773"
                            />
                            <Text style={styles.description}>{location}</Text>
                        </View>
                        <View style={styles.location}>
                            <Icon name={"phone-in-talk"}
                                  type="material-community"
                                  size={25}
                                  color="#d9a773"
                            />
                            <Text style={styles.description}>{phoneNumber}</Text>
                        </View>
                        <View style={styles.info}>
                            <Pressable onPress={AboutHandler}>
                                <View style={[styles.underlineContainer, selected === 'About' && styles.selected]}>
                                    <Text style={[styles.text, selected === "About" && styles.underline]}>
                                        About
                                    </Text>
                                </View>
                            </Pressable>
                            <Pressable onPress={servicesHandler}>
                                <View style={[styles.underlineContainer, selected === 'Services' && styles.selected]}>
                                    <Text style={[styles.text, selected === "Services" && styles.underline]}>
                                        Services
                                    </Text>
                                </View>
                            </Pressable>
                            <Pressable onPress={reviewHandler}>
                                <View style={[styles.underlineContainer, selected === 'Reviews' && styles.selected]}>
                                    <Text style={[styles.text, selected === "Reviews" && styles.underline]}>
                                        Reviews
                                    </Text>
                                </View>
                            </Pressable>
                        </View>
                    </View>
                </View>
                {selected === "Reviews" && (
                    <>
                        {HallRatings.map((rating) => (
                            <View key={rating.id} style={styles.ratingContainer}>
                                <View style={styles.starsContainer}>
                                    {renderStars(rating.rating)}
                                </View>
                                <Text style={styles.comment}>{rating.comment}</Text>
                            </View>
                        ))}
                    </>
                )}

                {selected === "Services" && (
                    <View style={styles.menu}>
                        <DropDownPicker
                            open={open}
                            value={value}
                            items={items}
                            setOpen={setOpen}
                            setValue={setValue}
                            setItems={setItems}
                            placeholder="Select a category"
                            dropDownContainerStyle={styles.dropdownContainer}
                            style={styles.dropDown}
                            listMode="SCROLLVIEW"
                            onChangeValue={handleValueChange}
                        />

                        <View style={styles.container}>
                            <Text style={styles.title}>Select Services</Text>
                            {serviceList.map((service, index) => (
                                <View key={index} style={styles.checkboxContainer}>
                                    <View style={styles.checkboxWrapper}>
                                        <Checkbox
                                            status={checkedItems[service.name] ? 'checked' : 'unchecked'}
                                            onPress={() => handleCheckboxToggle(service.name,service.price)}
                                        />
                                    </View>
                                    <Text style={styles.label}>{service.name} - ${service.price}</Text>
                                </View>

                            ))}
                        </View>
                    </View>
                )}

                {selected === "About" && (
                    <View>
                        <Text style={styles.About}>{text}</Text>
                        <View style={styles.mapContainer}>
                           <MapView
                                   style={styles.map}
                                   initialRegion={{
                                     latitude: latitude,
                                     longitude: longitude,
                                     latitudeDelta: 0.1,
                                     longitudeDelta: 0.1,
                                   }}

                                 >
                                   <Marker coordinate={markerPosition} />
                                 </MapView>
                        </View>
                    </View>
                )}
                <View style={styles.innerContainer}>

                </View>
            </ScrollView>
            {!isBooked &&
                <TouchableOpacity style={styles.floatingButton} onPress={() => {
                    if (!selectedLabel) {
                        alert("Please choose a category.");
                        return;
                    }
                    navigation.navigate("time", { id: id, selectedCategory: selectedLabel, selectedServices: selectedServiceList, selectedPrice: value });
                }}>
                    <Text style={styles.buttonText}>Book Now</Text>
                </TouchableOpacity>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position:
            'relative',
    }
    ,
    scrollViewContent: {
        paddingBottom: 100, // Ensure there is enough space at the bottom
    }
    ,
    mealItem: {
        margin: 16,
        borderRadius: 8,
        overflow: Platform.OS === "android" ? "hidden" : "visible",
        backgroundColor: "#EAEAEA",
        elevation: 4,
        shadowColor: "black",
        shadowOpacity: 0.25,
        shadowOffset: {width: 0, height: 2},
        shadowRadius: 8,
    },

    imageContainer: {
        position: 'relative',
        borderRadius: 8,
        overflow: 'hidden',
    },
    image: {
        width: "100%",
        height: 200,
    },

    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },

    textContainer: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        flexDirection: 'row',
        alignItems: 'center',
        // backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },

    bulletPoint: {
        width: 12,
        height: 12,
        borderRadius: 8,
        backgroundColor: '#d9a773',
        marginRight: 8,
    },

    imageText: {
        color: 'white',
        fontSize: 33,
        fontWeight: 'bold',
        padding: 5,
        borderRadius: 10,
    },

    title: {
        fontWeight: "bold",
        fontSize: 18,
        textAlign: "center",
        margin: 8,
    },

    buttonPressed: {
        opacity: 0.5,
    },

    dropdownContainer: {
        borderColor: 'gray',
        borderWidth: 1,
        height: 150,
        width: 300,  // Match the width to ensure consistency
        zIndex: 2000, // Higher zIndex to ensure dropdown is on top
        elevation: 5, // Adds shadow for Android

    },

    dropDown: {
        width: 300,  // Set a fixed width for the dropdown
    },

    menu: {
        marginBottom: 15,
        zIndex: 1000,
        marginTop: 10,
        marginVertical: 20,
        paddingHorizontal: 55
    },

    description: {
        marginVertical: 10,
        paddingLeft: 4,
        color: '#7a7979'
    },

    floatingButton: {
        position: 'absolute',
        bottom: Platform.OS === "android" ? "12%" : 20,
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

    info: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },

    location: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 5
    },

    underline: {
        color: "#795734",
    },

    underlineContainer: {
        borderBottomWidth: 0, // Reset border
    },

    text: {
        fontSize: 18,
        padding: 10,
        fontWeight: 'bold'
    },

    selected: {
        borderBottomWidth: 4,
        borderBottomColor: '#d9a773',
    },

    About: {
        marginHorizontal: 16,
        fontSize: 16,
    },
    mapContainer: {
        marginHorizontal: 16,
        marginTop: 10,
        borderRadius: 10,
        overflow: "hidden",
        height: 200, // Fixed height for the map container
    },
    map: {
        flex: 1,
        borderRadius: 10,
    },

    textArea: {
        marginBottom: 12,
        backgroundColor: "#ffffff",
        height: 100,
        marginHorizontal: 40
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
        padding: 8,
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d1d1d1',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3, // for Android shadow
        justifyContent: 'space-around',
    },
    checkboxWrapper: {
        borderWidth: 1,
        borderColor: '#d1d1d1',
        borderRadius: 5,
        overflow: 'hidden',
        right: 20
    },
    ratingContainer: {
        marginVertical: 10,
        paddingHorizontal: 40,
    },
    starsContainer: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    comment: {
        fontSize: 14,
        color: '#555',
    },
    star: {
        marginHorizontal: 2,
    },
});

