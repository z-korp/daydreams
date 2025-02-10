export const searchResultsPrompt = `
Given the following results from a SERP search for the query, generate a list of learnings from the results. 
Return a maximum of 5 learnings, but feel free to return less if the results are clear. 
Make sure each learning is unique and not similar to each other. 
The learnings should be concise and to the point, as detailed and information dense as possible. 
Make sure to include any entities like people, places, companies, products, things, etc in the learnings, as well as any exact metrics, numbers, or dates. 
The learnings will be used to research the topic further.
Given the following query and results from the research, create some follow up queries to clarify the research direction. 
Return a maximum of 2 queries, but feel free to return less if the original query is clearer
`;

export const finalReportPrompt = `
Given the following research, write a final report on the topic using the learnings from research. 
Make it as detailed as possible, aim for 3 or more pages, include ALL the learnings from research.
Here is all the data from research:
<research>{{research}}</research>

Return your report in markdown format. Always send the full report, do not cut it off.
`; 