import { StyleSheet, Text, View } from "react-native";

export const FiveSevenFive = () => {
    return (
        <View>
        <Text style={styles.number}>5</Text>
        <Text style={styles.number}>7</Text>
        <Text style={styles.number}>5</Text>
        </View>
    )
}

const styles = StyleSheet.create({
  number: {
    fontSize: 36,
    fontFamily: 'PlexSerifRegular'
  }
});