import { createContext, useReducer } from "react";

export const HallsContext = createContext({
    halls: [],
    addHall: ({ location, phoneNumber, services }) => {},
    setHall: (halls) => {},
    setOwnersHall: (halls) => {},
    deleteHall: (id) => {},
    updateHall: (id, { location, phoneNumber, services }) => {},
});

function HallsReducer(state, action) {
    switch (action.type) {
        case "ADD":
            return [action.payload, ...state];
        case "SET":
            const inverted = action.payload.reverse();
            return inverted;
        case "UPDATE":
            const updatableHallIndex = state.findIndex(
                (hall) => hall.id === action.payload.id
            );
            const updatableHall = state[updatableHallIndex];
            const updatedItem = { ...updatableHall, ...action.payload.data };
            const updatedHall = [...state];
            updatedHall[updatableHallIndex] = updatedItem;
            return updatedHall;
        case "DELETE":
            return state.filter((hall) => hall.id !== action.payload);
        default:
            return state;
    }
}

function HallContextProvider({ children }) {
    const [hallState, dispatch] = useReducer(HallsReducer, []);

    function addHall(hallData) {
        dispatch({ type: "ADD", payload: hallData });
    }

    function setHall(hall) {
        dispatch({ type: "SET", payload: hall });
    }

    function setOwnersHall(hall) {
        dispatch({ type: "SET", payload: hall });
    }


    function deleteHall(id) {
        dispatch({ type: "DELETE", payload: id });
    }

    function updateHall(id, hallData) {
        dispatch({ type: "UPDATE", payload: { id: id, data: hallData } });
    }

    const value = {
        halls: hallState,
        setHall: setHall,
        addHall: addHall,
        deleteHall: deleteHall,
        updateHall: updateHall,
        setOwnersHall: setOwnersHall,
    };

    return (
        <HallsContext.Provider value={value}>
            {children}
        </HallsContext.Provider>
    );
}

export default HallContextProvider;
