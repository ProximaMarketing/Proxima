/*==========================================
PROXIMA
==========================================*/


/* Scroll Progress Bar */

const progressBar = document.querySelector(".scroll-progress");

window.addEventListener("scroll", () => {

    const scrollTop = window.scrollY;

    const pageHeight =
        document.documentElement.scrollHeight - window.innerHeight;

    const progress = (scrollTop / pageHeight) * 100;

    progressBar.style.width = progress + "%";

});


/* Floating Navigation */

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {

    if(window.scrollY > 100){

        navbar.classList.add("scrolled");

    }else{

        navbar.classList.remove("scrolled");

    }

});


/* Reveal Animation */

const reveals = document.querySelectorAll(

".intro, .capabilities, .process, .cta, .footer"

);

const observer = new IntersectionObserver(entries=>{

    entries.forEach(entry=>{

        if(entry.isIntersecting){

            entry.target.classList.add("active");

        }

    });

},{
    threshold:.15
});

reveals.forEach(section=>{

    section.classList.add("reveal");

    observer.observe(section);

});


/* Smooth Scroll */

document.querySelectorAll('a[href^="#"]').forEach(anchor=>{

    anchor.addEventListener("click",function(e){

        e.preventDefault();

        const target=document.querySelector(this.getAttribute("href"));

        if(target){

            target.scrollIntoView({

                behavior:"smooth"

            });

        }

    });

});
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwdbsCxqpj2l8xlcs9AzkHiYH5txcJfg3VkHI2OePnEGVMVXFUKAOvr6iWX_pkd1NA/exec";

const form = document.getElementById("applicationForm");
const button = document.getElementById("submitButton");
const success = document.getElementById("successMessage");

form.addEventListener("submit", async function(e){

    e.preventDefault();

    button.disabled = true;
    button.textContent = "Submitting...";

    const formData = Object.fromEntries(new FormData(form).entries());

    try{

    const response = await fetch(SCRIPT_URL, {
    method: "POST",
    body: new URLSearchParams(formData)
});

const result = await response.json();

if(result.success){

    form.reset();

    success.classList.add("show");

    success.scrollIntoView({
        behavior:"smooth"
    });

}else{

    alert("Something went wrong. Please try again.");

}

    button.disabled = false;
    button.textContent = "Submit Application";

});
