import { useEffect, useState } from "react";
import liff from "@line/liff";

export default function Home() {
  const [name, setName] = useState("");

  useEffect(() => {
    async function init() {
      await liff.init({ liffId: "2009308319-2r1OXrGI" });

      if (!liff.isLoggedIn()) {
        liff.login();
      } else {
        const profile = await liff.getProfile();
        setName(profile.displayName);
      }
    }

    init();
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>LIFF POS TEST</h1>
      <p>User: {name}</p>
    </div>
  );
}
