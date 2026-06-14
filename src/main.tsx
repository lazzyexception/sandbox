import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Note: intentionally NOT wrapped in <StrictMode>. Its dev-only double-invoke
// of effects re-creates GSAP ScrollTrigger pin-spacers mid-layout, which leaves
// pinned scenes with stale scroll coordinates. Production never double-mounts;
// dropping StrictMode keeps the dev preview faithful to production.
createRoot(document.getElementById("root")!).render(<App />);
