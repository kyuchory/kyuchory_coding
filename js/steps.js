import { TIER_NAMES, TIER_COLORS, escHtml, fmtCount } from "./utils.js";
import { TAG_NAMES_KO } from "./tag-names.js";

function tierBadge(level) {
  const name = TIER_NAMES[level] ?? "Unrated";
  const color = TIER_COLORS[level] ?? "#64748b";
  return `<span class="tier-badge" style="color:${color};background:${color}18;border:1px solid ${color}44">${name}</span>`;
}

fetch("index.json")
  .then((r) => r.json())
  .then((data) => {
    document.getElementById("stat").textContent =
      `${data.length.toLocaleString()} 문제`;

    const tagStats = {};
    data.forEach((p) => {
      (p.tags ?? []).forEach((t) => {
        const s = (tagStats[t] ??= { count: 0, minLevel: 31, maxLevel: 0 });
        s.count++;
        const lvl = p.level ?? 0;
        if (lvl < s.minLevel) s.minLevel = lvl;
        if (lvl > s.maxLevel) s.maxLevel = lvl;
      });
    });

    const tags = Object.entries(tagStats).sort(
      (a, b) => b[1].count - a[1].count,
    );

    if (tags.length === 0) {
      document.getElementById("content").innerHTML =
        '<div class="empty">카테고리가 없습니다.</div>';
      return;
    }

    const cards = tags
      .map(
        ([tag, s]) => `
      <a class="step-card" href="./?tag=${encodeURIComponent(tag)}&sort=level">
        <div class="step-card-name">
          ${escHtml(tag)}${TAG_NAMES_KO[tag] ? `<span class="step-card-ko">${escHtml(TAG_NAMES_KO[tag])}</span>` : ""}
        </div>
        <div class="step-card-count">${fmtCount(s.count)}문제</div>
        <div class="step-card-range">
          ${tierBadge(s.minLevel)} <span class="step-card-arrow">→</span> ${tierBadge(s.maxLevel)}
        </div>
      </a>`,
      )
      .join("");

    document.getElementById("content").innerHTML =
      `<div class="step-grid">${cards}</div>`;
  })
  .catch(() => {
    document.getElementById("content").innerHTML =
      '<div class="empty">index.json 로딩 실패</div>';
  });
