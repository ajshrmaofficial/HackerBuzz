import axios from "axios"
import { HN_ITEM_TYPE } from "./definitions";
import { HackerNewsDatabaseRef } from "./HN_Firebase";

const HackerNews_BASE_URL = 'https://hacker-news.firebaseio.com/'

const axiosClient = axios.create({
    baseURL: HackerNews_BASE_URL,
})

// export async function fetchBestStoryIds(){
//     const response = await axiosClient.get('/v0/beststories.json');
//     if(response.status === 200){
//         return response.data;
//     }
// }

// export async function fetchItemById(id: number){
//     const response = await axiosClient.get(`/v0/item/${id}.json`);
//     if(response.status === 200){
//         return response.data;
//     }
// }

// export const fetchItemsByIds = async (indexArray: number[], lastLoadedIndex: number, threshold: number) => {
//     const newStories = await Promise.all(
//         indexArray.slice(lastLoadedIndex - threshold, lastLoadedIndex).map(fetchItemById)
//     );
//     return newStories;
// }

// export async function fetchBestStoryIds(){
//     const response = await HackerNewsDatabaseRef.ref('v0/beststories').once('value');
// }