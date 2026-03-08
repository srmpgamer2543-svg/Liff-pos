export async function getMenu(){

const res = await fetch("/api/get-menu")

const data = await res.json()

return data

}
