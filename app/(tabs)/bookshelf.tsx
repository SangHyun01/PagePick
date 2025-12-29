import { StyleSheet, Text, View } from 'react-native';

export default function BookshelfScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>책장</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
