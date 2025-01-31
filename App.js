import {StatusBar} from 'expo-status-bar';
import {Linking, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import LogInScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {NavigationContainer} from "@react-navigation/native";
import AuthContextProvider, {AuthContext} from "./store/auth-context";
import {useContext, useEffect, useState} from "react";
import MainScreen from "./screens/MainScreen";
import Icon from "react-native-vector-icons/Ionicons";
import {useFonts} from "expo-font";
import {createDrawerNavigator} from "@react-navigation/drawer";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {SettingScreen} from "./screens/SettingScreen";
import {HallsDetails} from "./screens/HallsDetails";
import HallContextProvider from "./store/HallsContext";
import LoadingOverlay from "./components/ui/LoadingOverlay";
import TimePickScreen from "./screens/TimePickScreen";
import PaymentDetailsScreen from "./screens/PaymentDetailsScreen";
import {Provider, useDispatch, useSelector} from "react-redux";
import {store} from "./store/redux/store";
import {BookedScreen} from "./screens/BookedScreen";
import {FilterScreen} from "./screens/FilterScreen";
import AddHallScreen from "./screens/AddHallScreen";
import MangeUserScreen from "./screens/MangeUserScreen";
import AdminHallApprovalScreen from "./screens/AproveScreen";
import ChangePasswordScreen from "./screens/ChangePassowrdScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import VerificationCodeScreen from "./screens/VerificationCodeScreen";
import AsyncStorage from '@react-native-async-storage/async-storage';
import OwnersHallsScreen from "./screens/OwnersHallsScreen";
import {setSearchQuery, setUserData} from "./store/redux/book";
import {BASE_URL} from "./assets/constant/ip";
import {FavoriteScreen} from "./screens/FavoriteScreen";
import HallOwnerReservedScreen from "./screens/HallOwnerReservedScreen";
import axios from "axios";
import {StripeProvider} from '@stripe/stripe-react-native';
import DeletedUsersScreen from "./screens/DeletedUsersScreen";
import AddAdminScreen from "./screens/AddAdminScreen";
import HallOwnerReportScreen from "./screens/HallOwnerReportScreen";
import DeletedHallsScreen from "./screens/DeletedHallsScreen";
import UpdateHallScreen from "./screens/UpdateHallScreen";
import ChatbotPage from "./screens/ChatbotPage";
import RecommendedHallsScreen from "./screens/RecommendedHallsScreen";
import {EditProfileScreen} from "./screens/EditProfileScreen";
import Ionicons from "react-native-vector-icons/Ionicons";



const Stack = createNativeStackNavigator();
const drawerNavigator = createDrawerNavigator();
const Tabs = createBottomTabNavigator();
const Drawer = createDrawerNavigator(); // Initialize the Drawer navigator
const SettingsStack = createNativeStackNavigator();

const OwnersHallsStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="MyHalls"
                component={OwnersHallsScreen}
                options={{ title: 'My Halls' }}
            />
            <Stack.Screen
                name="UpdateHall"
                component={UpdateHallScreen}
                options={{ title: 'Update Hall' }}
            />
        </Stack.Navigator>
    );
};
function SettingsStackNavigator() {
    return (
        <SettingsStack.Navigator>
            <SettingsStack.Screen
                name="SettingsMain"
                component={SettingScreen}
                options={{ headerTitle: 'Settings' }}
            />
            <SettingsStack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{ headerTitle: 'Edit Profile' }}
            />
        </SettingsStack.Navigator>
    );
}
function AuthStack() {
    return (
        <>
            <Stack.Navigator screenOptions={{
                headerStyle: {backgroundColor: "#d9a773"}, headerTitleAlign: 'center',
                headerShown: false,
            }}>
                <Stack.Screen name="Login" component={LogInScreen}/>
                <Stack.Screen name="SignUp" component={SignUpScreen} options={{headerTitle: "Sign Up"}}/>
                <Stack.Screen name="ResetPass" component={ForgotPasswordScreen} options={{title: null}}/>
                <Stack.Screen name="Verify" component={VerificationCodeScreen} options={{title: null}}/>


            </Stack.Navigator>
        </>
    );
}

