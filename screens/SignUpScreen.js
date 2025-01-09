import {Alert, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";

import {useContext, useEffect, useState} from "react"
import Icon from 'react-native-vector-icons/Ionicons';
import DropDownPicker from 'react-native-dropdown-picker';
import {SafeAreaView} from "react-native-safe-area-context";
import {AuthContext} from "../store/auth-context";
import {authenticate, createUser} from "../utill/auth";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import {LinearGradient} from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";


function SignUpScreen({navigation}) {
    const [enteredFirstName, setEnteredFirstName] = useState("");
    const [enteredLastName, setEnteredLastName] = useState("");
    const [enteredEmail, setEnteredEmail] = useState("");
    const [enteredPhoneNum, setEnteredPhoneNum] = useState("");
    const [enteredPass, setEnteredPass] = useState("");
    const [enteredConfPass, setEnteredConfPass] = useState("");
    const [enteredCompanyName, setEnteredCompanyName] = useState("");

    const [dateOfBirth, setDateOfBirth] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);


    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState([
        {label: 'Customer', value: 'buyer'},
        {label: 'Hall owner', value: 'owner'},
    ]);

    function onDateChange(event, selectedDate) {
        const currentDate = selectedDate || dateOfBirth;
        setShowDatePicker(false);
        setDateOfBirth(currentDate);
    }


    function checkIfValid() {

        const isEmailEmpty = !enteredEmail.trim();
        const isConfEmailEmpty = !enteredPhoneNum.trim();
        const isPassEmpty = !enteredPass.trim();
        const isConfPassEmpty = !enteredConfPass.trim();
        const isValueEmpty = value === null;

        if (isEmailEmpty || isConfEmailEmpty || isPassEmpty || isConfPassEmpty || isValueEmpty) {
            Alert.alert("Please fill in all fields");
            return false;
        }


        const passwordIsValid = enteredPass === enteredConfPass;

        if (!passwordIsValid) {
            Alert.alert("Please check the Email or Password");
            return false;
        }
        return true;
    }

    const [isAuthenticating, setIsAuthenticating] = useState(false);

    const authCtx = useContext(AuthContext);

    async function SignUpHandler() {
        setIsAuthenticating(true);
        try {
           await authenticate(enteredEmail, enteredPhoneNum, enteredPass, enteredFirstName, enteredLastName, enteredCompanyName, dateOfBirth, value);
            Alert.alert('Success', 'User registered successfully!');
            navigation.navigate("Login")
        } catch (error) {
            Alert.alert("Sign up Failed: Please check your information correctly");
            console.log(error);
        }
        setIsAuthenticating(false);
    }

    if (isAuthenticating) {
        return <LoadingOverlay message={"Creating a user..."}/>;
    }

    function handleSignUpPress() {
        const isValid = checkIfValid();
        if (isValid) {
            SignUpHandler({email: enteredEmail, password: enteredPass});
        }
    }

    return (

        <LinearGradient style={styles.outer}
                        colors={['#a97c50', '#d9a773', '#e6cba1', '#a97c50', '#8c5e30', '#6e3d1b']}
                        start={{x: 0, y: 1}}
                        end={{x: 1, y: 0}}
        >
            <SafeAreaView style={styles.outer}>
                <Text style={styles.biggerTitle}>Sign up</Text>
                <View style={styles.container}>
                    <Text style={styles.title}>4EVER <Text style={styles.Boo}>BOO</Text>KING
                    </Text>
                    <View style={styles.name}>
                        <View style={styles.Wrap}>
                            <Icon style={styles.icon} name={"person"} size={20} color={"#aaa"}/>
                            <TextInput placeholder={"First Name"} style={styles.fName}
                                       value={enteredFirstName}
                                       onChangeText={(text) => setEnteredFirstName(text)}/>
                        </View>
                        <View style={styles.Wrap}>
                            <Icon style={styles.icon} name={"person"} size={20} color={"#aaa"}/>
                            <TextInput placeholder={"Last Name"} style={styles.LName}
                                       value={enteredLastName}
                                       onChangeText={(text) => setEnteredLastName(text)}/>
                        </View>
                    </View>
                    <View style={styles.email}>
                        <View style={styles.Wrap}>
                            <Icon style={styles.icon} name={"mail"} size={20} color={"#aaa"}/>
                            <TextInput keyboardType={"email-address"} style={styles.TInput} placeholder={"Email"}
                                       value={enteredEmail}
                                       onChangeText={(text) => setEnteredEmail(text)}/>
                        </View>
                        <View style={styles.data}>
                            <View style={styles.WrapCal}>
                                <Icon style={styles.icon} name={"call"} size={20} color={"#aaa"}/>
                                <TextInput keyboardType={"number-pad"} style={{marginHorizontal: 10}}
                                           placeholder={"Phone Number"} maxLength={10}
                                           value={enteredPhoneNum}
                                           onChangeText={(text) => setEnteredPhoneNum(text)}/>
                            </View>
                            <View style={styles.Wrap}>
                                <Icon style={styles.icon} name={"calendar"} size={20} color={"#aaa"}/>
                                <TouchableOpacity onPress={() => setShowDatePicker(true)}
                                                  style={{marginHorizontal: 10}}>
                                    <Text>{dateOfBirth ? dateOfBirth.toDateString() : "Select Date of Birth"}</Text>
                                </TouchableOpacity>
                            </View>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={dateOfBirth}
                                    mode="date"
                                    display="default"
                                    onChange={onDateChange}
                                    maximumDate={new Date()}
                                />
                            )}
                        </View>

                    </View>
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
                        />
                    </View>
                    <View style={styles.password}>
                        <View style={styles.Wrap}>
                            <Icon style={styles.icon} name={"lock-closed-outline"} size={20} color={"#aaa"}/>
                            <TextInput style={styles.TInput} placeholder={"Password"}
                                       value={enteredPass} secureTextEntry={true}
                                       onChangeText={(text) => setEnteredPass(text)}/>
                        </View>
                        <View style={styles.Wrap}>
                            <Icon style={styles.icon} name={"lock-open-outline"} size={20} color={"#aaa"}/>
                            <TextInput style={styles.TInput} placeholder={"Confirm Password"}
                                       value={enteredConfPass} secureTextEntry={true}
                                       onChangeText={(text) => setEnteredConfPass(text)}/>
                        </View>
                        {value === 'owner' && (
                            <View style={styles.HInfo}>
                                <View style={styles.Wrap}>
                                    <Icon name={"person-outline"} size={20} style={styles.icon} color={"#aaa"}/>
                                    <TextInput placeholder={"Company Name"}
                                               value={enteredCompanyName}
                                               onChangeText={(text) => setEnteredCompanyName(text)}/>

                                </View>
                            </View>

                        )}
                        <View>
                            <TouchableOpacity onPress={handleSignUpPress} style={styles.button}><Text
                                style={styles.text}>Sign
                                up</Text></TouchableOpacity>
                        </View>
                    </View>
                    <Text>Have an account already? <TouchableOpacity
                        onPress={() => navigation.replace("Login")}><Text style={styles.buttonText}>Log
                        in</Text></TouchableOpacity></Text>
                </View>
            </SafeAreaView>
        </LinearGradient>

    )
}

