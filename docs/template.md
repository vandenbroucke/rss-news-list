# RSS-news-list (Open Data)
A carefully curated list of news sources that provide [RSS](https://en.wikipedia.org/wiki/RSS) news feeds.

> Currently the list contains **{URL_count}** feed URLs from **{source_count}** distinct news sources in **{country_count}** countries, and **you can help** to add even more!

**Contents:** [Data URLs](#data-urls) · [Data properties](#data-properties) · [Contribute](#contribute) · [News list](#news-list)

## Data URLs
Download the full list in your preferred format, straight from your browser or any other project:

| Format | URL |
|--------|-----|
| JSON | [news_list.json](https://raw.githubusercontent.com/vandenbroucke/rss-news-list/master/data/news_list.json) |
| XML | [news_list.xml](https://raw.githubusercontent.com/vandenbroucke/rss-news-list/master/data/news_list.xml) |
| CSV | [news_list.csv](https://raw.githubusercontent.com/vandenbroucke/rss-news-list/master/data/news_list.csv) |
| YML | [news_list.yml](https://raw.githubusercontent.com/vandenbroucke/rss-news-list/master/data/news_list.yml) |

## Data properties
Every entry in the list has the following properties:

| Property | Description | Example |
|----------|-------------|---------|
| `URL` | URL of the RSS feed | `http://feeds.bbci.co.uk/news/rss.xml` |
| `src_name_short` | Short name of the source (if available, otherwise same as long) | `BBC` |
| `src_name_long` | Long name of the source | `British Broadcasting Corporation` |
| `name` | Name of the RSS feed | `Top Stories` |
| `src_country` | [ISO 3166-1 alpha-3](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3) country code | `GBR` |

## Contribute
Contributions (adding, updating & deleting news sources) are welcome as pull requests.

- Only pull requests that change `data/root.json` will be considered.
- Please state where your information comes from, so it can be validated.

Thank you!

## News list
Feeds are grouped by country, then by source. Click a source to expand its feeds.

| Country | Sources | Feeds |
|---------|--------:|------:|
{country_overview}

{news_list}
