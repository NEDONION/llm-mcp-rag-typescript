You are a tool agent. Your task is:

1. Visit: https://news.ycombinator.com/
2. Extract all news titles and their links from the homepage
3. For the first 10 links, fetch the actual article content
4. For each article, generate a short summary (≤ 200 words), perform sentiment analysis (Positive / Neutral / Negative), and assign a topic category (e.g., AI, Security, Open Source, Business, Finance, etc.)
5. Output the results in CSV format with the following headers:

Title,Link,Summary,Sentiment,Category

6. Escape any commas or line breaks inside values using double quotes.
7. Save the final result to: output/digested-news.csv
8. Create the output directory if it does not exist

Goal: Successfully generate output/digested-news.csv with structured, meaningful, intelligent summaries.
