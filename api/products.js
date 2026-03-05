export default async function handler(req, res) {
  try {

    const itemsResponse = await fetch(
      "https://api.loyverse.com/v1.0/items",
      {
        headers: {
          Authorization: `Bearer ${process.env.LOYVERSE_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const itemsData = await itemsResponse.json();

    const products = (itemsData.items || []).map(item => {

      let imageUrl = "";

      if (item.image_url) {
        imageUrl = item.image_url;
      } else if (item.images && item.images.length > 0) {
        imageUrl = item.images[0].url;
      }

      // ดึง modifier จาก item.modifier_lists
      const itemModifiers = (item.modifier_lists || []).map(list => ({
        id: list.id,
        name: list.name,
        options: (list.modifiers || []).map(opt => ({
          id: opt.id,
          name: opt.name,
          price: opt.price || 0
        }))
      }));

      return {
        id: item.id,
        name: item.item_name,
        price:
          item.variants?.[0]?.default_price ||
          item.variants?.[0]?.price ||
          0,
        image_url: imageUrl,
        modifiers: itemModifiers
      };

    });

    res.status(200).json(products);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
