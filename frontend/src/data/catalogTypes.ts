export type ProductCategory = string;

export type ProductItem = {
  id: string;
  name: string;
  category: string;
  shortDesc: string;
  price: number;
  specs: string[];
  image: string;
  featured?: boolean;
};

export const defaultProductCategories: ProductCategory[] = [
  "Fire Alarm Sytems And Accessories",
  "Access Control & Time Attendance Systems",
  "Cctv Cameras And Accessories",
  "Electric Fences, Razor Wires and Accessories",
  "Networking products and accessories",
  "Computer Accesorries",
  "Automatic Gates & Accessories",
  "Featured Products",
];
