export type OfficialNotice = {
  title: string;
  author: string;
  href: string;
  publishedAt: string;
};
 
export const officialSchoolBoards = {
  notices: {
    label: "공지사항",
    listUrl: "https://dukyoung-h.goeyi.kr/dukyoung-h/na/ntt/selectNttList.do?bbsId=7456&mi=13093",
    rssUrl: "https://dukyoung-h.goeyi.kr/dukyoung-h/na/ntt/selectRssFeed.do?mi=13093&bbsId=7456",
  },
  letters: {
    label: "가정통신문",
    listUrl: "https://dukyoung-h.goeyi.kr/dukyoung-h/na/ntt/selectNttList.do?bbsId=7466&mi=13110",
    rssUrl: "https://dukyoung-h.goeyi.kr/dukyoung-h/na/ntt/selectRssFeed.do?mi=13110&bbsId=7466",
  },
  stories: {
    label: "학교소식",
    listUrl: "https://dukyoung-h.goeyi.kr/dukyoung-h/na/ntt/selectNttList.do?bbsId=7460&mi=13099",
    rssUrl: "https://dukyoung-h.goeyi.kr/dukyoung-h/na/ntt/selectRssFeed.do?mi=13099&bbsId=7460",
  },
} as const;

export type OfficialBoardKey = keyof typeof officialSchoolBoards;

export const OFFICIAL_NOTICE_LIST_URL = officialSchoolBoards.notices.listUrl;
export const OFFICIAL_NOTICE_RSS_URL = officialSchoolBoards.notices.rssUrl;

const OFFICIAL_ORIGIN = "https://dukyoung-h.goeyi.kr";

function readXmlText(value: string) {
  return value
    .replace(/^\s*<!\[CDATA\[/, "")
    .replace(/\]\]>\s*$/, "")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal: string) => String.fromCodePoint(Number.parseInt(decimal, 10)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}

function readTag(block: string, tag: string) {
  const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? readXmlText(match[1]) : "";
}

function normalizeNoticeUrl(rawHref: string) {
  const url = new URL(rawHref.replace(/^\/+/, ""), `${OFFICIAL_ORIGIN}/`);
  if (url.origin !== OFFICIAL_ORIGIN || !url.pathname.startsWith("/dukyoung-h/na/ntt/selectNttInfo.do")) {
    throw new Error("Unexpected official notice URL");
  }
  return url.toString();
}

export function parseOfficialNoticeRss(xml: string, limit = 20): OfficialNotice[] {
  if (!/<rss\b/i.test(xml) || !/<channel>/i.test(xml)) {
    throw new Error("Invalid official RSS response");
  }

  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];
  const notices: OfficialNotice[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    const title = readTag(item[1], "title").replace(/\s+/g, " ").trim();
    const author = readTag(item[1], "author").replace(/\s+/g, " ").trim();
    const publishedAt = readTag(item[1], "pubDate");
    const rawHref = readTag(item[1], "link");
    if (!title || !rawHref) continue;

    const href = normalizeNoticeUrl(rawHref);
    if (seen.has(href)) continue;
    seen.add(href);
    notices.push({ title, author, href, publishedAt });
    if (notices.length >= limit) break;
  }

  if (!notices.length) throw new Error("Official RSS has no notices");
  return notices;
}
