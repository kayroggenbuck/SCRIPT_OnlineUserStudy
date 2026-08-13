//////////////////////////////////////////////////
// initial setup
//////////////////////////////////////////////////
const userData = {
  education: null,
  occupation: null,
  userId: null,
  stimulus: [],
  answers: [],
  executionTime: [],
  preference: null,
  preferenceExplanation: null,
};

//////////////////////////////////////////////////
// trials
//////////////////////////////////////////////////

const trials = [
  {
    title: "Practice case",
    question: "This is a practice case designed to familiarize you with the controls. You do not need to answer any questions or remember any information from this summary. Once you are comfortable with the controls, type anything in the answer field and click the button below to begin the first use case.",
    folder: "excel",
    fileCount: 62
  },
  {
    title: "Use case 1/3",
    question: "What are the names of the persons investigated throughout the case?",
    folder: "KGE",
    fileCount: 33
  },
  {
    title: "Practice case",
    question: "This is a practice case designed to familiarize you with the controls. You do not need to answer any questions or remember any information from this summary. Once you are comfortable with the controls, type anything in the answer field and click the button below to begin the first use case.",
    folder: "excel",
    fileCount: 62
  },
  {
    title: "Use case 2/3",
    question: "What are the names of the folders that were opened during this use case, and how many items does each folder contain?",
    folder: "hanskenFile",
    fileCount: 33
  },
  {
    title: "Practice case",
    question: "This is a practice case designed to familiarize you with the controls. You do not need to answer any questions or remember any information from this summary. Once you are comfortable with the controls, type anything in the answer field and click the button below to begin the first use case.",
    folder: "excel",
    fileCount: 62
  },
  {
    title: "Use case 3/3",
    question: "An investigator scanned devices to find evidence for a drug smuggling case. Based on the summary, what are the names of the persons directly involved in the crime, and what is each person's role?",
    folder: "hanskenChat",
    fileCount: 33
  }
];

let folder = trials[0].folder;
let fileCount = trials[0].fileCount;

//////////////////////////////////////////////////
// participant ID
//////////////////////////////////////////////////
let currentStep = 0;

userData.userId = localStorage.getItem("userId");

if (!userData.userId) {
  userData.userId = crypto.randomUUID();
  localStorage.setItem("userId", userData.userId);
}

let participantId = userData.userId

function loadStep(step) {
  const trial = trials[step];
  condition = conditionList[step];

  folder = trial.folder
  fileCount = trial.fileCount;

  panzoom.reset();
  if (condition === comicText) {
    loadDataComicReport();
	  
	document.getElementById(
        "carousel-controls"
    ).style.display = "none";
  }
  else {
    initializeCarousel();
    updateCarousel();
	  
    document.getElementById(
        "carousel-controls"
    ).style.display = "block";
  }

  const surveyPageContainer = document.getElementById("survey-page");
  const pageTitleParagraph = surveyPageContainer.querySelector("h2");
  pageTitleParagraph.textContent = trial.title + " (" + condition + ")";

  const questionContainer = document.getElementById("question-container");
  const paragraph = questionContainer.querySelector("p");

  paragraph.textContent = trial.question;

  const textarea = questionContainer.querySelector("textarea");
  textarea.value = "";
	
  initializeInstructions();
}

function nextStep() {
  const answer =
    document
    .getElementById("answer")
    .value
    .trim();

  if (!answer) {

    alert(
        "Please enter an answer."
    );

    return;
  }

  // store response
  userData.answers.push(answer);

  let endTime = Date.now();
  let elapsedSeconds = (endTime - startTime) / 1000;
  userData.executionTime.push(elapsedSeconds.valueOf());
  startTime = Date.now();

  console.log(userData);

  if(!currentStep){
      const submitButton = document.getElementById("submitBtn");
      submitButton.textContent = "Submit"
  }

  currentStep++;

  if (currentStep < trials.length) {
    loadStep(currentStep);
  } else {
    finishStudy();
  }
}

function finishStudy() {
  console.log("Study complete:", userData);

  document.getElementById("survey-page").style.display = "none";
  document.getElementById("preference-page").style.display = "block";
}

//////////////////////////////////////////////////
// condition assignment
//////////////////////////////////////////////////
let firstCondition;
let middleCondition;
let lastCondition;

