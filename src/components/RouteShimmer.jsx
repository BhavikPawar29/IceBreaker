function RouteShimmer({ className = "" }) {
  return (
    <div className={`route-shimmer ${className}`.trim()} aria-hidden="true">
      <div className="route-shimmer-head">
        <span className="detail-shimmer detail-shimmer--heading"></span>
        <span className="detail-shimmer detail-shimmer--copy"></span>
        <div className="route-shimmer-row">
          <span className="detail-shimmer detail-shimmer--chip-sm"></span>
          <span className="detail-shimmer detail-shimmer--chip-sm"></span>
          <span className="detail-shimmer detail-shimmer--chip-sm detail-shimmer--chip-soft"></span>
        </div>
      </div>
      <div className="route-shimmer-card route-shimmer-card--primary">
        <div className="route-shimmer-card-top">
          <span className="detail-shimmer detail-shimmer--rank"></span>
          <div className="route-shimmer-row">
            <span className="detail-shimmer detail-shimmer--chip"></span>
            <span className="detail-shimmer detail-shimmer--chip detail-shimmer--chip-wide"></span>
          </div>
        </div>
        <div className="route-shimmer-text">
          <span className="detail-shimmer detail-shimmer--line-lg"></span>
          <span className="detail-shimmer detail-shimmer--line-md"></span>
        </div>
        <div className="route-shimmer-card-bottom">
          <div>
            <span className="detail-shimmer detail-shimmer--copy-sm"></span>
            <div className="route-shimmer-row route-shimmer-row--actions">
              <span className="detail-shimmer detail-shimmer--button"></span>
              <span className="detail-shimmer detail-shimmer--button detail-shimmer--button-ghost"></span>
              <span className="detail-shimmer detail-shimmer--button detail-shimmer--button-ghost"></span>
            </div>
          </div>
          <div className="route-shimmer-row route-shimmer-row--stats">
            <span className="detail-shimmer detail-shimmer--stat"></span>
            <span className="detail-shimmer detail-shimmer--vote"></span>
          </div>
        </div>
      </div>
      <div className="route-shimmer-card route-shimmer-card--secondary">
        <div className="route-shimmer-card-top">
          <span className="detail-shimmer detail-shimmer--rank"></span>
          <div className="route-shimmer-row">
            <span className="detail-shimmer detail-shimmer--chip"></span>
            <span className="detail-shimmer detail-shimmer--chip detail-shimmer--chip-wide"></span>
          </div>
        </div>
        <div className="route-shimmer-text">
          <span className="detail-shimmer detail-shimmer--line-lg"></span>
          <span className="detail-shimmer detail-shimmer--line-md"></span>
        </div>
      </div>
    </div>
  );
}

export default RouteShimmer;
