import { useState } from "react";
import { AppShell, Group, Button } from "@mantine/core";
import { VocabularyPage } from "./pages/VocabularyPage";
import { TesterPage } from "./pages/TesterPage";

export function App() {
	const [page, setPage] = useState<"vocabulary" | "tester">("vocabulary");

	return (
		<AppShell header={{ height: 60 }} padding="md">
			<AppShell.Header>
				<Group h="100%" px="md">
					<Button
						variant={page === "vocabulary" ? "filled" : "light"}
						onClick={() => setPage("vocabulary")}
					>
						Словарь
					</Button>

					<Button
						variant={page === "tester" ? "filled" : "light"}
						onClick={() => setPage("tester")}
					>
						Тестер
					</Button>
				</Group>
			</AppShell.Header>

			<AppShell.Main>{page === "vocabulary" ? <VocabularyPage /> : <TesterPage />}</AppShell.Main>
		</AppShell>
	);
}
