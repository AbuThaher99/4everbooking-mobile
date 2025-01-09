import {Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import {SafeAreaView} from "react-native-safe-area-context";
import {useContext, useState} from "react";
import {login} from "../utill/auth";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import {AuthContext} from "../store/auth-context";
import {LinearGradient} from 'expo-linear-gradient';


function LogInScreen({navigation}) {


    const [enteredEmail, setEnteredEmail] = useState("");
    const [enteredPass, setEnteredPass] = useState("");

    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const authCtx = useContext(AuthContext);

    function checkIfValid() {

        const isEmailEmpty = !enteredEmail.trim();
        const isPassEmpty = !enteredPass.trim();

        if (isEmailEmpty || isPassEmpty) {
            Alert.alert("Please fill in all fields");
            return false;
        }
        return true;
    }

    async function LogInHandler({email, password}) {
        setIsAuthenticating(true);
        try {
            const token = await login(email, password);
            authCtx.authenticate(token);
        } catch (error) {
            Alert.alert("Authenticating Failed, Please check your information");
        }
        setIsAuthenticating(false);
    }

    if (isAuthenticating) {
        return <LoadingOverlay message={"Logging in..."}/>;
    }

    function handleLogInPress() {
        const isValid = checkIfValid();
        if (isValid) {
            LogInHandler({email: enteredEmail, password: enteredPass});
        }
    }


    return (
        <LinearGradient style={styles.outer}
            // colors={['#3498db', '#4c1d8f', '#b321b4', '#721c8b', '#4c1d8f', '#3498db']}
                        colors={['#a97c50', '#d9a773', '#e6cba1', '#a97c50', '#8c5e30', '#6e3d1b']}
                        start={{x: 0, y: 1}}
                        end={{x: 1, y: 0}}
        >
            <SafeAreaView style={styles.outer}>

                <View style={styles.titleContainer}>
                    <Image source={require("../assets/Untitled370.png")} style={styles.titleIcon}/>

                </View>
                <View style={styles.container}>
                    <Text style={styles.title}>4EVER <Text style={styles.Boo}>BOO</Text>KING</Text>
                    <View style={styles.email}>
                        <View style={styles.Wrap}>
                            <Icon style={styles.icon} name={"mail"} size={20} color={"#aaa"}/>
                            <TextInput keyboardType={"email-address"} style={styles.TInput} placeholder={"Email"}
                                       value={enteredEmail}
                                       onChangeText={(text) => setEnteredEmail(text)}/>
                        </View>
                    </View>

                    <View style={styles.password}>
                        <View style={styles.Wrap}>
                            <Icon style={styles.icon} name={"lock-closed-outline"} size={20} color={"#aaa"}/>
                            <TextInput style={styles.TInput} placeholder={"Password"}
                                       onChangeText={(text) => setEnteredPass(text)}
                                       secureTextEntry={true}/>
                        </View>
                    </View>
                    <View>
                        <TouchableOpacity onPress={handleLogInPress} style={styles.button}><Text style={styles.text}>Log
                            in</Text></TouchableOpacity>
                    </View>
                    <View style={styles.footer}>
                        <Text>Don't have an account? <TouchableOpacity
                            onPress={() => navigation.replace("SignUp")}><Text style={styles.buttonText}>Create an
                            account</Text></TouchableOpacity></Text>
                        <Text>Forgot your password? <TouchableOpacity
                            onPress={() => navigation.replace("ResetPass")}><Text style={styles.buttonText}>Change Passowrd</Text></TouchableOpacity></Text>
                    </View>
                </View>
            </SafeAreaView>
        </LinearGradient>
    )
}


export default LogInScreen;

const styles = StyleSheet.create({
    container: {
        marginTop: 35,
        marginHorizontal: 32,
        padding: 16,
        borderRadius: 8,
        backgroundColor: 'white',
        elevation: 30,
        shadowColor: "#6e3d1b",
        shadowOffset: {width: 1, height: 1},
        shadowOpacity: 0.35,
        shadowRadius: 4,
        marginBottom: "50%",
    },
    outer: {
        flexGrow: 1,
        justifyContent: 'center',
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

    Boo: {
        fontSize: 20,
        color: '#d9a773',
        textDecorationLine: 'underline',
    },

    icon: {
        marginRight: 7,
    },

    button: {
        backgroundColor: '#d9a773',
        borderRadius: 8,
        marginTop: 2,
        marginBottom: 15,

    },
    text: {
        textAlign: 'center',
        fontSize: 18,
        padding: 6,
        color: '#7a5b3a'

    },
    buttonText: {
        marginTop: 18,
        color: '#795734',

    },
    biggerTitle: {
        color: 'white',
        fontSize: 50,
        textAlign: 'center',
        marginTop: 40,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
        alignContent: "center",
    },

    Ttitle: {
        fontSize: 35,
        fontFamily: "impact",
        color: 'white',

    },
    subtitle: {
        fontSize: 35,
        color: 'white',
        paddingLeft: 8,
        fontFamily: "impact",

    },
    textContainer: {
        flexDirection: 'column',

    },
    title: {
        textAlign: 'center',
        marginBottom: 15,
        fontSize: 20,
        color: '#d9a773'
    },
    noMargin: {
        marginVertical: 0,
    },
    titleIcon: {
        height: 200,
        width: 200,
        marginTop: 10
    },
    footer: {
    }

})