export default SignUpScreen;

const styles = StyleSheet.create({
    container: {
        marginTop: 64,
        marginHorizontal: 32,
        padding: 16,
        borderRadius: 8,
        backgroundColor: 'white',
        elevation: 2,
        shadowColor: "6e3d1b",
        shadowOffset: {width: 1, height: 1},
        shadowOpacity: 0.35,
        shadowRadius: 4,
        marginBottom: '30%'
    },
    outer: {
        flexGrow: 1,
        justifyContent: 'center'
    },
    TInput: {
        flex: 1
    },
    email: {},

    Wrap: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#aaa',
    },
    title: {
        textAlign: 'center',
        marginBottom: 15,
        fontSize: 20,
        color: '#d9a773'
    },
    Boo: {
        fontSize: 20,
        color: '#d9a773',
        textDecorationLine: 'underline',
    },

    icon: {
        marginRight: 7,
    },

    dropdownText: {
        fontSize: 14,
        color: 'black',
    },
    dropdownTextHighlight: {
        color: 'blue',
    },
    menu: {
        marginBottom: 15,
        zIndex: 1000,
        marginTop: 10,
    },

    dropdownContainer: {
        borderColor: 'gray',
        borderWidth: 1,
        height: 100,
    },
    HInfo: {
        borderTopWidth: 1,
        marginTop: 15,
        paddingTop: 15
    },
    buttonText: {
        marginTop: 22,
        color: '#795734',

    },
    pressed: {
        opacity: 0.7,
    },

    button: {
        backgroundColor: '#d9a773',
        borderRadius: 8,
        marginTop: 15,
        marginBottom: 15,

    },
    text: {
        textAlign: 'center',
        fontSize: 18,
        padding: 6,
        color: "#795734"
    },
    biggerTitle: {
        color: 'white',
        fontSize: 50,
        textAlign: 'center',
        marginTop: 40,
        fontFamily: "Montserrat-Bold"
    },

    name: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    data: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    fName: {
        marginHorizontal: 20,
    },
    LName: {
        marginHorizontal: 20,
    },
    WrapCal: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#aaa',
        marginRight: 12,
    }


})