import meiliClient from '../../utils/meilisearch';

const getAllItems = async (searchTerm?: string) => {
  const index = meiliClient?.index('items');

  if (!index) {
    throw new Error('MeiliSearch client or index not found');
  }

  const searchString = searchTerm || '';

  try {
    const result = await index.search(searchString);
    return result.hits;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error searching MeiliSearch:', error);
    throw error;
  }
};

export const MeilisearchServices = {
  getAllItems,
};
