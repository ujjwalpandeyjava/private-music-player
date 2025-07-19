import { NextRequest, NextResponse } from "next/server";
import { stat, readFile } from "fs";
import { promisify } from "util";
import { join } from "path";
import mime from "mime";


const statAsync = promisify(stat);
const readFileAsync = promisify(readFile);



export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
	const resolvedParams = await params;

	if (!resolvedParams.path)
		return new NextResponse("Not found", { status: 404 });

	const safePath = resolvedParams.path.filter((p) => !p.startsWith("..") && !p.includes("/"));
	const filePath = join(process.cwd(), "ourFiles", ...safePath);

	try {
		const fstat = await statAsync(filePath);
		if (!fstat.isFile())
			throw new Error("Not file");

		const fileBuffer = await readFileAsync(filePath);
		const contentType = mime.getType(filePath) || "application/octet-stream";

		return new NextResponse(fileBuffer, {
			headers: { "Content-Type": contentType, "Content-Length": fstat.size.toString() }
		});
	} catch {
		return new NextResponse("Not found", { status: 404 });
	}
}