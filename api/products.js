export default async function handler(req, res) {
  try {
    const response = await fetch("https://api.loyverse.com/v1.0/items", {
      headers: {
        Authorization: `Bearer ${process.env.LOYVERSE_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    const products = data.items.map(item => ({
      id: item.id,
      name: item.item_name,
      price: item.variants?.[0]?.price || 0,
      image: item.image_url || ""
    }));

    res.status(200).json(products);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
