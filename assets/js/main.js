document.addEventListener("DOMContentLoaded", () => {
    console.log("Page chargée !");

    const title = document.querySelector("h1");
    if (title) {
        title.style.transition = "0.6s";

        title.addEventListener("mouseover", () => {
            title.style.color = "#4c6ef5";
        });

        title.addEventListener("mouseout", () => {
            title.style.color = "inherit";
        });
    }
});
