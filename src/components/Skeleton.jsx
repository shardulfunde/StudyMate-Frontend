import './Skeleton.css';

export default function Skeleton({ rows = 1, columns = 3, cardCount = 6 }) {
  const cards = Array.from({ length: cardCount });

  return (
    <div className={`skeleton-grid cols-${columns}`} aria-hidden="true">
      {cards.map((_, i) => (
        <div className="skeleton-card" key={i}>
          <div className="skeleton-thumb" />
          <div className="skeleton-body">
            <div className="skeleton-line short" />
            <div className="skeleton-line medium" />
            {rows > 2 && <div className="skeleton-line long" />}
          </div>
        </div>
      ))}
    </div>
  );
}