function BottomTabNavigator({navigation}) {
    const userData = useSelector((state) => state.bookedHalls.userData);


    const handleAddHallPress = () => {
        navigation.navigate("addHall");

    };


    return (
        <Tabs.Navigator
            screenOptions={{headerShown: false, tabBarActiveTintColor: "#d9a773", tabBarInactiveTintColor: "#aaa"}}>
            {userData && userData.role === "CUSTOMER" && (
                <Tabs.Screen name="Home" component={MainScreen} options={{
                    tabBarIcon: ({color}) => (
                        <Icon name={'home'} color={color}
                              size={20}/>
                    )
                }}/>
            )}
            {userData && userData.role === "CUSTOMER" && (
                <Tabs.Screen name="booked" component={BookedScreen} options={{
                    tabBarIcon: ({color}) => (
                        <Icon name={'book-outline'} color={color}
                              size={20}/>
                    ),
                }}/>
            )}

            {userData?.role === "CUSTOMER" && (
                <Tabs.Screen
                    name="RecommendedHallsScreen"
                    component={RecommendedHallsScreen}
                    options={{
                        tabBarLabel: "Recommended",
                        tabBarIcon: ({ color, size }) => (
                            <Icon name="heart-outline" color={color} size={size || 20} /> // New Icon Name
                        ),
                    }}
                />
            )}


            {userData && userData.role === "HALL_OWNER" && (
                <>
                    <Tabs.Screen
                        name="MyHalls"
                        component={OwnersHallsStack}
                        options={{
                            tabBarIcon: ({ color }) => <Icon name={'bookmark'} color={color} size={20} />,
                        }}
                    />

                    <Tabs.Screen
                        name="DeletedHalls"
                        component={DeletedHallsScreen}
                        options={{
                            tabBarIcon: ({ color }) => (
                                <Icon name={'trash'} color={color} size={20} />
                            ),
                        }}
                    />
                </>
            )}

            {userData && userData.role === "HALL_OWNER" && (
                <Tabs.Screen
                    name="add"
                    component={AddHallScreen}
                    options={{
                        tabBarIcon: ({color}) => (
                            <Icon name={'add-circle'} color={"rgba(151,84,255,0.99)"}
                                  size={40}/>
                        ),
                    }}/>
            )}

            <Tabs.Screen
                name="Settings"
                component={SettingsStackNavigator} // This includes EditProfileScreen
                options={{
                    tabBarIcon: ({ color }) => (
                        <Icon name={'settings-outline'} color={color} size={20} />
                    ),
                }}
            />
        </Tabs.Navigator>
    );
}

function LogOutButton() {
    const authCtx = useContext(AuthContext);

    const handleLogout = () => {
        authCtx.logout(); // Call the logout function from the context
    };

    return (
        <TouchableOpacity onPress={handleLogout} style={{flexDirection: 'row', alignItems: 'center', padding: 10}}>
            <Icon name="exit" size={20} color="black"/>
            <Text style={{marginLeft: 10}}>Log Out</Text>
        </TouchableOpacity>
    );
}

