import './Assignments.css';
import PixelBlast from '../components/ui/PixelBlast';

export default function Assignments() {
  return (
    <div className="coming-soon-container" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <PixelBlast
          variant="circle"
          pixelSize={6}
          color="#1e3a8a"
          patternScale={3}
          patternDensity={1.2}
          pixelSizeJitter={0.5}
          enableRipples={true}
          rippleSpeed={0.4}
          rippleThickness={0.12}
          rippleIntensityScale={1.5}
          speed={0.6}
          edgeFade={0.25}
          transparent={true}
        />
      </div>
      <div style={{ position: 'relative', zIndex: 1, pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="coming-soon-icon">📝</div>
        <h1 className="coming-soon-title">Assignments Coming Soon!</h1>
        <p className="coming-soon-text">
          We're working hard to create high-quality assignments for all subjects. Stay tuned for updates and practice materials that will help you master your coursework.
        </p>
      </div>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <a href="#" className="notification-button" onClick={(e) => e.preventDefault()}>
          Get Notified When Available
        </a>
      </div>
    </div>
  );
}
