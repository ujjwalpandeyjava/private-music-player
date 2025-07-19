import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import { readdir } from "fs/promises";
import { extname } from "path";
import { join } from "path";


export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const file = formData.get("file") as File | null;
		const thumbnail = formData.get("thumbnail") as File | null;

		if (!file) {
			return NextResponse.json({ error: "No music file uploaded." }, { status: 400 });
		}
		if (!thumbnail) {
			return NextResponse.json({ error: "No thumbnail uploaded." }, { status: 400 });
		}

		const timestamp = Date.now();

		// MUSIC FILE
		const fileExt = file.name.substring(file.name.lastIndexOf('.'));
		const fileBase = file.name.substring(0, file.name.lastIndexOf('.'));
		const finalFileName = `${fileBase}-${timestamp}${fileExt}`;

		const fileBuffer = Buffer.from(await file.arrayBuffer());

		// THUMBNAIL FILE (same basename as audio, append 'tn' before extension)
		const thumbExt = thumbnail.name.substring(thumbnail.name.lastIndexOf('.'));
		// Always use the music file's basename for the thumbnail
		const thumbFileName = `${fileBase}-${timestamp}tn${thumbExt}`;
		const thumbBuffer = Buffer.from(await thumbnail.arrayBuffer());

		// Save to /public/uploads (ensure directory exists)
		const uploadDir = join(process.cwd(), "ourFiles", 'uploads');
		await mkdir(uploadDir, { recursive: true });

		await writeFile(join(uploadDir, finalFileName), fileBuffer);
		await writeFile(join(uploadDir, thumbFileName), thumbBuffer);

		return NextResponse.json({
			message: "Files uploaded.",
			fileName: finalFileName,
			thumbnailName: thumbFileName,
		});
	} catch (e) {
		return NextResponse.json({ error: "Failed to upload." }, { status: 500 });
	}
}


export async function GET() {
	const uploadDir = join(process.cwd(), "ourFiles", "uploads");
	try {
		const files = await readdir(uploadDir);
		// Pair music files with their thumbnails
		const musicFiles = files.filter((name) =>
			[".mp3", ".wav", ".m4a", ".flac", ".ogg"].includes(extname(name).toLowerCase()) && !name.includes("tn.")
		);
		const tracks = musicFiles.map((musicName) => {
			const base = musicName.replace(/\.[^.]+$/, ''); // remove extension
			const thumbnail = files.find(
				(f) => f.startsWith(base) && f.includes("tn.") // assumes 'tn' before file ext in thumbnail
			);
			return {
				musicFile: `/api/files/uploads/${musicName}`,
				thumbnail: thumbnail ? `/api/files/uploads/${thumbnail}` : null,
				title: musicName.replace(/-\d+/, "").replace(/\.[^.]+$/, ''), // remove timestamp and extension
			};
		});
		return NextResponse.json(tracks);
	} catch (e) {
		return NextResponse.json({ error: "Could not read upload directory." }, { status: 500 });
	}
}
