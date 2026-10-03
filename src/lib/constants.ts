import type { BookingArea, ServiceType } from "@/types";

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const CATEGORIES = [
  {
    slug: "living-room",
    name: "Living Room",
    description: "Declutter, organise and restructure everyday spaces.",
    image: "/images/DIY Home Aesthetic Idea 87.jpg",
  },
  {
    slug: "kitchen",
    name: "Kitchen",
    description: "Create practical storage systems and cleaner workflows.",
    image: "/images/kitchen-messy.jpg",
  },
  {
    slug: "bedroom",
    name: "Bedroom",
    description: "Organise wardrobes, furniture and personal spaces.",
    image: "/images/Easy DIY Dorm Room Decor for a Cozy Space.jpg",
  },
  {
    slug: "wardrobe",
    name: "Wardrobe",
    description: "Sort, categorise and create an easier wardrobe system.",
    image: "/images/21+ Stylish Wardrobe Closet Design Ideas.jpg",
  },
  {
    slug: "walls-shelves",
    name: "Walls & Shelves",
    description: "Restructure shelves, displays and wall storage.",
    image: "/images/shelves-organized.jpg",
  },
  {
    slug: "entire-home",
    name: "Entire Home",
    description: "A complete organisation, cleaning and transformation service.",
    image: "/images/studio-after-labeled.jpg",
  },
] as const;

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Tell us about your space",
    description: "Choose what needs organising and tell us what you're looking for.",
  },
  {
    step: "02",
    title: "Pick a time",
    description: "Choose a convenient date and time for our team to visit.",
  },
  {
    step: "03",
    title: "Let the transformation begin",
    description:
      "Our team organises, cleans and transforms your space based on the service you selected.",
  },
];

export interface ServiceLevel {
  id: ServiceType;
  name: string;
  description: string;
  includes: string[];
  highlighted?: boolean;
}

export const SERVICE_LEVELS: ServiceLevel[] = [
  {
    id: "organise",
    name: "Organise",
    description: "For spaces that mainly need decluttering and better organisation.",
    includes: ["Sorting", "Categorising", "Rearranging", "Storage organisation"],
  },
  {
    id: "organise_clean",
    name: "Organise + Clean",
    description: "For spaces that need both organisation and cleaning.",
    includes: [
      "Everything in Organise",
      "Surface cleaning",
      "Basic deep cleaning",
      "Space reset",
    ],
  },
  {
    id: "organise_clean_transform",
    name: "Organise + Clean + Transform",
    description: "For customers who want a complete change.",
    includes: [
      "Everything above",
      "Space restructuring",
      "Storage planning",
      "Furniture rearrangement",
      "Visual transformation",
    ],
    highlighted: true,
  },
  {
    id: "complete_home_reset",
    name: "Complete Home Reset",
    description: "For customers who want to completely restructure their home.",
    includes: [
      "Multiple rooms",
      "Organisation",
      "Cleaning",
      "Restructuring",
      "Storage optimisation",
      "Complete home reset",
    ],
  },
];

export const BOOKING_AREAS: BookingArea[] = [
  "Hall / Living Room",
  "Kitchen",
  "Bedroom",
  "Wardrobe",
  "Bathroom",
  "Kids Room",
  "Walls / Shelves",
  "Storage",
  "Entire Home",
  "Other",
];

export const LAUNCH_OFFER = {
  total: 20,
};
