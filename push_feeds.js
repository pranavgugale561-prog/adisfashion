const FIREBASE_URL = "https://adis-fashion-default-rtdb.firebaseio.com/feeds.json";
const initialFeeds = [
    {
        url: "https://www.instagram.com/reel/DFPZGXYMy2B/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
        type: "reel",
        createdAt: Date.now()
    },
    {
        url: "https://www.instagram.com/p/DFQdTR8zQnw/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
        type: "post",
        createdAt: Date.now() - 100000
    }
];

async function update() {
    try {
        const res = await fetch(FIREBASE_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(initialFeeds)
        });
        console.log("Pushed initial feeds to Firebase");
    } catch(err) {
        console.error(err);
    }
}
update();
