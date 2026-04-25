export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <span className="brand-k">2026</span>
          <span className="brand-sub">산업안전 RBF 사회비용 성과 대시보드</span>
        </div>
        <div className="footer-info">
          <p>&copy; {new Date().getFullYear()} DreamIT Biz. All rights reserved.</p>
          <p>
            <a href="https://www.dreamitbiz.com" target="_blank" rel="noopener noreferrer">
              www.dreamitbiz.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