function DrawerNavigator({route}) {
    const userData = useSelector((state) => state.bookedHalls.userData);
    const activeTab = route.params?.activeTab || 'No Active Tab';
    const [isSearchVisible, setSearchVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const dispatch = useDispatch();

    function handleSearchChange(text) {
        setSearchText(text); // Update state with the latest input
        dispatch(setSearchQuery(text.trim())); // Dispatch the trimmed value directly
    }

    return (
        <drawerNavigator.Navigator
            screenOptions={({ navigation }) => ({
                headerRight: () => (
                    <TouchableOpacity style={{ marginRight: 10 }} onPress={() => setSearchVisible(!isSearchVisible)}>
                        <Icon name="search-outline" size={30} color="#d9a773" />
                    </TouchableOpacity>
                ),
                headerTitle: () => (
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                        {isSearchVisible ? (
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search..."
                                autoFocus
                                value={searchText}
                                onChangeText={handleSearchChange}
                                onBlur={() => setSearchVisible(false)}
                            />
                        ) : (
                            <Text style={styles.headerTitle}>{route?.title ||  ''}</Text>
                        )}
                    </View>
                ),
            })}
        >
            <drawerNavigator.Screen
                name="tabHome"
                component={BottomTabNavigator}
                options={{
                    drawerIcon: ({color}) => (
                        <Icon name="home" color={color} size={20}/>
                    ),
                    title: "Home",
                }}
            />

            {userData?.role === "CUSTOMER" && (
                <drawerNavigator.Screen
                    name="favorite"
                    component={FavoriteScreen}
                    options={{
                        title: "Favorite",
                        drawerIcon: ({ color, size }) => (
                            <Icon name="star" color={color} size={size || 20} />
                        ),
                    }}
                />
            )}

            {userData && (userData.role === "ADMIN" || userData.role === "SUPER_ADMIN") && (
                <drawerNavigator.Screen
                    name="userControl"
                    component={MangeUserScreen}
                    options={{
                        drawerIcon: ({color}) => (
                            <Ionicons name="people-outline" color={color} size={20} /> // New Icon
                        ),
                    }}
                />
            )}

            {userData && (userData.role === "ADMIN" || userData.role === "SUPER_ADMIN")&& (
                <drawerNavigator.Screen
                    name="adminAprove"
                    component={AdminHallApprovalScreen}
                    options={{
                        drawerIcon: ({color}) => (
                            <Ionicons name="checkmark-done-outline" color={color} size={20} /> // New Icon
                        ),
                    }}
                />
            )}
            {userData &&  userData.role === "SUPER_ADMIN" && (
                <drawerNavigator.Screen
                    name="deletedUsers"
                    component={DeletedUsersScreen}
                    options={{
                        drawerIcon: ({ color }) => <Icon name="trash" color={color} size={20} />,
                        title: "Deleted Users",
                    }}
                />
            )}
            {userData && userData.role === "SUPER_ADMIN" && (
                <drawerNavigator.Screen
                    name="addAdmin"
                    component={AddAdminScreen}
                    options={{
                        drawerIcon: ({ color }) => <Icon name="person-add" color={color} size={20} />,
                        title: "Add Admin",
                    }}
                />
            )}

            {userData && userData.role === "HALL_OWNER" && (
                <drawerNavigator.Screen
                    name="ReservedHalls"
                    component={HallOwnerReservedScreen}
                    options={{
                        drawerIcon: ({color}) => (
                            <Icon name="calendar-outline" color={color} size={20}/>
                        ),
                    }}
                />
            )}
            {userData && userData.role === 'HALL_OWNER' && (
                <Drawer.Screen
                    name="Report"
                    component={HallOwnerReportScreen}
                    options={{
                        title: 'Reservation Report',
                        drawerIcon: ({ color }) => (
                            <Icon name="file-tray" color={color} size={20} />
                        ),
                    }}
                />
            )}
            {userData && (userData.role === "CUSTOMER" || userData.role === "HALL_OWNER" ||
                userData.role === "ADMIN" || userData.role === "SUPER_ADMIN") && (
                <drawerNavigator.Screen
                    name="chatBot"
                    component={ChatbotPage}
                    options={{
                        drawerIcon: ({color}) => (
                            <Icon name="chatbubbles-outline" color={color} size={20}/>
                        ),
                    }}
                />
            )}
        </drawerNavigator.Navigator>
    );
}


function AuthenticatedStack() {
    const hallData = useSelector((state) => state.bookedHalls.hallData);
    const userData = useSelector((state) => state.bookedHalls.userData);
    const authCtx = useContext(AuthContext);
    const [favoriteStatus, setFavoriteStatus] = useState({}); // Store favorite status per hall
    const dispatch = useDispatch();

    useEffect(() => {
        const loadFavorites = async () => {
            const savedStatus = await loadFavoriteStatus();
            setFavoriteStatus(savedStatus);
        };

        loadFavorites();
    }, []);

    useEffect(() => {
        async function fetchUserData() {
            try {
                const userResponse = await fetch(
                    `${BASE_URL}/whitelist/getUser`,
                    {
                        method: "GET",
                        headers: {
                            Accept: "*/*",
                            Authorization: `Bearer ${authCtx.token}`, // Fixed backticks
                        },
                    }
                );

                const data = await userResponse.json();
                // Handle the response if needed
                dispatch(setUserData(data));
                if (data.role === "HALL_OWNER") {

                    const hallOwnerData = await axios.get(
                        `${BASE_URL}/hallOwner/getHallOwnerByUserId/${data.id}`, // userId in the URL path
                        {
                            headers: {
                                Authorization: `Bearer ${authCtx.token}`, // Bearer token
                                "Content-Type": "application/json",
                                Accept: "*/*"
                            }
                        }
                    );
                    console.log(hallOwnerData.data.connectedAccountId)
                    const checkStripeAccount = await axios.post(
                        `${BASE_URL}/payments/resend-onboarding-link`,
                        {
                            connectedAccountId: hallOwnerData.data.connectedAccountId // Correct key for the body
                        },
                        {
                            headers: { // Correctly use headers key
                                Authorization: `Bearer ${authCtx.token}`, // Bearer token
                                "Content-Type": "application/json",
                                Accept: "application/json"
                            }
                        }
                    );
                    Linking.openURL(checkStripeAccount.data.onboardingLink).catch((error) => console.log(error));
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        }


        fetchUserData();
    }, []);


// Save the favorite status for each hall
    const saveFavoriteStatus = async (favoriteStatus) => {
        try {
            await AsyncStorage.setItem('favoriteStatus', JSON.stringify(favoriteStatus));
        } catch (error) {
            console.error("Error saving favorite status:", error);
        }
    };

// Load the favorite status for each hall
    const loadFavoriteStatus = async () => {
        try {
            const savedStatus = await AsyncStorage.getItem('favoriteStatus');
            if (savedStatus) {
                return JSON.parse(savedStatus);
            }
            return {}; // Return empty object if no saved status
        } catch (error) {
            console.error("Error loading favorite status:", error);
            return {}; // Return empty object in case of error
        }
    };


    async function MakeFavorite(hallId) {
        const url = `${BASE_URL}/customer/${userData.id}/favorites`;

        try {
            const isFavorited = favoriteStatus[hallId];

            if (isFavorited) {
                // Unfavorite the hall (DELETE request)
                const response = await fetch(url, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${authCtx.token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({id: hallId}),
                });

                if (response.ok) {
                    // Update the local state if the request was successful
                    const updatedStatus = {...favoriteStatus, [hallId]: false};
                    setFavoriteStatus(updatedStatus);
                    await saveFavoriteStatus(updatedStatus); // Persist the update to AsyncStorage
                } else {
                    console.error("Failed to unfavorite the hall:", response.status);
                }
            } else {
                // Favorite the hall (POST request)
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${authCtx.token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({id: hallId}),
                });

                if (response.ok) {
                    // Update the local state if the request was successful
                    const updatedStatus = {...favoriteStatus, [hallId]: true};
                    setFavoriteStatus(updatedStatus);
                    await saveFavoriteStatus(updatedStatus); // Persist the update to AsyncStorage
                } else {
                    console.error("Failed to favorite the hall:", response.status);
                }
            }
        } catch (error) {
            console.error("Error making favorite/unfavorite request:", error);
        }
    }


    return (
        <Stack.Navigator
            screenOptions={{
                headerTitleAlign: 'center',
                headerBackTitle: "Back"
            }}
        >


            <Stack.Screen
                name="Drawer"
                component={DrawerNavigator}
                options={{
                    headerShown: false,

                }}
            />

            <Stack.Screen
                name="details"
                component={HallsDetails}
                options={({ route }) => {
                    const hallId = route.params?.id; // Retrieve hall ID from route params

                    return {
                        headerShown: true, // Show the header
                        headerRight: () => (
                            <TouchableOpacity
                                onPress={() => MakeFavorite(hallId)} // Pass hallId to the function
                                style={{ marginRight: 10 }}
                            >
                                <Icon
                                    name={favoriteStatus[hallId] ? "star" : "star-outline"} // Conditional icon rendering
                                    size={30}
                                    color={favoriteStatus[hallId] ? "gold" : "black"} // Conditional color rendering
                                />
                            </TouchableOpacity>
                        ),
                        presentation: 'modal', // Optional: Use modal presentation to fix responsiveness
                    };
                }}
            />


            <Stack.Screen name={"time"} component={TimePickScreen}  options={{ presentation: 'modal' }}/>

            <Stack.Screen name={"pay"} component={PaymentDetailsScreen} options={{ presentation: 'modal' }}/>

            <Stack.Screen name={"Filter"} component={FilterScreen}  options={{ presentation: 'modal' }}/>

            <Stack.Screen name={"addHall"} component={AddHallScreen} options={{title: null}}/>

            <Stack.Screen name={"changePass"} component={ChangePasswordScreen} options={{title: null}}/>
        </Stack.Navigator>
    );
}

function Navigation() {

    const authCtx = useContext(AuthContext);

    return (
        <NavigationContainer>
            {!authCtx.isAuthenticated && <AuthStack/>}
            {authCtx.isAuthenticated && <AuthenticatedStack/>}
        </NavigationContainer>
    );
}

export default function App() {

    const [fontsLoaded] = useFonts({
        'Montserrat-Bold': require('./assets/fonts/Montserrat-Bold.ttf'),
        'OpenSans-Bold': require('./assets/fonts/OpenSans-Bold.ttf'),
        'OpenSans-BoldItalic': require('./assets/fonts/OpenSans-BoldItalic.ttf'),
        'LobBold': require('./assets/fonts/LobsterTwo-Bold.ttf'),
        'LobBoldItalic': require('./assets/fonts/LobsterTwo-BoldItalic.ttf'),
        'impact': require('./assets/fonts/impact.ttf'),
        'impacted': require('./assets/fonts/Impacted.ttf'),
        'Un-impact': require('./assets/fonts/unicode.impact.ttf'),


    });


    const [isFirstTime, setIsFirstTime] = useState(null); // To store the first-time status


    useEffect(() => {
        const checkFirstTimeUse = async () => {
            try {
                const value = await AsyncStorage.getItem('isFirstTime');
                if (value === null) {
                    setIsFirstTime(true);
                    await AsyncStorage.setItem('isFirstTime', 'false');
                } else {
                    setIsFirstTime(false);
                }
            } catch (error) {
                console.error('Error checking first time use:', error);
            }
        };

        checkFirstTimeUse();
    }, []);


    if (!fontsLoaded) {
        return <LoadingOverlay message={"just a moment"}/>
    }

    if (!isFirstTime) {
        return (
            <>
                <StatusBar style="light"/>
                <StripeProvider publishableKey="pk_test_51PluNHFNc7gJPoUc9XnL6UVtt25ebwD23sv8p2JR5tu74vgYjkJ45hDSoyx1OfUF2WJetMUziuq7lJaLk1jH9pny0041T40ceT">
                    <Provider store={store}>
                        <HallContextProvider>
                            <AuthContextProvider>
                                <Navigation/>
                            </AuthContextProvider>
                        </HallContextProvider>
                    </Provider>
                </StripeProvider>
            </>
        );
    } else {
        return (
            <View>
                <Text>Wow</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
