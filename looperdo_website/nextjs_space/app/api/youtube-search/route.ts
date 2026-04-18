import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query, topic, subTopic, exam } = body;

    if (!query && !subTopic) {
      return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "YouTube API key not configured" }, { status: 500 });
    }

    // Build a cleaner, more targeted query
    // Prioritize sub_topic + topic, use exam only as a weak hint
    const searchQuery = query || [subTopic, topic, "tutorial"]
      .filter(Boolean)
      .join(" ");

    // Step 1: Search with quality filters
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    searchUrl.searchParams.set('part', 'snippet');
    searchUrl.searchParams.set('q', searchQuery);
    searchUrl.searchParams.set('type', 'video');
    searchUrl.searchParams.set('maxResults', '15'); // Get more, then filter
    searchUrl.searchParams.set('videoDuration', 'medium'); // 4-20 min — skips shorts & 2hr streams
    searchUrl.searchParams.set('videoEmbeddable', 'true'); // Must be embeddable
    searchUrl.searchParams.set('relevanceLanguage', 'en');
    searchUrl.searchParams.set('order', 'relevance');
    searchUrl.searchParams.set('key', apiKey);

    const searchResponse = await fetch(searchUrl.toString());
    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      console.error("YouTube search error:", searchData);
      return NextResponse.json({ error: "YouTube API request failed" }, { status: 500 });
    }

    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
    if (!videoIds) {
      return NextResponse.json({ success: true, videos: [] });
    }

    // Step 2: Fetch statistics (view count, likes) for ranking
    const statsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    statsUrl.searchParams.set('part', 'snippet,statistics,contentDetails');
    statsUrl.searchParams.set('id', videoIds);
    statsUrl.searchParams.set('key', apiKey);

    const statsResponse = await fetch(statsUrl.toString());
    const statsData = await statsResponse.json();

    if (!statsResponse.ok) {
      console.error("YouTube stats error:", statsData);
      return NextResponse.json({ error: "YouTube stats request failed" }, { status: 500 });
    }

    // Step 3: Score and rank videos by quality signals
    const scored = statsData.items
      .map((item: any) => {
        const views = parseInt(item.statistics?.viewCount || '0');
        const likes = parseInt(item.statistics?.likeCount || '0');
        const title = (item.snippet.title || '').toLowerCase();
        const desc = (item.snippet.description || '').toLowerCase();

        // Quality score: likes/views ratio + raw views bonus
        const engagementRatio = views > 0 ? (likes / views) : 0;
        const viewsBonus = Math.min(Math.log10(views + 1) / 10, 1); // cap log bonus
        let score = engagementRatio * 100 + viewsBonus;

        // Boost educational keywords
        const educationalTerms = ['tutorial', 'explained', 'course', 'lesson', 'guide', 'learn', 'how to', 'introduction', 'basics', 'deep dive'];
        if (educationalTerms.some(t => title.includes(t) || desc.includes(t))) score += 0.5;

        // Penalize shorts, music, memes, reaction content
        const badTerms = ['#shorts', 'reaction', 'meme', 'funny', 'prank', 'tiktok', 'music video'];
        if (badTerms.some(t => title.includes(t))) score -= 2;

        // Require minimum views for credibility (500+)
        if (views < 500) score -= 1;

        return {
          videoId: item.id,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
          author: { name: item.snippet.channelTitle },
          ago: item.snippet.publishedAt,
          views,
          likes,
          score,
        };
      })
      .filter((v: any) => v.score > -1) // drop obvious junk
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 6);

    return NextResponse.json({ success: true, videos: scored });
  } catch (error: any) {
    console.error("YouTube search API error:", error);
    return NextResponse.json({ error: "Failed to search YouTube" }, { status: 500 });
  }
}