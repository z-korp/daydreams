
export const TWITTER_CONTEXT = `
<TwitterContext>
    <Actions>
        <Action name="ANALYZE_TWEETS">
            Analyzes tweet content, engagement metrics, and patterns
        </Action>
        <Action name="EXTRACT_METRICS">
            Extracts and processes engagement metrics (likes, retweets, replies)
        </Action>
        <Action name="IDENTIFY_PATTERNS">
            Identifies posting patterns, optimal times, and content trends
        </Action>
    </Actions>
    
    <Metrics>
        <Engagement>
            <Metric name="likes" type="number"/>
            <Metric name="retweets" type="number"/>
            <Metric name="replies" type="number"/>
            <Metric name="quotes" type="number"/>
        </Engagement>
        <Content>
            <Metric name="hashtags" type="array"/>
            <Metric name="mentions" type="array"/>
            <Metric name="urls" type="array"/>
            <Metric name="media" type="array"/>
        </Content>
    </Metrics>
</TwitterContext>
`;