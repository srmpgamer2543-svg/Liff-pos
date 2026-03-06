import { useEffect } from "react";
import liff from "@line/liff";

export default function Home() {

  useEffect(() => {
    liff.init({
      liffId: "2009308319-2r10XrGI"
    });
  }, []);

  const orderCoffee = async () => {
    await fetch("/api/sendOrder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        menu: "กาแฟเย็น",
        price: 50
      })
    });

    alert("ส่งออเดอร์แล้ว");
  };

  return (
    <div style={{padding:20,fontFamily:"sans-serif"}}>
      <h1>เมนูร้าน</h1>

      <button
        onClick={orderCoffee}
        style={{
          fontSize:20,
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
