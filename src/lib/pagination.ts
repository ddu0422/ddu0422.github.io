export const PAGE_SIZE=10;
export function paginate<T>(items:readonly T[],requestedPage:number){
 const totalPages=Math.max(1,Math.ceil(items.length/PAGE_SIZE));
 const page=Math.min(Math.max(1,Math.floor(requestedPage)),totalPages);
 const offset=(page-1)*PAGE_SIZE;
 const firstNumber=Math.max(1,Math.min(page-2,totalPages-4));
 return {items:items.slice(offset,offset+PAGE_SIZE),page,totalPages,start:items.length?offset+1:0,end:Math.min(offset+PAGE_SIZE,items.length),numbers:Array.from({length:Math.min(5,totalPages)},(_,i)=>firstNumber+i)};
}
