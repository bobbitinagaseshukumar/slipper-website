const prisma = require('../config/db');

/**
 * Advanced Multi-attribute Slipper Query & Discovery
 */
const getProducts = async (queryParams = {}) => {
  const {
    page = 1,
    limit = 24,
    q,
    category,
    subcategory,
    gender,
    size,
    color,
    minPrice,
    maxPrice,
    rating,
    minDiscount,
    material,
    occasion,
    productType,
    inStockOnly,
    sort = 'recommended',
    featured,
    trending,
    newArrival,
    bestSeller,
  } = queryParams;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 24));
  const skip = (pageNum - 1) * limitNum;

  // Base filter: Only active public products
  const where = {
    isActive: true,
  };

  // Search keyword across name, description, brand, comfort features, product type
  if (q && q.trim()) {
    const searchTerms = q.trim().split(/\s+/);
    where.AND = searchTerms.map((term) => ({
      OR: [
        { name: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { brand: { contains: term, mode: 'insensitive' } },
        { productType: { contains: term, mode: 'insensitive' } },
        { material: { contains: term, mode: 'insensitive' } },
        { comfortFeatures: { contains: term, mode: 'insensitive' } },
        { occasion: { contains: term, mode: 'insensitive' } },
      ],
    }));
  }

  // Category filter by slug or ID
  if (category) {
    where.category = {
      OR: [
        { slug: { equals: category.toLowerCase(), mode: 'insensitive' } },
        { id: category },
      ],
    };
  }

  // Subcategory filter
  if (subcategory) {
    where.subcategory = {
      OR: [
        { slug: { equals: subcategory.toLowerCase(), mode: 'insensitive' } },
        { id: subcategory },
      ],
    };
  }

  // Brand filter (by brandId, brand name, or brand slug)
  if (brand) {
    const brands = Array.isArray(brand) ? brand : brand.split(',');
    where.OR = (where.OR || []).concat(
      brands.map((b) => ({
        OR: [
          { brandId: b.trim() },
          { brand: { equals: b.trim(), mode: 'insensitive' } },
          { brandRel: { slug: { equals: b.trim().toLowerCase(), mode: 'insensitive' } } },
        ],
      }))
    );
  }

  // Branding Type filter
  if (brandingType) {
    where.brandingType = { contains: brandingType.trim(), mode: 'insensitive' };
  }

  // Gender filter (MEN, WOMEN, KIDS, UNISEX)
  if (gender) {
    const genderArray = Array.isArray(gender) ? gender : gender.split(',');
    const upperGenders = genderArray.map((g) => g.trim().toUpperCase());
    where.gender = { in: upperGenders };
  }

  // Material filter
  if (material) {
    const materials = Array.isArray(material) ? material : material.split(',');
    where.OR = (where.OR || []).concat(
      materials.map((m) => ({ material: { contains: m.trim(), mode: 'insensitive' } }))
    );
  }

  // Occasion / Style filter
  if (occasion) {
    const occasions = Array.isArray(occasion) ? occasion : occasion.split(',');
    where.OR = (where.OR || []).concat(
      occasions.map((o) => ({ occasion: { contains: o.trim(), mode: 'insensitive' } }))
    );
  }

  // Product Type filter (e.g. Slides, Flip Flops, Home Slippers, Orthopedic)
  if (productType) {
    const types = Array.isArray(productType) ? productType : productType.split(',');
    where.OR = (where.OR || []).concat(
      types.map((t) => ({ productType: { contains: t.trim(), mode: 'insensitive' } }))
    );
  }

  // Price range filter
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice && !isNaN(minPrice)) where.price.gte = parseFloat(minPrice);
    if (maxPrice && !isNaN(maxPrice)) where.price.lte = parseFloat(maxPrice);
  }

  // Rating filter
  if (rating && !isNaN(rating)) {
    where.rating = { gte: parseFloat(rating) };
  }

  // Minimum Discount percentage filter
  if (minDiscount && !isNaN(minDiscount)) {
    where.discountPercentage = { gte: parseFloat(minDiscount) };
  }

  // In-stock availability
  if (inStockOnly === 'true' || inStockOnly === true) {
    where.stock = { gt: 0 };
  }

  // Status flags
  if (featured === 'true' || featured === true) where.isFeatured = true;
  if (trending === 'true' || trending === true) where.isTrending = true;
  if (newArrival === 'true' || newArrival === true) where.isNewArrival = true;
  if (bestSeller === 'true' || bestSeller === true) where.isBestSeller = true;

  // Variants filter (Size & Color)
  if (size || color) {
    const variantWhere = { isActive: true };
    if (size) {
      const sizes = Array.isArray(size) ? size : size.split(',').map((s) => s.trim());
      variantWhere.size = { in: sizes };
    }
    if (color) {
      const colors = Array.isArray(color) ? color : color.split(',').map((c) => c.trim());
      variantWhere.OR = colors.map((c) => ({
        colorName: { contains: c, mode: 'insensitive' },
      }));
    }
    where.variants = { some: variantWhere };
  }

  // Sorting
  let orderBy = [];
  switch (sort) {
    case 'price-low':
      orderBy = [{ price: 'asc' }];
      break;
    case 'price-high':
      orderBy = [{ price: 'desc' }];
      break;
    case 'newest':
      orderBy = [{ createdAt: 'desc' }];
      break;
    case 'rating':
      orderBy = [{ rating: 'desc' }, { reviewCount: 'desc' }];
      break;
    case 'popular':
    case 'bestselling':
      orderBy = [{ reviewCount: 'desc' }, { rating: 'desc' }];
      break;
    case 'discount':
      orderBy = [{ discountPercentage: 'desc' }];
      break;
    case 'recommended':
    default:
      orderBy = [
        { isFeatured: 'desc' },
        { isBestSeller: 'desc' },
        { isTrending: 'desc' },
        { rating: 'desc' },
        { createdAt: 'desc' },
      ];
      break;
  }

  // Execute database queries in parallel
  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limitNum,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        subcategory: { select: { id: true, name: true, slug: true } },
        brandRel: { select: { id: true, name: true, slug: true, image: true, brandingType: true } },
        images: {
          select: { id: true, url: true, altText: true, colorName: true, isPrimary: true, sortOrder: true },
          orderBy: { sortOrder: 'asc' },
        },
        variants: {
          where: { isActive: true },
          select: { id: true, size: true, colorName: true, colorCode: true, stock: true, priceOverride: true },
        },
      },
    }),
  ]);

  return {
    products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      hasMore: pageNum * limitNum < total,
    },
  };
};

