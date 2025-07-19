"use client";

import { Button, Card, CardSection, Flex, Group, Progress, Stack, Text, Title, Center, Image } from '@mantine/core';
import { useState, useRef, useEffect } from "react";
import { FaForward } from 'react-icons/fa';
import { MdOutlineFastRewind } from "react-icons/md";
import { IoMdMusicalNotes } from "react-icons/io";
import { CiPause1 } from "react-icons/ci";
import { CiPlay1 } from "react-icons/ci";
import { Track } from "@/interfaces/ourInterfaces";



const AudioPlayer = () => {
	const [tracks, setTracks] = useState<Track[]>([]);
	const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0); // State to manage the current track index
	const [isPlaying, setIsPlaying] = useState<boolean>(false); // State to manage the play/pause status
	const [progress, setProgress] = useState<number>(0); // State to manage the progress of the current track
	const [currentTime, setCurrentTime] = useState<number>(0); // State to manage the current time of the track
	const [duration, setDuration] = useState<number>(0); // State to manage the duration of the track
	const audioRef = useRef<HTMLAudioElement | null>(null); // Ref to manage the audio element


	// Fetch the list of uploaded music files & thumbnails on mount
	useEffect(() => {
		setTracks(trackList);
		// (async () => {
		// 	const res = await fetch("/api/upload");
		// 	if (res.ok) {
		// 		const data = await res.json();
		// 		console.log({ data });
		// 		// setTracks(data);
		// 		setCurrentTrackIndex(0);
		// 	}
		// })();
	}, []);

	// Function to handle play/pause toggle
	const handlePlayPause = () => {
		if (isPlaying) {
			audioRef.current?.pause();
			setIsPlaying(false);
		} else {
			audioRef.current?.play();
			setIsPlaying(true);
		}
	};
	// Effect to play/pause audio when isPlaying changes
	useEffect(() => {
		if (audioRef.current) {
			if (isPlaying)
				audioRef.current.play();
			else
				audioRef.current.pause();
		}
	}, [isPlaying]);


	const handleNextTrack = () => setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % tracks.length);
	const handlePrevTrack = () => setCurrentTrackIndex((prevIndex) => prevIndex === 0 ? tracks.length - 1 : prevIndex - 1);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const handleSeek = (seconds: number) => {
		const audio = audioRef.current;
		if (audio && !isNaN(audio.duration) && audio.duration > 0) {
			let target = audio.currentTime + seconds;
			if (target < 0) target = 0;
			if (target > audio.duration) target = audio.duration;
			// console.log(target);
			audio.currentTime = target;
			console.log('AFTER:', audio.currentTime);
			// Do NOT call setCurrentTime here - onTimeUpdate triggers it
			// setCurrentTime(newTime); // Not needed, will update via onTimeUpdate
			// setProgress((newTime / duration) * 100); // Not needed, will update via onTimeUpdate
		}
	};


	// Function to handle time update of the track
	const handleTimeUpdate = () => {
		if (audioRef.current && audioRef.current.duration) {
			setCurrentTime(audioRef.current.currentTime);
			setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
		}
	};

	// Function to handle metadata load of the track
	// Start playback and reset to 0 when metadata for new track loads
	const handleLoadedMetadata = () => {
		if (audioRef.current) {
			setDuration(audioRef.current.duration);
			audioRef.current.currentTime = 0;
			setCurrentTime(0);
			setProgress(0);
			if (isPlaying) {
				audioRef.current.play();
			}
		}
	};




	// Function to format time in minutes and seconds
	const formatTime = (time: number) => {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
	};

	// Only reset audio when the current track or tracks array changes
	useEffect(() => {
		if (audioRef.current && tracks[currentTrackIndex]) {
			audioRef.current.pause();
			audioRef.current.src = tracks[currentTrackIndex].musicFile;
			audioRef.current.load();
		}
	}, [currentTrackIndex, tracks]);




	// Don't render player UI if tracks have not yet loaded
	if (tracks.length === 0) {
		return (
			<Flex align="center" justify="center" h="100vh">
				<Text>No music...</Text>
			</Flex>
		);
	}
	return (
		<>
			<Center><Title order={1} size="h1">Voice of Love</Title></Center>

			<Flex direction="column" align="center" justify="center" h="100%" bg="var(--mantine-color-body)" c="var(--mantine-color-text)">
				<Card>
					<CardSection>
						<Flex direction="column" align="center" gap="md" p="lg">
							{tracks[currentTrackIndex].thumbnail ?
								<Image src={tracks[currentTrackIndex].thumbnail} alt="Album Cover" radius="xl" width={"100%"} height={340} fit="cover" />
								: <IoMdMusicalNotes size="3em" />}
							<Stack gap={2} align="center">
								<Title order={2} size="h3">{tracks[currentTrackIndex]?.title.replace(/-\d+$/, "") || "Audio Title"}</Title>
								{/* <Text c="dimmed" size="sm">Unknown Artist</Text> */}
							</Stack>
							<Stack gap={2} w="100%">
								<Progress value={progress} />
								<Group justify="space-between" gap="xs">
									<Text size="xs" c="dimmed">{formatTime(currentTime)}</Text>
									<Text size="xs" c="dimmed">{formatTime(duration)}</Text>
								</Group>
							</Stack>
							<Group gap="md">
								{/* <Button variant="default" size="md" px="1em" onClick={() => handleSeek(-10)} disabled={!duration || duration === Infinity || isNaN(duration)}>-10s</Button> */}
								<Button variant="default" size="md" px="1em" onClick={handlePrevTrack}>
									<MdOutlineFastRewind size={24} />
								</Button>
								<Button variant="default" size="md" px="1em" onClick={handlePlayPause}>
									{isPlaying ? <CiPause1 size={24} /> : <CiPlay1 size={24} />}
								</Button>
								<Button variant="default" size="md" px="1em" onClick={handleNextTrack}>
									<FaForward size={24} />
								</Button>
								{/* <Button variant="default" size="md" px="1em" onClick={() => handleSeek(10)} disabled={!duration || duration === Infinity || isNaN(duration)}>+10s</Button> */}
							</Group>
							<audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} />
						</Flex>
					</CardSection>
				</Card>
			</Flex>
		</>
	);
};

