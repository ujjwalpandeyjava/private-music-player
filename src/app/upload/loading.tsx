import { Loader, Center, Text } from '@mantine/core';

export default function Loading() {
	return (
		<Center h="100vh">
			<Loader color="blue" />
			<Text ml="md">Loading upload page...</Text>
		</Center>
	);
}