/**
 * Get Single Product by Slug with full details
 */
const getProductBySlug = async (slug) => {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      subcategory: { select: { id: true, name: true, slug: true } },
      brandRel: { select: { id: true, name: true, slug: true, image: true, brandingType: true } },
      images: {
        select: { id: true, url: true, altText: true, colorName: true, isPrimary: true, sortOrder: true },
        orderBy: { sortOrder: 'asc' },
      },
      variants: {
        where: { isActive: true },
        select: { id: true, size: true, colorName: true, colorCode: true, sku: true, stock: true, priceOverride: true, image: true },
        orderBy: [{ size: 'asc' }, { colorName: 'asc' }],
      },
      reviews: {
        where: { isApproved: true },
        select: {
          id: true,
          rating: true,
          title: true,
          comment: true,
          isVerifiedPurchase: true,
          createdAt: true,
          user: { select: { id: true, name: true, profileImage: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!product || !product.isActive) {
    const error = new Error('Product not found.');
    error.statusCode = 404;
    throw error;
  }

  // Fetch related collections in parallel
  const [relatedProducts, brandProducts, similarProducts] = await Promise.all([
    // 1. You May Also Like (same category or gender)
    prisma.product.findMany({
      where: {
        isActive: true,
        id: { not: product.id },
        OR: [
          { categoryId: product.categoryId },
          { gender: product.gender },
        ],
      },
      take: 4,
      orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }],
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: {
          select: { id: true, url: true, altText: true, isPrimary: true },
          take: 2,
        },
        variants: {
          where: { isActive: true },
          select: { size: true, colorName: true, colorCode: true },
        },
      },
    }),

    // 2. More From This Brand
    product.brand || product.brandId
      ? prisma.product.findMany({
          where: {
            isActive: true,
            id: { not: product.id },
            OR: [
              ...(product.brandId ? [{ brandId: product.brandId }] : []),
              ...(product.brand ? [{ brand: { equals: product.brand, mode: 'insensitive' } }] : []),
            ],
          },
          take: 4,
          orderBy: [{ createdAt: 'desc' }],
          include: {
            category: { select: { id: true, name: true, slug: true } },
            images: {
              select: { id: true, url: true, altText: true, isPrimary: true },
              take: 2,
            },
          },
        })
      : Promise.resolve([]),

    // 3. Similar Comfort / Product Type Slippers
    product.productType || product.subcategoryId
      ? prisma.product.findMany({
          where: {
            isActive: true,
            id: { not: product.id },
            OR: [
              ...(product.subcategoryId ? [{ subcategoryId: product.subcategoryId }] : []),
              ...(product.productType ? [{ productType: { equals: product.productType, mode: 'insensitive' } }] : []),
            ],
          },
          take: 4,
          orderBy: [{ rating: 'desc' }],
          include: {
            category: { select: { id: true, name: true, slug: true } },
            images: {
              select: { id: true, url: true, altText: true, isPrimary: true },
              take: 2,
            },
          },
        })
      : Promise.resolve([]),
  ]);

  return {
    ...product,
    relatedProducts,
    brandProducts,
    similarProducts,
  };
};

