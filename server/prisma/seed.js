const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Slipper Haven database seeding...');

  // 1. Create Default Users (Admin & Customer)
  const salt = await bcrypt.genSalt(10);
  const newAdminPassword = await bcrypt.hash('seshu@2409slippers', salt);
  const legacyAdminPassword = await bcrypt.hash('Admin@12345', salt);
  const customerPassword = await bcrypt.hash('Customer@12345', salt);

  const admin1 = await prisma.user.upsert({
    where: { email: 'nagaseshukumarbobbiti@gmail.com' },
    update: {
      passwordHash: newAdminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
    create: {
      name: 'Seshu Kumar (Super Admin)',
      email: 'nagaseshukumarbobbiti@gmail.com',
      phone: '+919999977777',
      passwordHash: newAdminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  const admin2 = await prisma.user.upsert({
    where: { email: 'nagaseshukumatbobbiti@gmail.com' },
    update: {
      passwordHash: newAdminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
    create: {
      name: 'Seshu Kumar (Super Admin)',
      email: 'nagaseshukumatbobbiti@gmail.com',
      phone: '+919999988888',
      passwordHash: newAdminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  // Keep legacy admin as backup
  await prisma.user.upsert({
    where: { email: 'admin@aurasole.com' },
    update: {
      passwordHash: newAdminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
    create: {
      name: 'Store Administrator',
      email: 'admin@aurasole.com',
      phone: '+919876543211',
      passwordHash: newAdminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      name: 'Rohan Sharma',
      email: 'customer@example.com',
      phone: '+919812345678',
      passwordHash: customerPassword,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  console.log('✅ Users seeded (Super Admin: nagaseshukumatbobbiti@gmail.com / seshu@2409slippers)');

  // 2. Create Site Settings
  const settings = [
    { key: 'brandName', value: 'AuraSole', isPublic: true },
    { key: 'brandTagline', value: 'Step Into Pure Cloud Comfort', isPublic: true },
    { key: 'announcementText', value: '✨ Free Express Delivery on orders above ₹999 | Use Code COMFORT15 for 15% OFF', isPublic: true },
    { key: 'whatsappNumber', value: '+919876543210', isPublic: true },
    { key: 'supportPhone', value: '1800-202-3030', isPublic: true },
    { key: 'supportEmail', value: 'care@aurasole.com', isPublic: true },
    { key: 'currency', value: '₹', isPublic: true },
    { key: 'currencyCode', value: 'INR', isPublic: true },
    { key: 'freeShippingThreshold', value: '999', isPublic: true },
    { key: 'instagramUrl', value: 'https://instagram.com/aurasole_official', isPublic: true },
    { key: 'facebookUrl', value: 'https://facebook.com/aurasole', isPublic: true },
  ];

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log('✅ Site settings seeded');

  // 3. Create Categories
  const categoriesData = [
    {
      name: "Men's Slippers",
      slug: 'men',
      description: 'Engineered for rugged daily comfort, ergonomic arch support, and casual modern styles.',
      image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800&auto=format&fit=crop',
      displayOrder: 1,
    },
    {
      name: "Women's Slippers",
      slug: 'women',
      description: 'Ultra-soft footbeds, cloud cushioning, chic slides, and elegant home lounge wear.',
      image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop',
      displayOrder: 2,
    },
    {
      name: "Kids' Slippers",
      slug: 'kids',
      description: 'Feather-light, playful colors, anti-skid protection, and bubble soft materials.',
      image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=800&auto=format&fit=crop',
      displayOrder: 3,
    },
    {
      name: 'Unisex & Wellness',
      slug: 'unisex',
      description: 'Acupressure, orthopedic arch support, bathroom waterproof, and memory foam essentials.',
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop',
      displayOrder: 4,
    },
  ];

  const categories = {};
  for (const cat of categoriesData) {
    categories[cat.slug] = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }
  console.log('✅ Categories seeded');

  // 4. Create Subcategories
  const subCategoriesData = [
    { name: 'Ergonomic Slides', slug: 'men-slides', categoryId: categories['men'].id },
    { name: 'Classic Flip Flops', slug: 'men-flip-flops', categoryId: categories['men'].id },
    { name: 'Luxury Leather Slippers', slug: 'men-leather', categoryId: categories['men'].id },
    { name: 'Orthopedic Daily Wear', slug: 'men-ortho', categoryId: categories['men'].id },

    { name: 'Cloud Comfort Slides', slug: 'women-slides', categoryId: categories['women'].id },
    { name: 'Plush Home Slippers', slug: 'women-home', categoryId: categories['women'].id },
    { name: 'Water-Resistant Spa', slug: 'women-spa', categoryId: categories['women'].id },
    { name: 'Fashion Strappy Slippers', slug: 'women-fashion', categoryId: categories['women'].id },

    { name: 'Boys Fun Slides', slug: 'kids-boys', categoryId: categories['kids'].id },
    { name: 'Girls Pastel Slippers', slug: 'kids-girls', categoryId: categories['kids'].id },

    { name: 'Acupressure & Therapy', slug: 'unisex-therapy', categoryId: categories['unisex'].id },
    { name: 'Anti-Slip Bathroom Slides', slug: 'unisex-bathroom', categoryId: categories['unisex'].id },
  ];

  const subCategories = {};
  for (const sub of subCategoriesData) {
    subCategories[sub.slug] = await prisma.subCategory.upsert({
      where: { slug: sub.slug },
      update: sub,
      create: sub,
    });
  }
  console.log('✅ Subcategories seeded');

  // 5. Create Realistic Slipper Products
  const productsData = [
    {
      name: 'AuraCloud Ultra-Recovery Slides',
      slug: 'auracloud-ultra-recovery-slides',
      sku: 'AS-REC-001',
      brand: 'AuraSole',
      shortDescription: 'High-density EVA foam recovery slides designed to soothe feet after workouts and long walking days.',
      description: 'The AuraCloud Ultra-Recovery Slides feature an anatomically molded deep heel cup and curved arch support that absorbs impact by 37% more than standard footwear. Perfect for indoor relaxation or post-workout recovery.',
      categoryId: categories['men'].id,
      subcategoryId: subCategories['men-slides'].id,
      gender: 'MEN',
      ageGroup: 'Adult',
      productType: 'Slides',
      material: 'High-Density EVA Foam',
      soleMaterial: 'Anti-Skid Grooved EVA',
      upperMaterial: 'Molded EVA Strap',
      style: 'Modern Minimalist',
      occasion: 'Casual / Post-Workout',
      pattern: 'Solid Matte',
      comfortFeatures: 'Deep heel cup, contoured arch support, shock absorption cushioning',
      careInstructions: 'Wash with mild soapy water. Air dry in shade.',
      price: 899,
      originalPrice: 1499,
      discountPercentage: 40,
      stock: 65,
      rating: 4.8,
      reviewCount: 142,
      isFeatured: true,
      isTrending: true,
      isNewArrival: true,
      isBestSeller: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800&auto=format&fit=crop', isPrimary: true, sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop', isPrimary: false, sortOrder: 1 },
      ],
      variants: [
        { size: '7', colorName: 'Obsidian Black', colorCode: '#1A1A1A', stock: 15 },
        { size: '8', colorName: 'Obsidian Black', colorCode: '#1A1A1A', stock: 20 },
        { size: '9', colorName: 'Obsidian Black', colorCode: '#1A1A1A', stock: 18 },
        { size: '10', colorName: 'Obsidian Black', colorCode: '#1A1A1A', stock: 12 },
        { size: '8', colorName: 'Slate Grey', colorCode: '#708090', stock: 10 },
        { size: '9', colorName: 'Slate Grey', colorCode: '#708090', stock: 15 },
      ],
    },
    {
      name: 'Nappa Luxe Italian Leather Lounge Slippers',
      slug: 'nappa-luxe-italian-leather-lounge-slippers',
      sku: 'AS-LTH-002',
      brand: 'AuraSole Signature',
      shortDescription: 'Handcrafted premium genuine leather lounge slippers with breathable memory foam insole.',
      description: 'Crafted for gentlemen who appreciate timeless luxury. Made from supple top-grain leather with hand-stitched detailing, a cushioned padded footbed, and a durable non-marking rubber sole for indoor sophistication.',
      categoryId: categories['men'].id,
      subcategoryId: subCategories['men-leather'].id,
      gender: 'MEN',
      ageGroup: 'Adult',
      productType: 'Leather Luxury',
      material: 'Top-Grain Leather',
      soleMaterial: 'Non-Marking Anti-Slip Rubber',
      upperMaterial: 'Nappa Soft Leather',
      style: 'Luxury Lounge',
      occasion: 'Home / Lounge / Formal Leisure',
      pattern: 'Textured Grain',
      comfortFeatures: 'Memory foam padded footbed, breathable leather lining',
      careInstructions: 'Use specialized leather cream. Avoid water immersion.',
      price: 1899,
      originalPrice: 2999,
      discountPercentage: 36,
      stock: 35,
      rating: 4.9,
      reviewCount: 88,
      isFeatured: true,
      isTrending: false,
      isNewArrival: false,
      isBestSeller: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop', isPrimary: true, sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=800&auto=format&fit=crop', isPrimary: false, sortOrder: 1 },
      ],
      variants: [
        { size: '7', colorName: 'Mocha Brown', colorCode: '#4B3621', stock: 8 },
        { size: '8', colorName: 'Mocha Brown', colorCode: '#4B3621', stock: 12 },
        { size: '9', colorName: 'Mocha Brown', colorCode: '#4B3621', stock: 10 },
        { size: '10', colorName: 'Midnight Black', colorCode: '#000000', stock: 5 },
      ],
    },
    {
      name: 'VelvetCloud Plush Memory Foam Home Slippers',
      slug: 'velvetcloud-plush-memory-foam-home-slippers',
      sku: 'AS-PLU-003',
      brand: 'AuraSole',
      shortDescription: 'Sumptuously soft faux-fur open-toe bedroom slippers with responsive memory foam footbed.',
      description: 'Wrap your feet in pure indulgence. VelvetCloud combines breathable fleece lining with dual-density memory foam that molds to your unique foot contours, providing marshmallow-like comfort all day.',
      categoryId: categories['women'].id,
      subcategoryId: subCategories['women-home'].id,
      gender: 'WOMEN',
      ageGroup: 'Adult',
      productType: 'Home Slippers',
      material: 'Plush Faux Fur & Velvet',
      soleMaterial: 'Thermo-Plastic Rubber (TPR)',
      upperMaterial: 'Fluffy Coral Fleece',
      style: 'Cozy Bedroom',
      occasion: 'Home / Bedroom / Lounging',
      pattern: 'Solid Fluffy',
      comfortFeatures: 'High-density memory foam, warm plush lining, silent step sole',
      careInstructions: 'Hand wash gently with wool detergent. Air dry flat.',
      price: 699,
      originalPrice: 1199,
      discountPercentage: 41,
      stock: 80,
      rating: 4.9,
      reviewCount: 210,
      isFeatured: true,
      isTrending: true,
      isNewArrival: true,
      isBestSeller: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop', isPrimary: true, sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=800&auto=format&fit=crop', isPrimary: false, sortOrder: 1 },
      ],
      variants: [
        { size: '5', colorName: 'Blush Pink', colorCode: '#FFB6C1', stock: 20 },
        { size: '6', colorName: 'Blush Pink', colorCode: '#FFB6C1', stock: 25 },
        { size: '7', colorName: 'Blush Pink', colorCode: '#FFB6C1', stock: 15 },
        { size: '6', colorName: 'Cream Beige', colorCode: '#F5F5DC', stock: 20 },
        { size: '7', colorName: 'Cream Beige', colorCode: '#F5F5DC', stock: 18 },
      ],
    },
    {
      name: 'HydroGrip Quick-Dry Bathroom Slides',
      slug: 'hydrogrip-quick-dry-bathroom-slides',
      sku: 'AS-BTH-004',
      brand: 'AuraSole',
      shortDescription: 'Drainage-hole sole bathroom slippers with non-skid diamond traction for wet surfaces.',
      description: 'Never worry about wet slippery floors again. The HydroGrip features smart drainage channels that instantly evacuate water and a diamond-embossed anti-skid rubber sole that clings firmly to wet tiles.',
      categoryId: categories['unisex'].id,
      subcategoryId: subCategories['unisex-bathroom'].id,
      gender: 'UNISEX',
      ageGroup: 'Adult',
      productType: 'Bathroom Slippers',
      material: 'Waterproof Quick-Dry EVA',
      soleMaterial: 'Anti-Skid Diamond Grip Rubber',
      upperMaterial: 'Perforated EVA',
      style: 'Waterproof Spa & Bath',
      occasion: 'Bathroom / Pool / Spa / Shower',
      pattern: 'Hexagonal Drainage Mesh',
      comfortFeatures: 'Fast drainage, acupressure massage footbed, anti-mildew',
      careInstructions: 'Rinse with clean water after use.',
      price: 499,
      originalPrice: 899,
      discountPercentage: 44,
      stock: 120,
      rating: 4.7,
      reviewCount: 315,
      isFeatured: false,
      isTrending: true,
      isNewArrival: false,
      isBestSeller: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop', isPrimary: true, sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800&auto=format&fit=crop', isPrimary: false, sortOrder: 1 },
      ],
      variants: [
        { size: '6', colorName: 'Aqua Blue', colorCode: '#00FFFF', stock: 25 },
        { size: '7', colorName: 'Aqua Blue', colorCode: '#00FFFF', stock: 30 },
        { size: '8', colorName: 'Aqua Blue', colorCode: '#00FFFF', stock: 30 },
        { size: '9', colorName: 'Charcoal Grey', colorCode: '#36454F', stock: 35 },
      ],
    },
    {
      name: 'OrthoRelief Doctor-Approved Arch Support Slippers',
      slug: 'orthorelief-doctor-approved-arch-support-slippers',
      sku: 'AS-ORT-005',
      brand: 'AuraSole Wellness',
      shortDescription: 'Podiatrist-designed therapeutic slippers with medical-grade orthopedic arch alignment.',
      description: 'Alleviate plantar fasciitis, heel spurs, and knee pressure. OrthoRelief provides rigid biomedical arch support, a stabilizing heel cradle, and dual-layer shock absorption that redistributes body weight evenly.',
      categoryId: categories['men'].id,
      subcategoryId: subCategories['men-ortho'].id,
      gender: 'MEN',
      ageGroup: 'Adult',
      productType: 'Orthopedic Slippers',
      material: 'Biomechanical Cork & Microfiber',
      soleMaterial: 'Shock-Absorbing PU Outsole',
      upperMaterial: 'Adjustable Velcro Padded Strap',
      style: 'Orthopedic Health',
      occasion: 'Daily Wear / Joint Pain Relief',
      pattern: 'Solid Ergonomic',
      comfortFeatures: 'Medical arch support, heel cup stabilization, adjustable fit strap',
      careInstructions: 'Wipe clean with a damp cloth.',
      price: 1299,
      originalPrice: 2199,
      discountPercentage: 40,
      stock: 45,
      rating: 4.8,
      reviewCount: 165,
      isFeatured: true,
      isTrending: true,
      isNewArrival: false,
      isBestSeller: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop', isPrimary: true, sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=800&auto=format&fit=crop', isPrimary: false, sortOrder: 1 },
      ],
      variants: [
        { size: '7', colorName: 'Tan Brown', colorCode: '#D2B48C', stock: 10 },
        { size: '8', colorName: 'Tan Brown', colorCode: '#D2B48C', stock: 15 },
        { size: '9', colorName: 'Tan Brown', colorCode: '#D2B48C', stock: 12 },
        { size: '10', colorName: 'Matte Navy', colorCode: '#000080', stock: 8 },
      ],
    },
    {
      name: 'AeroLite Featherweight Thong Flip Flops',
      slug: 'aerolite-featherweight-thong-flip-flops',
      sku: 'AS-FLP-006',
      brand: 'AuraSole',
      shortDescription: 'Durable everyday flip flops with ultra-soft fabric toe post and anti-slip ribbed footbed.',
      description: 'Engineered for seamless daily errands and sunny beach days. AeroLite weighs just 110 grams per pair with an ergonomic curved sole and skin-friendly webbed fabric toe strap that eliminates blistering.',
      categoryId: categories['men'].id,
      subcategoryId: subCategories['men-flip-flops'].id,
      gender: 'MEN',
      ageGroup: 'Adult',
      productType: 'Flip Flops',
      material: 'Lightweight Rubberised EVA',
      soleMaterial: 'Flexi-Grip Ribbed Rubber',
      upperMaterial: 'Nylon Webbing Soft Thong',
      style: 'Casual Beach & Street',
      occasion: 'Casual / Outdoor / Beach',
      pattern: 'Dual-Tone Stripe',
      comfortFeatures: 'Zero-chafing toe post, ultra-lightweight, flexible sole',
      careInstructions: 'Rinse with water. Quick air dry.',
      price: 549,
      originalPrice: 999,
      discountPercentage: 45,
      stock: 90,
      rating: 4.6,
      reviewCount: 94,
      isFeatured: false,
      isTrending: true,
      isNewArrival: true,
      isBestSeller: false,
      images: [
        { url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800&auto=format&fit=crop', isPrimary: true, sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop', isPrimary: false, sortOrder: 1 },
      ],
      variants: [
        { size: '6', colorName: 'Navy Blue', colorCode: '#000080', stock: 20 },
        { size: '7', colorName: 'Navy Blue', colorCode: '#000080', stock: 25 },
        { size: '8', colorName: 'Navy Blue', colorCode: '#000080', stock: 25 },
        { size: '9', colorName: 'Olive Green', colorCode: '#556B2F', stock: 20 },
      ],
    },
    {
      name: 'BubbleStep Kids Anti-Skid Joy Slides',
      slug: 'bubblestep-kids-anti-skid-joy-slides',
      sku: 'AS-KID-007',
      brand: 'AuraSole Mini',
      shortDescription: 'Super-cushioned bubble-textured slides with convertible safety heel strap for kids.',
      description: 'Give little feet bouncy joy! The BubbleStep features a 3.5cm thick cushioned bubble footbed, rounded anti-collision toe bumpers, and a flexible heel pivot strap to keep the slides secure during active play.',
      categoryId: categories['kids'].id,
      subcategoryId: subCategories['kids-boys'].id,
      gender: 'KIDS',
      ageGroup: 'Kids',
      productType: 'Kids Slippers',
      material: '100% Skin-Safe Eco EVA',
      soleMaterial: 'Anti-Slip Grip Soles',
      upperMaterial: 'Molded Bubble Texture',
      style: 'Playful & Bouncy',
      occasion: 'Home / Play / Beach / School Break',
      pattern: '3D Bubble Texture',
      comfortFeatures: 'Anti-collision toe cap, convertible heel strap, ultra-cushioned sole',
      careInstructions: 'Easy wipe clean with damp cloth.',
      price: 599,
      originalPrice: 999,
      discountPercentage: 40,
      stock: 75,
      rating: 4.9,
      reviewCount: 118,
      isFeatured: true,
      isTrending: true,
      isNewArrival: true,
      isBestSeller: false,
      images: [
        { url: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=800&auto=format&fit=crop', isPrimary: true, sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop', isPrimary: false, sortOrder: 1 },
      ],
      variants: [
        { size: '5', colorName: 'Sunshine Yellow', colorCode: '#FFD700', stock: 25 },
        { size: '6', colorName: 'Sunshine Yellow', colorCode: '#FFD700', stock: 25 },
        { size: '5', colorName: 'Sky Blue', colorCode: '#87CEEB', stock: 25 },
      ],
    },
    {
      name: 'AuraChic Braided Double-Strap Comfort Slides',
      slug: 'aurachic-braided-double-strap-comfort-slides',
      sku: 'AS-CHC-008',
      brand: 'AuraSole Chic',
      shortDescription: 'Elegant woven dual-strap slides with pillowy cushioned insole for festive & casual styling.',
      description: 'Seamlessly blend trendsetting style with sublime comfort. Featuring chic faux-leather braided straps, a micro-suede padded footbed, and a lightweight flexible sole that looks gorgeous with both ethnic and western outfits.',
      categoryId: categories['women'].id,
      subcategoryId: subCategories['women-fashion'].id,
      gender: 'WOMEN',
      ageGroup: 'Adult',
      productType: 'Slides',
      material: 'Vegan Microfiber Leather',
      soleMaterial: 'Flexible TPR Rubber',
      upperMaterial: 'Hand-Braided Straps',
      style: 'Bohemian Chic',
      occasion: 'Casual / Brunch / Festive',
      pattern: 'Woven Braided',
      comfortFeatures: 'Dual padded straps, micro-suede sweat-resistant footbed',
      careInstructions: 'Spot clean with a damp microfiber cloth.',
      price: 999,
      originalPrice: 1799,
      discountPercentage: 44,
      stock: 50,
      rating: 4.8,
      reviewCount: 78,
      isFeatured: true,
      isTrending: true,
      isNewArrival: true,
      isBestSeller: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop', isPrimary: true, sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop', isPrimary: false, sortOrder: 1 },
      ],
      variants: [
        { size: '6', colorName: 'Champagne Gold', colorCode: '#D4AF37', stock: 15 },
        { size: '7', colorName: 'Champagne Gold', colorCode: '#D4AF37', stock: 20 },
        { size: '8', colorName: 'Champagne Gold', colorCode: '#D4AF37', stock: 15 },
      ],
    },
  ];

  for (const item of productsData) {
    const { images, variants, ...prodFields } = item;
    const product = await prisma.product.upsert({
      where: { slug: prodFields.slug },
      update: prodFields,
      create: prodFields,
    });

    // Delete and recreate images & variants for clean idempotent seeding
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    for (const img of images) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: img.url,
          isPrimary: img.isPrimary,
          sortOrder: img.sortOrder,
        },
      });
    }

    await prisma.productVariant.deleteMany({ where: { productId: product.id } });
    for (const variant of variants) {
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          size: variant.size,
          colorName: variant.colorName,
          colorCode: variant.colorCode,
          sku: `${prodFields.sku}-${variant.colorName.substring(0, 3).toUpperCase()}-${variant.size}`,
          stock: variant.stock,
          isActive: true,
        },
      });
    }

    // Add a verified sample review
    await prisma.review.deleteMany({ where: { productId: product.id } });
    await prisma.review.create({
      data: {
        productId: product.id,
        userId: customer.id,
        rating: 5,
        title: 'Unbelievable comfort from the first step!',
        comment: 'These are hands down the most comfortable slippers I have ever owned. The arch support and cushioning are exceptional.',
        isVerifiedPurchase: true,
        isApproved: true,
      },
    });
  }
  console.log('✅ Products, variants, images, and reviews seeded');

  // 6. Create Hero Banners
  const bannersData = [
    {
      title: 'Experience Pure Cloud Comfort',
      subtitle: 'Premium Ergonomic Slippers Engineered for All-Day Relief',
      tagline: 'Handcrafted Perfection & Modern Footwear Science',
      image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=1600&auto=format&fit=crop',
      mobileImage: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800&auto=format&fit=crop',
      link: '/shop',
      ctaText: 'Shop New Arrivals',
      badge: 'Summer 2026 Collection',
      displayOrder: 1,
      isActive: true,
    },
    {
      title: 'Orthopedic Support That Works',
      subtitle: 'Doctor-Engineered Arch Support & Shock Absorption Soles',
      tagline: 'Say Goodbye to Heel Pain & Plantar Fasciitis',
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1600&auto=format&fit=crop',
      mobileImage: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop',
      link: '/shop?category=unisex',
      ctaText: 'Explore Wellness Range',
      badge: 'Medical Grade',
      displayOrder: 2,
      isActive: true,
    },
  ];

  await prisma.banner.deleteMany({});
  for (const banner of bannersData) {
    await prisma.banner.create({ data: banner });
  }
  console.log('✅ Hero banners seeded');

  // 7. Create Coupons
  await prisma.coupon.upsert({
    where: { code: 'COMFORT15' },
    update: {},
    create: {
      code: 'COMFORT15',
      description: '15% instant discount on all orders above ₹999',
      discountType: 'PERCENTAGE',
      discountValue: 15,
      minOrderAmount: 999,
      maxDiscount: 500,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  console.log('🎉 Slipper Haven database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
