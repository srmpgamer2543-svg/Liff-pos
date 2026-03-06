import { useEffect } from "react";
import liff from "@line/liff";

export default function Home() {

  useEffect(() => {
    liff.init({
      liffId: "2009308319-2r10XrGI"
    });
  }, []);

  const sendOrder = async () => {
    await fetch("/api/webhook", {
      method: "POST"
    });

    alert("ส่งออเดอร์แล้ว");
  };

  return (
    <div style={{padding:30,fontFamily:"sans-serif"}}>

      <h2>สั่งเครื่องดื่ม</h2>

      <button
        onClick={sendOrder}
        style={{
          fontSize:22,
          padding:20,
          width:"100%",
          marginTop:20
        }}
      >
        กาแฟเย็น 50 บาท
      </button>

    </div>
  );
}
