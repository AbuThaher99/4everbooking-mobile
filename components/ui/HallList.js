import { View, FlatList, StyleSheet } from "react-native";

import HallItems from "./HallItems";
import {fetchHalls} from "../../utill/FBdata";
import {useContext} from "react";
import {HallsContext} from "../../store/HallsContext";

function renderHallItems(itemData) {
    return <HallItems {...itemData.item} />;
}
function HallList({ items }) {
    const hallsCtx = useContext(HallsContext);

    async function getHalls() {
        const halls = await fetchHalls({page: +1});
        hallsCtx.setHall(halls);
    }

    return (
        <View >
            <FlatList
                data={items}
                keyExtractor={(item) => item.id}
                renderItem={renderHallItems}
                // onEndReached={getHalls}
                // onEndReachedThreshold={0.5}
            />
        </View>
    );
}

export default HallList;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
});
