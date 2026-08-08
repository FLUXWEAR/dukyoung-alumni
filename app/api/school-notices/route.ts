import {
  type OfficialBoardKey,
  type OfficialNotice,
  officialSchoolBoards,
  parseOfficialNoticeRss,
} from "../../../lib/dukyoung-notices";

type LastSuccessfulFeed = {
  notices: OfficialNotice[];
  fetchedAt: string;
};

const lastSuccessfulFeeds: Partial<Record<OfficialBoardKey, LastSuccessfulFeed>> = {};

const responseHeaders = {
  "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
  "Content-Type": "application/json; charset=utf-8",
};

function isBoardKey(value: string): value is OfficialBoardKey {
  return Object.prototype.hasOwnProperty.call(officialSchoolBoards, value);
}

export async function GET(request: Request) {
  const requestedBoard = new URL(request.url).searchParams.get("board") ?? "notices";
  const boardKey: OfficialBoardKey = isBoardKey(requestedBoard) ? requestedBoard : "notices";
  const board = officialSchoolBoards[boardKey];

  try {
    const response = await fetch(board.rssUrl, {
      headers: { Accept: "application/rss+xml, application/xml, text/xml" },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });

    if (!response.ok) throw new Error(`Official RSS returned ${response.status}`);
    const contentType = response.headers.get("content-type") ?? "";
    if (!/xml/i.test(contentType)) throw new Error("Official RSS did not return XML");

    const xml = await response.text();
    if (new TextEncoder().encode(xml).byteLength > 256_000) {
      throw new Error("Official RSS response is too large");
    }

    const notices = parseOfficialNoticeRss(xml, 20);
    const fetchedAt = new Date().toISOString();
    lastSuccessfulFeeds[boardKey] = { notices, fetchedAt };

    return new Response(
      JSON.stringify({ status: "live", board: boardKey, label: board.label, listUrl: board.listUrl, fetchedAt, notices }),
      { status: 200, headers: responseHeaders },
    );
  } catch {
    const lastSuccessful = lastSuccessfulFeeds[boardKey];
    return new Response(
      JSON.stringify({
        status: lastSuccessful ? "stale" : "unavailable",
        board: boardKey,
        label: board.label,
        listUrl: board.listUrl,
        fetchedAt: lastSuccessful?.fetchedAt ?? new Date().toISOString(),
        notices: lastSuccessful?.notices ?? [],
      }),
      { status: 200, headers: responseHeaders },
    );
  }
}
