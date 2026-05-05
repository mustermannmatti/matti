import { db } from "./db";

export async function seedDatabase() {
  const existing = await db.user.count();
  if (existing > 0) return;

  const consumer = await db.user.create({
    data: { email: "max@example.com", name: "Max Mustermann", role: "consumer" },
  });

  const merchantUser = await db.user.create({
    data: { email: "rewe@example.com", name: "REWE Markt", role: "merchant" },
  });

  const store = await db.store.create({
    data: {
      name: "REWE Markt Frankfurt",
      address: "Zeil 90, 60313 Frankfurt",
      userId: merchantUser.id,
    },
  });

  const merchantUser2 = await db.user.create({
    data: { email: "dm@example.com", name: "dm-drogerie markt", role: "merchant" },
  });

  const store2 = await db.store.create({
    data: {
      name: "dm-drogerie markt",
      address: "Kaiserstraße 5, 60311 Frankfurt",
      userId: merchantUser2.id,
    },
  });

  const merchantUser3 = await db.user.create({
    data: { email: "edeka@example.com", name: "EDEKA", role: "merchant" },
  });

  const store3 = await db.store.create({
    data: {
      name: "EDEKA Aktiv Markt",
      address: "Hanauer Landstraße 200, 60314 Frankfurt",
      userId: merchantUser3.id,
    },
  });

  await db.receipt.create({
    data: {
      storeId: store.id,
      consumerId: consumer.id,
      total: 34.87,
      subtotal: 32.68,
      tax: 2.19,
      category: "Lebensmittel",
      status: "claimed",
      claimedAt: new Date("2026-05-03T14:23:00"),
      createdAt: new Date("2026-05-03T14:20:00"),
      items: {
        create: [
          { name: "Bio Vollmilch 1L", quantity: 2, price: 1.49, total: 2.98 },
          { name: "Mehrkornbrot 750g", quantity: 1, price: 2.89, total: 2.89 },
          { name: "Hähnchenbrust 400g", quantity: 1, price: 5.99, total: 5.99 },
          { name: "Tomaten 500g", quantity: 1, price: 1.79, total: 1.79 },
          { name: "Nudeln Barilla 500g", quantity: 3, price: 1.49, total: 4.47 },
          { name: "Olivenöl 500ml", quantity: 1, price: 5.99, total: 5.99 },
          { name: "Käse Gouda 400g", quantity: 1, price: 3.49, total: 3.49 },
          { name: "Orangen 1kg", quantity: 1, price: 2.99, total: 2.99 },
          { name: "Eier 10er", quantity: 1, price: 2.09, total: 2.09 },
        ],
      },
    },
  });

  await db.receipt.create({
    data: {
      storeId: store2.id,
      consumerId: consumer.id,
      total: 18.45,
      subtotal: 17.24,
      tax: 1.21,
      category: "Drogerie",
      status: "claimed",
      claimedAt: new Date("2026-05-02T10:15:00"),
      createdAt: new Date("2026-05-02T10:12:00"),
      items: {
        create: [
          { name: "Nivea Creme 150ml", quantity: 1, price: 3.95, total: 3.95 },
          { name: "Elmex Zahncreme 75ml", quantity: 2, price: 2.45, total: 4.90 },
          { name: "Shampoo Schauma 400ml", quantity: 1, price: 2.99, total: 2.99 },
          { name: "Rasierklingen 8er", quantity: 1, price: 6.49, total: 6.49 },
        ],
      },
    },
  });

  await db.receipt.create({
    data: {
      storeId: store3.id,
      consumerId: consumer.id,
      total: 52.10,
      subtotal: 48.69,
      tax: 3.41,
      category: "Lebensmittel",
      status: "claimed",
      claimedAt: new Date("2026-04-30T17:45:00"),
      createdAt: new Date("2026-04-30T17:40:00"),
      items: {
        create: [
          { name: "Rindfleisch Steak 600g", quantity: 1, price: 12.99, total: 12.99 },
          { name: "Kartoffeln 2,5kg", quantity: 1, price: 3.49, total: 3.49 },
          { name: "Rotwein Merlot 0,75L", quantity: 2, price: 7.99, total: 15.98 },
          { name: "Parmesan 200g", quantity: 1, price: 4.49, total: 4.49 },
          { name: "Salat Mix 200g", quantity: 1, price: 2.49, total: 2.49 },
          { name: "Sahne 200ml", quantity: 2, price: 1.09, total: 2.18 },
          { name: "Tiefkühlpizza 2er", quantity: 1, price: 4.49, total: 4.49 },
          { name: "Orangensaft 1L", quantity: 1, price: 1.99, total: 1.99 },
        ],
      },
    },
  });

  await db.receipt.create({
    data: {
      storeId: store.id,
      consumerId: consumer.id,
      total: 12.34,
      subtotal: 11.72,
      tax: 0.62,
      category: "Lebensmittel",
      status: "claimed",
      claimedAt: new Date("2026-04-28T12:30:00"),
      createdAt: new Date("2026-04-28T12:25:00"),
      items: {
        create: [
          { name: "Red Bull 4er Pack", quantity: 1, price: 4.99, total: 4.99 },
          { name: "Brezeln 3er", quantity: 1, price: 1.89, total: 1.89 },
          { name: "Käsekuchen 350g", quantity: 1, price: 3.49, total: 3.49 },
          { name: "Bananen 1kg", quantity: 1, price: 1.69, total: 1.69 },
        ],
      },
    },
  });

  const pendingReceipt = await db.receipt.create({
    data: {
      storeId: store.id,
      total: 23.56,
      subtotal: 22.13,
      tax: 1.43,
      category: "Lebensmittel",
      status: "pending",
      items: {
        create: [
          { name: "Milch 1L", quantity: 2, price: 1.29, total: 2.58 },
          { name: "Butter 250g", quantity: 1, price: 1.89, total: 1.89 },
          { name: "Joghurt 500g", quantity: 2, price: 0.99, total: 1.98 },
          { name: "Müsli 600g", quantity: 1, price: 3.49, total: 3.49 },
          { name: "Apfelsaft 1L", quantity: 1, price: 1.79, total: 1.79 },
          { name: "Vollkornbrot 500g", quantity: 1, price: 2.59, total: 2.59 },
        ],
      },
    },
  });

  return { consumerId: consumer.id, pendingToken: pendingReceipt.token };
}
