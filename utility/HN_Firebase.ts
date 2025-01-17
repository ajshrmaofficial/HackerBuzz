import { firebase } from '@react-native-firebase/database';
import { HN_API_ITEM_TYPE, HN_ITEM_TYPE } from './definitions';

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

export async function fetchItemsByIds(indexArray: number[], lastLoadedIndex: number, threshold: number): Promise<HN_ITEM_TYPE[]> {
  const newStories: HN_ITEM_TYPE[] = await Promise.all(
    indexArray.slice(lastLoadedIndex - threshold, lastLoadedIndex).map(fetch.bind(null, 'item'))
  ) as HN_ITEM_TYPE[];
  return newStories;
}

export async function fetchItemsByIdsQuery(queryKey: [string, number[], number, number]) {
  const [, indexArray, lastLoadedIndex, threshold] = queryKey;
  return fetchItemsByIds(indexArray, lastLoadedIndex, threshold);
}

interface CommentTreeNode {
  id: number;
  by: string;
  text?: string;
  time: number;
  type: "comment";
  children: CommentTreeNode[];
  dead?: boolean;
  deleted?: boolean;
}

export class CommentLoader {
  private loadedComments: Map<number, HN_ITEM_TYPE>;

  constructor() {
    this.loadedComments = new Map();
  }

  // async loadAllCommentsBFS(parentId: number): Promise<HN_ITEM_TYPE[]> {
  //   const queue: number[] = [parentId];
  //   const allComments: HN_ITEM_TYPE[] = [];
  //   const seenIds = new Set<number>();
    
  //   while (queue.length > 0) {
  //     const batchSize = 10;
  //     const currentBatch = queue.splice(0, batchSize);
      
  //     const commentPromises = currentBatch.map(id => {
  //       if (this.loadedComments.has(id)) {
  //         return Promise.resolve(this.loadedComments.get(id)!);
  //       }
  //       return fetch('item', id);
  //     });

  //     const comments = await Promise.all(commentPromises);

  //     for (const comment of comments) {
  //       if (!comment || comment.deleted || comment.dead) continue;
        
  //       if (!seenIds.has(comment.id)) {
  //         seenIds.add(comment.id);
  //         this.loadedComments.set(comment.id, comment);
  //         allComments.push(comment);

  //         if (comment.kids?.length) {
  //           queue.push(...comment.kids.filter(kid => !seenIds.has(kid)));
  //         }
  //       }
  //     }

  //     await new Promise(resolve => setTimeout(resolve, 100));
  //   }

  //   return allComments;
  // }

  async loadAllCommentsBFS(parentId: number): Promise<HN_ITEM_TYPE[]> {
    const queue: number[] = [parentId];
    const allComments: HN_ITEM_TYPE[] = [];
    const seenIds = new Set<number>();
    const batchSize = 20;  // Test with different sizes for optimal performance
  
    while (queue.length > 0) {
      const currentBatch = queue.splice(0, batchSize);
      
      // Fetching comments in parallel with caching check
      const commentPromises = currentBatch.map(id => {
        if (this.loadedComments.has(id)) {
          return Promise.resolve(this.loadedComments.get(id)!);
        }
        return fetch('item', id);
      });
  
      const comments = await Promise.all(commentPromises);
  
      for (const comment of comments) {
        if (!comment || comment.deleted || comment.dead) continue;
  
        if (!seenIds.has(comment.id)) {
          seenIds.add(comment.id);
          this.loadedComments.set(comment.id, comment);
          allComments.push(comment);
  
          if (comment.kids?.length) {
            queue.push(...comment.kids.filter((kid: number) => !seenIds.has(kid)));
          }
        }
      }
  
      await new Promise(resolve => setTimeout(resolve, 50)); // Shorten delay for responsiveness
    }
  
    return allComments;
  }
  

  async getFormattedCommentTree(parentId: number): Promise<CommentTreeNode | null> {
    const comments = await this.loadAllCommentsBFS(parentId);
    return this.buildCommentTree(comments, parentId);
  }

  private buildCommentTree(comments: HN_ITEM_TYPE[], parentId: number): CommentTreeNode | null {
    const commentMap = new Map(comments.map(c => [c.id, c]));
    const rootComment = commentMap.get(parentId);
    
    if (!rootComment) return null;

    const buildTree = (comment: HN_ITEM_TYPE): CommentTreeNode => ({
      id: comment.id,
      by: comment.by,
      text: comment.text,
      time: comment.time,
      type: "comment",
      dead: comment.dead,
      deleted: comment.deleted,
      children: comment.kids
        ? comment.kids
            .map(kidId => commentMap.get(kidId))
            .filter((kid): kid is HN_ITEM_TYPE => 
              kid !== undefined && 
              !kid.deleted && 
              !kid.dead && 
              kid.type === 'comment'
            )
            .map(buildTree)
        : []
    });

    return buildTree(rootComment);
  }
}
