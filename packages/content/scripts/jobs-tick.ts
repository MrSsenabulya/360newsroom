import { runUtilityJobsTick } from '../src/jobs';

const results = await runUtilityJobsTick(null);
console.log(JSON.stringify(results, null, 2));
