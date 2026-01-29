import type { FC, PropsWithChildren } from "react";
import { ThemeProvider } from "./theme-provider";

export const Providers: FC<PropsWithChildren> = (props) => {
	const { children } = props;

	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="dark"
			enableSystem
			disableTransitionOnChange
		>
			{children}
		</ThemeProvider>
	);
};
