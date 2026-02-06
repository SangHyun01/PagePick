import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const BASIC_WIDTH = 375;

export const scale = (size: number) => {
  return (width / BASIC_WIDTH) * size;
};

export const fontScale = (size: number, factor = 0.5) => {
  return size + (scale(size) - size) * factor;
};
