import { contentfulAPI } from "./contentful";

interface Asset {
  sys: {
    id: string;
  };
  fields: {
    file: {
      url: string;
    };
  };
}

interface ContentfulResponse {
  data: {
    items: {
      fields: Record<string, { sys: { id: string } }[]>;
    }[];
    includes: {
      Asset: Asset[];
    };
  };
}

/**
 * Fetches images from Contentful CMS for a specific field.
 * @param fieldName - The field name in Contentful (e.g., "commerceCatalystCarousel", "commerceCatalystSalesBanner").
 * @returns A promise that resolves to an array of image URLs.
 */
export const getContentfulImages = async (
  fieldName: string,
): Promise<string[]> => {
  try {
    const response: ContentfulResponse = await contentfulAPI.get(
      "?content_type=commerceCatalyst",
    );
    const items = response.data.items[0]?.fields[fieldName] || [];
    const assets = response.data.includes.Asset;

    // Map asset IDs to URLs
    const images = items
      .map((item) => {
        const asset = assets.find((asset) => asset.sys.id === item.sys.id);
        return asset ? `https:${asset.fields.file.url}` : null;
      })
      .filter((image): image is string => image !== null);
    return images;
  } catch (error) {
    console.error(`Error fetching ${fieldName} images:`, error);
    return [];
  }
};
