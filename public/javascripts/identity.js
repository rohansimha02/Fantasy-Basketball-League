let myIdentity = undefined;

async function fetchJSON(url, options) {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
}

async function loadIdentity(){
    let identity_div = document.getElementById("identity_div");

    try{
        let identityInfo = await fetchJSON(`api/users/myIdentity?redirect=true`)
        
        if(identityInfo.status == "loggedin"){
            myIdentity = identityInfo.userInfo.username;
            identity_div.innerHTML = `
            ${identityInfo.userInfo.name} (${identityInfo.userInfo.username})
            <a href="signout" class="btn btn-danger" role="button">Log out</a>`;
            
            // Redirect to homepage page if on the index page
            if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
                window.location.href = '/homepage.html';
            }
            
            if(document.getElementById("make_post_div")){
                document.getElementById("make_post_div").classList.remove("d-none");
            }
            Array.from(document.getElementsByClassName("new-comment-box")).forEach(e => e.classList.remove("d-none"))
            Array.from(document.getElementsByClassName("heart-button-span")).forEach(e => e.classList.remove("d-none"));
        } else { //logged out
            myIdentity = undefined;
            // If not on index page, redirect to home
            if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
                window.location.href = '/';
            }
            identity_div.innerHTML = `
            <a href="signin" class="btn btn-primary" role="button">Log in</a>`;
            if(document.getElementById("make_post_div")){
                document.getElementById("make_post_div").classList.add("d-none");
            }
            Array.from(document.getElementsByClassName("new-comment-box")).forEach(e => e.classList.add("d-none"))
            Array.from(document.getElementsByClassName("heart-button-span")).forEach(e => e.classList.add("d-none"));
        }
    } catch(error){
        myIdentity = undefined;
        identity_div.innerHTML = `<div>
        <button onclick="loadIdentity()">retry</button>
        Error loading identity: <span id="identity_error_span"></span>
        </div>`;
        document.getElementById("identity_error_span").innerText = error;
        if(document.getElementById("make_post_div")){
            document.getElementById("make_post_div").classList.add("d-none");
        }
        Array.from(document.getElementsByClassName("new-comment-box")).forEach(e => e.classList.add("d-none"));
        Array.from(document.getElementsByClassName("heart-button-span")).forEach(e => e.classList.add("d-none"));
    }
}
