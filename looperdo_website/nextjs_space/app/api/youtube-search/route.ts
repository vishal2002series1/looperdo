import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "YouTube API key not configured" }, { status: 500 });
    }

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=6&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error("YouTube API error:", data);
      return NextResponse.json({ error: "YouTube API request failed" }, { status: 500 });
    }

    const videos = data.items.map((item: any) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
      author: { name: item.snippet.channelTitle },
      ago: item.snippet.publishedAt,
    }));

    return NextResponse.json({ success: true, videos });
  } catch (error: any) {
    console.error("YouTube search API error:", error);
    return NextResponse.json({ error: "Failed to search YouTube" }, { status: 500 });
  }
}