export default async function handler(req, res) {
  try {

    // ดึงสินค้า
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

    // ดึง modifier list ทั้งหมด
    const modifierResponse = await fetch(
      "https://api.loyverse.com/v1.0/modifier_lists",
      {
        headers: {
          Authorization: `Bearer ${process.env.LOYVERSE_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const modifierData = await modifierResponse.json();

    const modifierLists = modifierData.modifier_lists || [];

    const products = itemsData.items.map(item => {

      let imageUrl = "";

      if (item.image_url) {
        imageUrl = item.image_url;
      } else if (item.images && item.images.length > 0) {
        imageUrl = item.images[0].url;
      }

      // หา modifier ของสินค้านี้
      const itemModifiers = (item.modifier_list_ids || []).map(modId => {

        const modifierList = modifierLists.find(m => m.id === modId);

        if (!modifierList) return null;

        return {
          id: modifierList.id,
          name: modifierList.name,
          options: modifierList.modifiers.map(opt => ({
            id: opt.id,
            name: opt.name,
            price: opt.price || 0
          }))
        };

      }).filter(Boolean);

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
