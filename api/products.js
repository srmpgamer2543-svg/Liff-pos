export default async function handler(req, res) {
  try {
    const response = await fetch("https://api.loyverse.com/v1.0/items", {
      headers: {
        Authorization: `Bearer ${process.env.LOYVERSE_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    const products = data.items.map(item => {
      // 🔥 รองรับทั้ง 2 รูปแบบของ Loyverse
      let imageUrl = "";

      if (item.image_url) {
        imageUrl = item.image_url;
      } else if (item.images && item.images.length > 0) {
        imageUrl = item.images[0].url;
      }

      return {
        id: item.id,
        name: item.item_name,
        price:
          item.variants?.[0]?.default_price ||
          item.variants?.[0]?.price ||
          0,
        image_url: imageUrl
      };
    });

    res.status(200).json(products);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
