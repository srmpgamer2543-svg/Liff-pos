export default async function handler(req, res) {

  try {

    const headers = {
      Authorization: `Bearer ${process.env.LOYVERSE_TOKEN}`,
      "Content-Type": "application/json"
    };

    const [itemsRes, modifiersRes, categoriesRes] = await Promise.all([
      fetch("https://api.loyverse.com/v1.0/items", { headers }),
      fetch("https://api.loyverse.com/v1.0/modifier_lists", { headers }),
      fetch("https://api.loyverse.com/v1.0/categories", { headers })
    ]);

    const itemsData = await itemsRes.json();
    const modifiersData = await modifiersRes.json();
    const categoriesData = await categoriesRes.json();

    const items = itemsData.items || [];
    const modifierLists = modifiersData.modifier_lists || [];
    const categories = categoriesData.categories || [];

    // -----------------------------
    // modifier map
    // -----------------------------
    const modifiersMap = {};

    modifierLists.forEach(list => {

      modifiersMap[list.id] = {
        id: list.id,
        name: list.name,
        modifiers: (list.modifiers || []).map(m => ({
          id: m.id,
          name: m.name,
          price: Number(m.price || 0)
        }))
      };

    });

    // -----------------------------
    // category map
    // -----------------------------
    const categoriesMap = {};

    categories.forEach(cat => {
      categoriesMap[cat.id] = cat.name;
    });

    const menu = [];

    // -----------------------------
    // items loop
    // -----------------------------
    items.forEach(item => {

      const categoryName = categoriesMap[item.category_id] || null;

      let itemModifierIds = [];

      if (Array.isArray(item.modifier_list_ids)) {

        itemModifierIds = item.modifier_list_ids.map(m =>
          typeof m === "string" ? m : m.modifier_list_id
        );

      }

      if (Array.isArray(item.modifier_lists)) {

        itemModifierIds = item.modifier_lists.map(m => m.id);

      }

      const itemModifiers = itemModifierIds
        .map(id => modifiersMap[id])
        .filter(Boolean);

      // -----------------------------
      // variants
      // -----------------------------
      (item.variants || []).forEach(variant => {

        // -----------------------------
        // price auto detect
        // -----------------------------
        let price = 0;

        if (variant.stores && variant.stores.length > 0) {

          price = Number(
            variant.stores[0].price ||
            variant.stores[0].default_price ||
            0
          );

        } else if (variant.price) {

          price = Number(variant.price);

        } else if (variant.default_price) {

          price = Number(variant.default_price);

        } else if (item.default_price) {

          price = Number(item.default_price);

        }

        // -----------------------------
        // variant modifiers
        // -----------------------------
        let variantModifierIds = [];

        if (Array.isArray(variant.modifier_list_ids)) {

          variantModifierIds = variant.modifier_list_ids.map(m =>
            typeof m === "string" ? m : m.modifier_list_id
          );

        }

        const variantModifiers = variantModifierIds
          .map(id => modifiersMap[id])
          .filter(Boolean);

        const finalModifiers =
          variantModifiers.length > 0 ? variantModifiers : itemModifiers;

        // -----------------------------
        // push menu
        // -----------------------------
        menu.push({

          item_id: item.id,
          variant_id: variant.variant_id,

          name: item.item_name,
          variant_name: variant.option1_value || null,

          description: item.description || "",

          category_id: item.category_id,
          category_name: categoryName,

          sku: variant.sku || null,
          barcode: variant.barcode || null,

          image: item.image_url || null,

          price: price,

          modifiers: finalModifiers

        });

      });

    });

    res.status(200).json(menu);

  } catch (error) {

    res.status(500).json({
      error: "menu api error",
      detail: error.message
    });

  }

}