export default AudioPlayer;

const trackList: Track[] = [
	{
		musicFile: "./assets/Audio 2025-04-18 at 22.07.07_c74ae8fe.mp3",
		thumbnail: "./assets/photos/IMG_20250621_120727.jpg",
		title: "Sanjali from: 2025-04-18 at 22.07"
	},
	{
		musicFile: "./assets/Audio 2025-04-29 at 15.22.26_1a231578.mp3",
		thumbnail: "./assets/photos/IMG-20250717-WA0005.jpg",
		title: "Sanjali from: 2025-04-29 at 15.22."
	},
	{
		musicFile: "./assets/Audio 2025-05-09 at 22.13.05_c776aa0a.mp3",
		thumbnail: "./assets/photos/IMG-20250712-WA0010.jpg",
		title: "Sanjali from: 2025-05-09 at 22.13"
	},
	{
		musicFile: "./assets/Audio 2025-05-27 at 22.05.12_ce9d3eb7.mp3",
		thumbnail: "./assets/photos/IMG-20250717-WA0004.jpg",
		title: "Sanjali from: 2025-05-27 at 22.05"
	},
	{
		musicFile: "./assets/Audio 2025-05-27 at 23.59.20_c2b665c3.mp3",
		thumbnail: "./assets/photos/IMG_20250621_120453.jpg",
		title: "Sanjali from: 2025-05-27 at 23.59"
	},
	{
		musicFile: "./assets/Audio 2025-06-03 at 09.52.28_9fa12f93.mp3",
		thumbnail: "./assets/photos/IMG_20250609_184438.jpg",
		title: "Sanjali from: 2025-06-03 at 09.52"
	},
	{
		musicFile: "./assets/Audio 2025-06-08 at 13.17.13_e81547cd.mp3",
		thumbnail: "./assets/photos/IMG_20250614_161855.jpg",
		title: "Sanjali from: 2025-06-08 at 13.17"
	},
	{
		musicFile: "./assets/Audio 2025-06-08 at 17.43.51_91f9923d.mp3",
		thumbnail: "./assets/photos/IMG_20250621_115405.jpg",
		title: "Sanjali from: 2025-06-08 at 17.43"
	},
	{
		musicFile: "./assets/Audio 2025-06-23 at 19.01.36_da2f6a75.mp3",
		thumbnail: "./assets/photos/IMG-20250712-WA0011.jpg",
		title: "Sanjali from: 2025-06-23 at 19.01"
	},
	{
		musicFile: "./assets/Audio 2025-06-23 at 19.05.05_077c1bca.mp3",
		thumbnail: "./assets/photos/IMG_20250621_115701.jpg",
		title: "Sanjali from: 2025-06-23 at 19.05"
	},
	{
		musicFile: "./assets/Audio 2025-04-17 at 00.18.01_7316bb70.mp3",
		thumbnail: "./assets/photos/IMG_20250609_184427.jpg",
		title: "Doremon by Aditi"
	}
]