import { createSlice } from "@reduxjs/toolkit";

const BookedSlice = createSlice({
    name: "booked",
    initialState: {
        ids: [], // Stores IDs of booked items
        bookedHall: [], // Stores booked hall data
        userData: [], // Store user data
        hallData: [], // Store user data
        searchQuery : "",

    },
    reducers: {
        addBooked: (state, action) => {
            state.ids.push(action.payload.id);
        },

        addBookedHall: (state, action) => {
            state.bookedHall.push(action.payload.halls);
        },

        removeBooked: (state, action) => {
            state.ids.splice(state.ids.indexOf(action.payload.id), 1);
        },

        setUserData: (state, action) => {
            state.userData = action.payload; // Set user data
        },
        updateUserImage:(state, action) =>{
            state.userData.image = action.payload; // Update the image URL
        },
        setHallData: (state, action) => {
            state.hallData = action.payload; // Set user data
        },

        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload; // Set to empty string if undefined or null
        },

        clearUserData: (state) => {
            state.userData = null; // Clear user data
        },
    },
});

export const {
    addBooked,
    addBookedHall,
    removeBooked,
    setUserData,
    clearUserData,
    setHallData,
    setSearchQuery,
    updateUserImage, // Ensure this is exported
} = BookedSlice.actions;

export default BookedSlice.reducer;
