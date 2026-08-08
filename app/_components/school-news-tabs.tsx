"use client";

import { useState } from "react";
import type { OfficialBoardKey } from "../../lib/dukyoung-notices";
import OfficialNoticeFeed from "./official-notice-feed";

const boardTabs: Array<{ key: OfficialBoardKey; label: string }> = [
  { key: "notices", label: "공지사항" },
  { key: "letters", label: "가정통신문" },
  { key: "stories", label: "학교소식" },
];

export default function SchoolNewsTabs() {
  const [board, setBoard] = useState<OfficialBoardKey>("notices");

  return (
    <div className="school-news-tabs">
      <div className="school-news-tablist" role="tablist" aria-label="공식 학교 소식 종류">
        {boardTabs.map((tab) => (
          <button
            type="button"
            role="tab"
            aria-selected={board === tab.key}
            onClick={() => setBoard(tab.key)}
            key={tab.key}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        <OfficialNoticeFeed key={board} board={board} limit={20} />
      </div>
    </div>
  );
}
