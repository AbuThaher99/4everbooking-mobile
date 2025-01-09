import { configureStore } from "@reduxjs/toolkit";

import BookedReducer from "./book"
export const store = configureStore({
    reducer: {
        bookedHalls: BookedReducer,
    },
});
