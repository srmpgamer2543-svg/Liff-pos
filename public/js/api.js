import {config} from "./config.js"

export async function getCategories(){

const res = await fetch(`${config.api}/categories`,{
headers:{
Authorization:`Bearer ${config.token}`
}
})

const data = await res.json()

return data.categories

}

export async function getItems(){

const res = await fetch(`${config.api}/items`,{
headers:{
Authorization:`Bearer ${config.token}`
}
})

const data = await res.json()

return data.items

}
