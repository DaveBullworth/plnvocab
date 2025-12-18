import React from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider } from "@mantine/core";

import { App } from "./app/App";
import { StorageProvider } from "./app/providers/StorageProvider";
import "@mantine/core/styles.css"; // стили Mantine
import "./styles/reset.scss";
import "./styles/theme.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<MantineProvider>
			<StorageProvider>
				<App />
			</StorageProvider>
		</MantineProvider>
	</React.StrictMode>
);
