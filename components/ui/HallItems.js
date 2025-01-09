import { Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { FontAwesome } from "@expo/vector-icons"; // For star icons

function HallItems({
                       id,
                       name,
                       imageUrl,
                       location,
                       phoneNumber,
                       services,
                       capacity,
                       description,
                       categories,
                       longitude,
                       latitude,
                       averageRating,
                       HallRatings
                   }) {
    const nav = useNavigation();

    function pressHandler() {
        nav.navigate("details", {
            id,
            name,
            imageUrl,
            location,
            phoneNumber,
            services,
            description,
            categories,
            longitude,
            latitude,
            HallRatings
        });
    }

    // Helper function to calculate price range
    const calculatePriceRange = (categories, services) => {
        if (!categories || Object.keys(categories).length === 0) {
            return "N/A"; // No categories, return N/A
        }

        const categoryPrices = Object.values(categories);
        const lowestCategoryPrice = Math.min(...categoryPrices);
        const highestCategoryPrice = Math.max(...categoryPrices);

        const serviceCosts = services
            ? Object.values(services).reduce((sum, cost) => sum + parseFloat(cost || 0), 0)
            : 0;

        const totalHighestPrice = highestCategoryPrice + serviceCosts;

        return `${lowestCategoryPrice} - ${totalHighestPrice}`;
    };

    // Parse and filter the image URLs
    const parseImageUrls = (imageString) => {
        // Check if the imageString exists and is not empty
        if (!imageString || typeof imageString !== "string") {
            console.log("Invalid or empty image string");
            return [];
        }

        // Log the raw image string
        console.log("Raw image string:", imageString);

        // Split URLs by commas and trim whitespace
        const urls = imageString.split(",").map((url) => url.trim());
        console.log("Split URLs:", urls);

        // Filter valid image URLs
        const validUrls = urls.filter((url) => {
            // Get the last 3 characters before the `?`
            const extension = url.split("?")[0].slice(-3).toLowerCase();
            console.log(`URL: ${url}, Extracted Extension: ${extension}`); // Debug each URL and its extension

            // Check if the extension is a valid image extension
            return ["jpg", "jpeg", "png", "gif", "bmp", "webp"].some((validExt) =>
                extension.includes(validExt)
            );
        });

        console.log("Filtered Valid URLs:", validUrls);
        return validUrls;
    };



    // Get the first valid image URL
    const validImageUrls = parseImageUrls(imageUrl);
    const firstImageUrl = validImageUrls.length > 0 ? validImageUrls[0] : null;

    console.log("First image URL:", firstImageUrl);

    // Calculate price range
    const priceRange = calculatePriceRange(categories, services);

    // Render stars for the rating
    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <FontAwesome
                    key={i}
                    name="star"
                    size={16}
                    color={i <= averageRating ? "#cba36b" : "#ccc"}
                    style={styles.star}
                />
            );
        }
        return stars;
    };

    return (
        <View style={styles.hallItem}>
            <Pressable
                android_ripple={{ color: "#ccc" }}
                style={({ pressed }) => (pressed ? styles.buttonPressed : null)}
                onPress={pressHandler}
            >
                <View>
                    {/* Hall Image */}
                    {firstImageUrl ? (
                        <Image source={{ uri: firstImageUrl }} style={styles.image} />
                    ) : (
                        <View style={styles.noImageContainer}>
                            <Text style={styles.noImageText}>No Image Available</Text>
                        </View>
                    )}

                    {/* Hall Details */}
                    <View style={styles.detailsContainer}>
                        {/* Name */}
                        <Text style={styles.title}>{name}</Text>

                        {/* Price */}
                        <Text style={styles.price}>{priceRange}</Text>
                        <Text style={styles.perDay}>per day</Text>

                        {/* Rating */}
                        <View style={styles.ratingContainer}>{renderStars()}</View>
                    </View>

                    {/* Footer: Location and Capacity */}
                    <View style={styles.footer}>
                        <View style={styles.footerItem}>
                            <Icon name="location-outline" size={16} color="#555" />
                            <Text style={styles.footerText}>{location}</Text>
                        </View>
                        <View style={styles.footerItem}>
                            <Icon name="person" size={16} color="#555" />
                            <Text style={styles.footerText}>{capacity}</Text>
                        </View>
                    </View>
                </View>
            </Pressable>
        </View>
    );
}

export default HallItems;

const styles = StyleSheet.create({
    hallItem: {
        marginBottom: 20,
        borderRadius: 10,
        overflow: Platform.OS === "android" ? "hidden" : "visible",
        backgroundColor: "white",
        elevation: 6,
        shadowColor: "black",
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
    },
    image: {
        width: "100%",
        height: 200,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    noImageContainer: {
        width: "100%",
        height: 200,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
    },
    noImageText: {
        fontSize: 14,
        color: "#888",
    },
    detailsContainer: {
        padding: 16,
        alignItems: "center",
    },
    title: {
        fontWeight: "bold",
        fontSize: 18,
        textAlign: "center",
        marginBottom: 8,
        color: "#cba36b",
    },
    price: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#cba36b",
    },
    perDay: {
        fontSize: 12,
        color: "#888",
        marginBottom: 8,
    },
    ratingContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    star: {
        marginHorizontal: 2,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: "#eee",
    },
    footerItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    footerText: {
        marginLeft: 4,
        fontSize: 14,
        color: "#555",
    },
    buttonPressed: {
        opacity: 0.5,
    },
});
