import { createContext, useState } from "react";

export const BookedCtx = createContext({
    ids: [],
    addHall: (id) => {},
    removeHall: (id) => {},
});

function BookedContextProvider({ children }) {
    const [bookedHallId, setBookedHallId] = useState([]);

    function addHall(id) {
        setBookedHallId((currId) => [...currId, id]);
    }

    function removeHall(id) {
        setBookedHallId((currId) => currId.filter((bookedHallId) => bookedHallId !== id));
    }

    const value = {
        ids: bookedHallId,
        addHall: addHall,
        removeHall: removeHall,
    };

    return <BookedCtx.Provider value={value}>{children}</BookedCtx.Provider>;
}

export default BookedContextProvider;
