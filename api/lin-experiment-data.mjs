import { LIN_ARTICLES_1 } from '../article-data/lin-experiment-1.mjs';
import { LIN_ARTICLES_2 } from '../article-data/lin-experiment-2.mjs';
import { LIN_ARTICLES_3 } from '../article-data/lin-experiment-3.mjs';
import { LIN_ARTICLES_4 } from '../article-data/lin-experiment-4.mjs';
export { LIN_GROUPS, LIN_SOURCES } from '../article-data/lin-experiment-common.mjs';

export const LIN_ARTICLES = [...LIN_ARTICLES_1, ...LIN_ARTICLES_2, ...LIN_ARTICLES_3, ...LIN_ARTICLES_4];
export const LIN_ARTICLE_MAP = new Map(LIN_ARTICLES.map((article) => [article.slug, article]));