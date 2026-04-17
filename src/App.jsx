import { useEffect, useState } from "react";
import Hero from "./components/Hero";
import StoryStrip from "./components/StoryStrip";
import BoardSection from "./components/BoardSection";
import { defaultBoardState, storageKey } from "./data/seedLines";
import { sortLines } from "./utils/board";

function App() {
  const [boardState, setBoardState] = useState(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);

      if (!raw) {
        return defaultBoardState;
      }

      const parsed = JSON.parse(raw);
      return {
        lines: Array.isArray(parsed.lines)
          ? parsed.lines
          : defaultBoardState.lines,
        votes:
          parsed.votes && typeof parsed.votes === "object"
            ? parsed.votes
            : defaultBoardState.votes,
      };
    } catch (error) {
      console.warn("Failed to restore board state, using defaults.", error);
      return defaultBoardState;
    }
  });
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(boardState));
  }, [boardState]);

  const categories = [
    ...new Set(boardState.lines.map((line) => line.category)),
  ];
  const filteredLines = sortLines(
    boardState.lines.filter(
      (line) => filter === "all" || line.category === filter,
    ),
  );
  const topLine = filteredLines[0] ?? null;
  const stats = {
    total: boardState.lines.length,
    topScore: topLine ? topLine.score : 0,
    freshCount: boardState.lines.filter((line) => !line.id.startsWith("seed-"))
      .length,
  };

  function handleVote(lineId, direction) {
    setBoardState((currentBoard) => {
      const currentVote = currentBoard.votes[lineId] || 0;
      const nextVote = currentVote === direction ? 0 : direction;
      const adjustment = nextVote - currentVote;

      return {
        votes: {
          ...currentBoard.votes,
          [lineId]: nextVote,
        },
        lines: currentBoard.lines.map((line) =>
          line.id === lineId
            ? { ...line, score: line.score + adjustment }
            : line,
        ),
      };
    });
  }

  function handleSubmit(submission) {
    const newLine = {
      id: `line-${Date.now()}`,
      category: submission.category,
      text: submission.text,
      author: submission.author || "anonymous sketcher",
      score: 1,
      createdAt: new Date().toISOString(),
    };

    setBoardState((currentBoard) => ({
      lines: [newLine, ...currentBoard.lines],
      votes: {
        ...currentBoard.votes,
        [newLine.id]: 1,
      },
    }));
  }

  return (
    <div className="page-shell">
      <div className="paper-grain" aria-hidden="true"></div>
      <Hero stats={stats} />
      <main>
        <StoryStrip />
        <BoardSection
          categories={categories}
          currentVotes={boardState.votes}
          filter={filter}
          lines={filteredLines}
          onFilterChange={setFilter}
          onSubmit={handleSubmit}
          onVote={handleVote}
        />
      </main>
    </div>
  );
}

export default App;