/**
 * Autocomplete / Suggestions for live search
 */
const getSuggestions = async (query) => {
  if (!query || query.trim().length < 2) {
    return { products: [], categories: [], popularSearches: [] };
  }

  const term = query.trim();

  const [products, categories, subcategories, brands] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { productType: { contains: term, mode: 'insensitive' } },
          { material: { contains: term, mode: 'insensitive' } },
          { brand: { contains: term, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        brand: true,
        price: true,
        originalPrice: true,
        discountPercentage: true,
        rating: true,
        images: {
          where: { isPrimary: true },
          select: { url: true },
          take: 1,
        },
      },
      take: 6,
    }),
    prisma.category.findMany({
      where: {
        isActive: true,
        status: 'PUBLISHED',
        name: { contains: term, mode: 'insensitive' },
      },
      select: { id: true, name: true, slug: true, image: true },
      take: 4,
    }),
    prisma.subCategory.findMany({
      where: {
        isActive: true,
        status: 'PUBLISHED',
        name: { contains: term, mode: 'insensitive' },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        category: { select: { name: true, slug: true } },
      },
      take: 4,
    }),
    prisma.brand.findMany({
      where: {
        isActive: true,
        status: 'PUBLISHED',
        showInSearch: true,
        name: { contains: term, mode: 'insensitive' },
      },
      select: { id: true, name: true, slug: true, image: true, brandingType: true },
      take: 4,
    }),
  ]);

  return {
    products,
    categories,
    subcategories,
    brands,
    keywords: [
      `${term} slides`,
      `${term} comfort slippers`,
      `men's ${term}`,
      `women's ${term}`,
    ],
  };
};

/**
 * Get Dynamic Filter Options metadata
 */
