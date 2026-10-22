export function postTimestamp(value:string){return Date.parse(value.length===10?`${value}T00:00:00+09:00`:value)}
export function formatPostDate(value:string){return new Intl.DateTimeFormat('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'Asia/Seoul'}).format(new Date(postTimestamp(value)));}
