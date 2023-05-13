import { initializeApp } from "firebase/app";
import { getDatabase, get, ref } from "firebase/database";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { defineString } from "firebase-functions/params"

const dateDbKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

const signIn = async () => {
    const auth = getAuth();

    const email = defineString("EMAIL");
    const password = defineString("PASSWORD");

    const _user = await signInWithEmailAndPassword(auth, email, password)
}

const getSlackers = async (): Promise<string[]> => {
    const firebaseApp = initializeApp({
        apiKey: "AIzaSyCnQDtVPzIM950_CNzSNS0Ys_GvWjLSo8c",
        authDomain: "app-3cc36.firebaseapp.com",
        databaseURL:
            "https://app-3cc36-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "app-3cc36",
        storageBucket: "app-3cc36.appspot.com",
        messagingSenderId: "863494049683",
        appId: "1:863494049683:web:180b22da978243230a6266",
    });

    await signIn();

    const db = getDatabase(firebaseApp);

    const tokens = (await get(ref(db, `expoPushTokens`))).toJSON();

    const todaysHaikus = (
        await get(ref(db, `days/${dateDbKey(new Date())}`))
    ).toJSON();

    const posters: string[] = Object.entries(todaysHaikus).map(([x, _]) => x);

    return Object.entries(tokens as Record<string, string>)
        .filter(([userId, _]) => !posters.includes(userId))
        .map(([_, token]) => token)
}

const notify = async (expoToken: string) => {
    const data = JSON.stringify({
        to: expoToken,
        title: "⚠️ It's time to 575 ⚠️",
        body: "Compose your haiku now and see what the world is saying",
    })

    console.log(data)

    const resp = await fetch("https://exp.host/--/api/v2/push/send", {
      body: data,
      headers: { "Content-Type": "application/json" },
      method: "POST",
    })

    console.log(resp.statusText)
}

// cron('46 21 * * *', async () => {
    const slackers = await getSlackers()
    console.log(slackers)
    // const slackers = ['ExponentPushToken[Kgrf3XIFw0S6CocunCqxvS]']

    slackers.forEach(notify)
// });