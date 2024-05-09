import axios from 'axios';

export async function fetchPopularTags(tag) {
  try {
    const response = await axios.get(`https://gunplamanagementsystemapi.azurewebsites.net/api/kits/top-by-tag/${tag}`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch popular tags');
  }
}