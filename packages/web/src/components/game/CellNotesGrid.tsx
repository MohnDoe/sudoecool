import React from "react";

export default React.memo(function CellNotesGrid({
  notes,
  highlight,
}: {
  notes: number[];
  highlight: number | null;
}) {
  return (
    <div
      className="
      grid grid-cols-3 grid-rows-3 w-full h-full
      "
    >
      {Array(9)
        .fill(0)
        .map((_, i) => {
          const num = i + 1;
          const active = notes.includes(num);
          const highlighted = active && num == highlight;
          const row = Math.floor(i / 3) + 1;
          const col = i % 3 + 1;
          return active ? (
            <span
              key={`note-${num}`}
              className={`flex items-center justify-center text-xs
                ${highlighted && "text-primary font-bold"}`}
              style={{
                gridRow: row,
                gridColumn: col
              }}
            >
              {num}
            </span>
          ) : null
        })}
    </div>
  );
})