let comicText = "Comic";
let screenshotText = "Iterative screenshots";

const r1 = Math.random();
const r2 = Math.random();

console.log(r1, r2);

firstCondition =
    r1 > 0.5 ? comicText : screenshotText;

sessionStorage.setItem(
    "firstCondition",
    firstCondition
);

middleCondition =
    r2 > 0.5 ? comicText : screenshotText;

sessionStorage.setItem(
    "middleCondition",
    middleCondition
);

if (middleCondition === comicText) {
    lastCondition = screenshotText;
}
else {
    lastCondition = comicText;
}

let conditionList = [firstCondition, firstCondition, middleCondition, middleCondition, lastCondition, lastCondition];
console.log("Condition:", [firstCondition, middleCondition, lastCondition]);

userData.stimulus = [firstCondition, middleCondition, lastCondition];

let condition = firstCondition;

//////////////////////////////////////////////////
// image references
//////////////////////////////////////////////////

const imageElement =
    document.getElementById("stimulus-image");

const carouselControls =
    document.getElementById("carousel-controls");


//////////////////////////////////////////////////
// zoom controls
//////////////////////////////////////////////////

let panzoom;

const container =
    document.getElementById("stimulus-container");

container.addEventListener("wheel", (event) => {
    if (panzoom) {
        panzoom.zoomWithWheel(event);
    }
});

function initializePanzoom() {

    if (panzoom) {
        panzoom.destroy?.();
    }

    panzoom = Panzoom(document.getElementById("panzoom-wrapper"), {
        minScale: 1,
        maxScale: 20,
        step: 0.2,
		contain: "outside",
    });

    panzoom.reset();
}

imageElement.addEventListener("load", () => {
    initializePanzoom();
    loadStep(currentStep);
}, { once: true });

function initializeInstructions(){
  const questionContainer = document.getElementById("instruction-container");
  const paragraph = questionContainer.querySelector("p");

  let firstText;
  if (condition === comicText) {
      firstText = "Use the mouse wheel or touchpad to zoom in or out and pan by dragging with the mouse.";
  }
  else {
      firstText = "Use the mouse wheel or touchpad to zoom in or out and pan by dragging with the mouse. Use the \"Previous\" and \"Next\" buttons to switch to the screenshot before or after the current one.";
  }
  paragraph.textContent = firstText;
  
}

//////////////////////////////////////////////////
// CONDITION A
//////////////////////////////////////////////////

function setImageWithRetry(url, retries = 3) {
  const img = new Image();

  img.onload = () => {
    imageElement.src = url;
  };

  img.onerror = () => {
    if (retries > 0) {
      setTimeout(() => setImageWithRetry(url, retries - 1), 200);
    } else {
      console.error("Failed to load image:", url);
    }
  };

  img.src = url;
}

function loadDataComicReport(){
    imageElement.src =
        `stimuli/dataComicReports/${folder}/comic.png`;

    carouselControls.style.display =
        "none";
}

if (condition === comicText) {
    loadDataComicReport();
}

//////////////////////////////////////////////////
// CONDITION B
//////////////////////////////////////////////////
let images;
let currentIndex = 0;

function initializeCarousel(){
    images = [];
    currentIndex = 0;

    for (let i = 1; i <= fileCount; i++) {

        images.push(
            String(i).padStart(3, "0") + ".jpeg"
        );
    }
    updateCarousel();
}

initializeCarousel();

function updateCarousel() {

    setImageWithRetry(`stimuli/iterativeScreenshots/${folder}/${images[currentIndex]}`);

    document.getElementById(
        "counter"
    ).textContent =
        `${currentIndex + 1} / ${images.length}`;
}

document
    .getElementById("nextBtn")
    .onclick = () => {

        if (
            currentIndex <
            images.length - 1
        ) {

            currentIndex++;

            updateCarousel();
        }
    };

document
    .getElementById("prevBtn")
    .onclick = () => {

        if (
            currentIndex > 0
        ) {

            currentIndex--;

            updateCarousel();
        }
    };

//////////////////////////////////////////////////
// submission
//////////////////////////////////////////////////

document
    .getElementById("submitBtn")
    .onclick = async () => {
        nextStep();
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };