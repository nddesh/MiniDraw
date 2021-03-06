import { v4 as uuidv4 } from "uuid";

export const genId = () => {
  // return new Date().getTime().toString();
  return uuidv4();
};

export const selectShadowId = "select-shadow";

export const defaultValues = {
  mode: "rect", // 'select', 'line' <-- we are not using lien, 'rect', 'ellipse',
  borderColor: "#000",
  borderWidth: 3,
  fillColor: "#9fce63",
  vertextCount: 3,
  text: "",
};
