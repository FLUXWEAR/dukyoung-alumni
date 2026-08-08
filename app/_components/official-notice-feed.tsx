"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type OfficialBoardKey,
  type OfficialNotice,
  officialSchoolBoards,
} from "../../lib/dukyoung-notices";

type FeedResponse = {
  status: "live" | "stale" | "unavailable";
  board: OfficialBoardKey;
  label: string;
  listUrl: string;
  fetchedAt: string;
  notices: OfficialNotice[];
};

type OfficialNoticeFeedProps = {
  limit?: number;
  compact?: boolean;
  board?: OfficialBoardKey;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10).replaceAll("-", ".");
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })
    .format(date)
    .replace(/\s/g, "");
}

export default function OfficialNoticeFeed({ limit = 10, compact = false, board = "notices" }: OfficialNoticeFeedProps) {
  const [data, setData] = useState<FeedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const requestIdRef = useRef(0);
  const requestControllerRef = useRef<AbortController | null>(null);

  const loadNotices = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    requestControllerRef.current?.abort();

    const controller = new AbortController();
    requestControllerRef.current = controller;
    setLoading(true);
    try {
      const response = await fetch(`/api/school-notices?board=${board}`, {
        cache: "no-store",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Notice API unavailable");
      const nextData = (await response.json()) as FeedResponse;
      if (requestId === requestIdRef.current) setData(nextData);
    } catch {
      if (!controller.signal.aborted && requestId === requestIdRef.current) {
        setData({
          status: "unavailable",
          board,
          label: officialSchoolBoards[board].label,
          listUrl: officialSchoolBoards[board].listUrl,
          fetchedAt: new Date().toISOString(),
          notices: [],
        });
      }
    } finally {
      if (requestId === requestIdRef.current) {
        requestControllerRef.current = null;
        setLoading(false);
      }
    }
  }, [board]);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => void loadNotices(), 0);
    const timer = window.setInterval(() => void loadNotices(), 300_000);
    const refreshOnVisible = () => {
      if (document.visibilityState === "visible") void loadNotices();
    };
    document.addEventListener("visibilitychange", refreshOnVisible);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshOnVisible);
      requestIdRef.current += 1;
      requestControllerRef.current?.abort();
      requestControllerRef.current = null;
    };
  }, [loadNotices]);

  const currentData = data?.board === board ? data : null;
  const notices = currentData?.notices.slice(0, limit) ?? [];
  const isLive = currentData?.status === "live";

  return (
    <div className={`official-feed ${compact ? "compact" : ""}`}>
      <div className="official-feed-status">
        <span className={isLive ? "live-dot" : "live-dot paused"} aria-hidden="true" />
        <strong>{isLive ? `덕영고 ${currentData?.label ?? officialSchoolBoards[board].label} 연결 중` : currentData?.status === "stale" ? "최근 연결 자료 표시 중" : "공식 RSS 연결 대기 중"}</strong>
        <small>5분마다 자동 갱신</small>
        <button type="button" onClick={() => void loadNotices()} disabled={loading}>
          {loading ? "확인 중" : "새로고침"}
        </button>
      </div>

      {loading && !currentData ? (
        <div className="official-feed-loading" role="status">공식 공지사항을 불러오고 있습니다.</div>
      ) : notices.length ? (
        <div className="official-notice-list">
          {notices.map((notice, index) => (
            <a href={notice.href} target="_blank" rel="noreferrer" key={notice.href}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{notice.title}</strong>
              <time dateTime={notice.publishedAt}>{formatDate(notice.publishedAt)}</time>
              <em>공식 글 ↗</em>
            </a>
          ))}
        </div>
      ) : (
        <div className="official-feed-error" role="status">
          지금은 공식 {officialSchoolBoards[board].label} 목록을 불러오지 못했습니다. 공식 홈페이지에서 바로 확인할 수 있습니다.
        </div>
      )}

      <div className="official-feed-footer">
        <p>덕영고등학교 공식 홈페이지의 공개 자료를 그대로 연결하며, 글을 누르면 공식 원문이 열립니다.</p>
        <a href={currentData?.listUrl ?? officialSchoolBoards[board].listUrl} target="_blank" rel="noreferrer">공식 {currentData?.label ?? officialSchoolBoards[board].label} 전체보기 ↗</a>
      </div>
    </div>
  );
}
