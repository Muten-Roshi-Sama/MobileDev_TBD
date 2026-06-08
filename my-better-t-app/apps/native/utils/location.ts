// utils/location.ts
import * as Location from "expo-location";

export async function getGoogleMapsLink() {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== "granted") {
    throw new Error("Location permission denied");
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const { latitude, longitude } = location.coords;

  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}