const getFilterOptions = async () => {
  const [categories, brands, variants, materials, maxProductPrice, minProductPrice] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true, status: 'PUBLISHED' },
      select: {
        id: true,
        name: true,
        slug: true,
        subCategories: {
          where: { isActive: true, status: 'PUBLISHED' },
          select: { id: true, name: true, slug: true },
          orderBy: { displayOrder: 'asc' },
        },
        _count: { select: { products: { where: { isActive: true, status: 'PUBLISHED' } } } },
      },
      orderBy: { displayOrder: 'asc' },
    }),
    prisma.brand.findMany({
      where: { isActive: true, status: 'PUBLISHED', showInFilter: true },
      select: {
        id: true,
        name: true,
        slug: true,
        brandingType: true,
        image: true,
        _count: { select: { products: { where: { isActive: true, status: 'PUBLISHED' } } } },
      },
      orderBy: { displayOrder: 'asc' },
    }),
    prisma.productVariant.findMany({
      where: { isActive: true, product: { isActive: true } },
      select: { size: true, colorName: true, colorCode: true },
      distinct: ['size', 'colorName'],
    }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { material: true, occasion: true, productType: true },
      distinct: ['material', 'occasion', 'productType'],
    }),
    prisma.product.findFirst({
      where: { isActive: true },
      orderBy: { price: 'desc' },
      select: { price: true },
    }),
    prisma.product.findFirst({
      where: { isActive: true },
      orderBy: { price: 'asc' },
      select: { price: true },
    }),
  ]);

  // Extract unique sizes sorted numerically
  const sizeSet = new Set();
  const colorMap = new Map();

  variants.forEach((v) => {
    if (v.size) sizeSet.add(v.size);
    if (v.colorName && !colorMap.has(v.colorName)) {
      colorMap.set(v.colorName, v.colorCode || '#1A1A1A');
    }
  });

  const sizes = Array.from(sizeSet).sort((a, b) => (parseFloat(a) || 0) - (parseFloat(b) || 0));
  const colors = Array.from(colorMap.entries()).map(([name, code]) => ({ name, code }));

  const uniqueMaterials = Array.from(
    new Set(materials.map((m) => m.material).filter(Boolean))
  );
  const uniqueOccasions = Array.from(
    new Set(materials.map((m) => m.occasion).filter(Boolean))
  );
  const uniqueTypes = Array.from(
    new Set(materials.map((m) => m.productType).filter(Boolean))
  );

  return {
    categories,
    brands,
    sizes,
    colors,
    genders: ['MEN', 'WOMEN', 'KIDS', 'UNISEX'],
    brandingTypes: ['Normal Branding', 'Company Branding'],
    materials: uniqueMaterials,
    occasions: uniqueOccasions,
    productTypes: uniqueTypes,
    priceRange: {
      min: minProductPrice?.price || 0,
      max: maxProductPrice?.price || 3000,
    },
  };
};

/**
 * Record Product View (LIFO, updates timestamp and keeps clean state)
 */
const recordProductView = async (productId, userId, ipAddress) => {
  if (!productId) return null;

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, isActive: true },
    });
    if (!product || !product.isActive) return null;

    if (userId) {
      // Remove previous view records for this user and product to prevent duplicate items
      await prisma.productView.deleteMany({
        where: { userId, productId },
      });

      return await prisma.productView.create({
        data: {
          productId,
          userId,
          ipAddress: ipAddress || null,
        },
      });
    } else if (ipAddress) {
      return await prisma.productView.create({
        data: {
          productId,
          ipAddress,
        },
      });
    }
  } catch (err) {
    console.error('Failed to record product view:', err.message);
  }
  return null;
};

/**
 * Get Recently Viewed Products for authenticated User
 */
const getRecentlyViewed = async (userId) => {
  if (!userId) return [];

  try {
    const views = await prisma.productView.findMany({
      where: {
        userId,
        product: { isActive: true },
      },
      orderBy: { viewedAt: 'desc' },
      distinct: ['productId'],
      take: 12,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            originalPrice: true,
            discountPercentage: true,
            rating: true,
            reviewCount: true,
            stock: true,
            brand: true,
            category: { select: { id: true, name: true, slug: true } },
            images: {
              where: { isPrimary: true },
              select: { url: true, altText: true },
              take: 1,
            },
          },
        },
      },
    });

    return views.map((v) => ({
      ...v.product,
      viewedAt: v.viewedAt,
    }));
  } catch (err) {
    console.error('Failed to load recently viewed products:', err.message);
    return [];
  }
};

module.exports = {
  getProducts,
  getProductBySlug,
  getSuggestions,
  getFilterOptions,
  recordProductView,
  getRecentlyViewed,
};
