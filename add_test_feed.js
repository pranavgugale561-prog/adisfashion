const FIREBASE_URL = "https://adis-fashion-default-rtdb.firebaseio.com/feeds.json";

async function run() {
    // 1. Fetch current feeds
    const res = await fetch(FIREBASE_URL);
    let feedsObj = await res.json();
    let feeds = [];
    if(feedsObj) {
        feeds = Array.isArray(feedsObj) ? feedsObj : Object.values(feedsObj);
    }
    
    // 2. Add new feed at beginning
    feeds.unshift({
        url: "https://www.instagram.com/reel/DHNOau2T-R6/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
        type: "reel",
        createdAt: Date.now()
    });
    
    // 3. Save back
    await fetch(FIREBASE_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feeds)
    });
    
    console.log("Feed added successfully!");
}

run();
