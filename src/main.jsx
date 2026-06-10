import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ListProvider } from "./context/ListContext.jsx";
import { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<BrowserRouter>
			<SkeletonTheme baseColor="#202020" highlightColor="#404040">
				<ListProvider>
					<App />
				</ListProvider>
			</SkeletonTheme>
		</BrowserRouter>
	</StrictMode>,
);
