import { firebase } from '@react-native-firebase/database';
import { HN_API_ITEM_TYPE, HN_ITEM_TYPE } from './definitions';

/**
 * fetch function is lower level function that fetches data from firebase database 
 * fetchItemsByIds function is higher level function that fetches multiple items by their ids (used by fetchItemsByIdsQuery)
 * fetchItemsByIdsQuery is a query function that is used by react-query to fetch multiple items by their ids
*/

const HN_Firebase_URL = 'https://hacker-news.firebaseio.com'; 
const HN_API_Version = 'v0';

firebase.initializeApp({
  databaseURL: HN_Firebase_URL,
  authDomain: 'hacker-news.firebaseio.com',
  projectId: 'hacker-news',
  appId: '1:0:web:0'
});

export const HackerNewsDatabaseRef = firebase
.app()  
.database(HN_Firebase_URL);

export async function fetch(itemType: HN_API_ITEM_TYPE, itemId?: number) {
  const refString = `${HN_API_Version}/${itemType}${itemId ? '/'+itemId : ''}`;
  const response = (await HackerNewsDatabaseRef.ref(refString).once('value')).val();
  return response;
}

export async function fetchItemsByIds(indexArray: number[], lastLoadedIndex?: number, threshold?: number): Promise<HN_ITEM_TYPE[]> {
  const startIndex = lastLoadedIndex && threshold ? lastLoadedIndex - threshold : 0;
  const endIndex = lastLoadedIndex || indexArray.length;
  const newStories: HN_ITEM_TYPE[] = await Promise.all(
    indexArray.slice(startIndex, endIndex).map(fetch.bind(null, 'item'))
  ) as HN_ITEM_TYPE[];
  return newStories;
}

export async function fetchItemsByIdsQuery(indexArray: number[], lastLoadedIndex?: number, threshold?: number){
  return fetchItemsByIds(indexArray, lastLoadedIndex, threshold);
}
