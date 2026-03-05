export default async function handler(req, res) {
  try {

    const headers = {
      Authorization: `Bearer ${process.env.LOYVERSE_TOKEN}`,
      "Content-Type": "application/json",
    };

    // ดึงสินค้า
    const itemsResponse = await fetch(
      "https://api.loyverse.com/v1.0/items",
      { headers }
    );

    const itemsData = await itemsResponse.json();

    // ดึง modifier ทั้งหมด
    const modifierResponse = await fetch(
      "https://api.loyverse.com/v1.0/modifier_lists",
      { headers }
    );

    const modifierData = await modifierResponse.json();
    const modifierLists = modifierData.modifier_lists || [];

    const products = itemsData.items.map(item => {

      const variant = item.variants?.[0];

      let imageUrl = "";
      if (item.image_url) {
        imageUrl = item.image_url;
      } else if (item.images?.length) {
        imageUrl = item.images[0].url;
      }

      // 🔥 ดึง modifier จาก item + variant
      const modifierIds = [
        ...(item.modifier_list_ids || []),
        ...(variant?.modifier_list_ids || [])
      ];

      const itemModifiers = modifierIds.map(modId => {

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
        variant_id: variant?.variant_id,
        name: item.item_name,
        price: variant?.default_price || variant?.price || 0,
        image_url: imageUrl,
        modifiers: itemModifiers
      };

    });

    res.status(200).json(products);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
