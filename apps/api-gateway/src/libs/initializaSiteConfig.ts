import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const initializeSiteConfig = async () => {
  try {
    const existingConfig = await prisma.site_configs.findFirst();
    if (!existingConfig) {
      await prisma.site_configs.create({
        data: {
          categories: [
            "Electronics",
            "Fashion",
            "Home & Kitchen",
            "Sports & Fitness",
          ],
          subCategories: {
            "Electronics": [
              "Mobiles",
              "Laptops",
              "Tablets",
              "Accessories",
              "Gaming",
            ],
            "Fashion": ["Men", "Women", "Kids", "Footwear"],
            "Home & Kitchen": [
              "Kitchen Appliances",
              "Home Decor",
              "Furniture",
              "Cleaning Supplies",
            ],
            "Sports & Fitness": [
              "Fitness Equipment",
              "Sports Gear",
              "Athletic Wear",
              "Outdoor Gear",
            ],
          },
        },
      });
    }
  } catch (error) {
    console.error("Error initializing site config", error);
  }
};

export default initializeSiteConfig;
