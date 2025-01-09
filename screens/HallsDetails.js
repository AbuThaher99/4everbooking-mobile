import React, {useContext, useEffect, useState} from 'react';
import {Image, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Icon} from 'react-native-elements';
import {AuthContext} from "../store/auth-context";
import {useDispatch} from "react-redux";
import {setHallData} from "../store/redux/book";
import {Checkbox, TextInput} from "react-native-paper";
import {AirbnbRating} from 'react-native-ratings';
import DropDownPicker from "react-native-dropdown-picker";


export function HallsDetails({route, navigation}) {
    const {id, name, imageUrl, location, phoneNumber, services, description, categories} = route.params;
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
        setSelected('About');
        setText(description)
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
        setValue(value);

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
                        <AirbnbRating
                            count={5}
                            showRating={false}
                            reviews={["Terrible", "Bad", "OK", "Good", "Excellent"]}
                            defaultRating={3}
                            size={30}
                            onFinishRating={(rating) => onRateChange(rating)}
                        />

                        <TextInput
                            label="Your comment"
                            value={reviewText}
                            onChangeText={commentHandler}
                            style={styles.textArea}
                            mode="outlined"
                            multiline
                        />
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

                <Text style={styles.About}>{text}</Text>
                <View style={styles.innerContainer}>

                </View>
            </ScrollView>
            {!isBooked &&
                <TouchableOpacity style={styles.floatingButton} onPress={() => {
                    navigation.navigate("time", {id: id, selectedCategory: selectedLabel, selectedServices: selectedServiceList})
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
        fontFamily: 'impact'
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
});

