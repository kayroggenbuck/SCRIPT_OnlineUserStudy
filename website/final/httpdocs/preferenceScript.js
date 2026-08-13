const panzooms = {};

function initializePreferencePanzoom(wrapperId, containerId) {
    const wrapper = document.getElementById(wrapperId);
    const container = document.getElementById(containerId);

    // Destroy existing instance if it exists
    if (panzooms[wrapperId]) {
        panzooms[wrapperId].destroy?.();
    }

    const instance = Panzoom(wrapper, {
        minScale: 1,
        maxScale: 20,
        step: 0.2,
        contain: "outside",
    });

    panzooms[wrapperId] = instance;

    container.addEventListener("wheel", (event) => {
        event.preventDefault();
        instance.zoomWithWheel(event);
    });

    instance.reset();
}


const comicImageElement =
    document.getElementById("stimulus-image-comic");
comicImageElement.addEventListener("load", () => {
    initializePreferencePanzoom(
        "panzoom-wrapper-comic",
        "preference-container-comic"
    );
}, { once: true });

const screenshotImageElement =
    document.getElementById("stimulus-image-screenshot");
screenshotImageElement.addEventListener("load", () => {
    initializePreferencePanzoom(
        "panzoom-wrapper-screenshot",
        "preference-container-screenshot"
    );
}, { once: true });

let preferenceImages;
let preferenceCurrentIndex;

function initializePreferenceCarousel(){
    preferenceImages = [];
    preferenceCurrentIndex = 0;

    for (let i = 1; i <= 33; i++) {

        preferenceImages.push(
            String(i).padStart(3, "0") + ".jpeg"
        );
    }
    updatePreferenceCarousel();
}

initializePreferenceCarousel();

function updatePreferenceCarousel() {

    screenshotImageElement.src = 
		`stimuli/iterativeScreenshots/hanskenChat/${preferenceImages[preferenceCurrentIndex]}`

    document.getElementById(
        "preference-counter"
    ).textContent =
        `${preferenceCurrentIndex + 1} / ${preferenceImages.length}`;
}

document
    .getElementById("preferenceNextBtn")
    .onclick = () => {

        if (
            preferenceCurrentIndex <
            preferenceImages.length - 1
        ) {

            preferenceCurrentIndex++;

            updatePreferenceCarousel();
        }
    };

document
    .getElementById("preferencePrevBtn")
    .onclick = () => {

        if (
            preferenceCurrentIndex > 0
        ) {

            preferenceCurrentIndex--;

            updatePreferenceCarousel();
        }
    };

function setPreferencePageImages(){
	comicImageElement.src =
        `stimuli/dataComicReports/hanskenChat/comic.png`;
}

setPreferencePageImages();
