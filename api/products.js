import axios from "axios";

export default async function handler(req, res) {
  try {

    const token = process.env.LOYVERSE_TOKEN;

    // ดึงสินค้า
    const itemRes = await axios.get("https://api.loyverse.com/v1.0/items", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const items = itemRes.data.items;

    // ดึงหมวดหมู่
    const catRes = await axios.get("https://api.loyverse.com/v1.0/categories", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const categories = catRes.data.categories;

    // ทำ map category
    const categoryMap = {};
    categories.forEach(c => {
      categoryMap[c.id] = c.name;
    });

    // modifiers
    const modRes = await axios.get("https://liff-pos.vercel.app/api/modifiers");
    const modifiers = modRes.data;

    const products = items.map(item => {

      const variant = item.variants?.[0];

      return {
        id: item.id,
        variant_id: variant?.variant_id,
        name: item.item_name,
        price: variant?.price,
        image_url: item.image_url || "",
        category: categoryMap[item.category_id] || "อื่นๆ",
        modifiers: modifiers
      };

    });

    res.status(200).json(products);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "โหลดสินค้าไม่สำเร็จ"
    });

  }
}
