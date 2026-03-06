export function openModal(html){

const modal=document.getElementById("modal")

modal.innerHTML=`
<div class="modal-box">
${html}
</div>
`

modal.style.display="flex"

}

export function closeModal(){

document.getElementById("modal").style.display="none"

}
