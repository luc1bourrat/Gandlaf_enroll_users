/* ===== Variables Globales ===== */

let courses = []; // Stocker les courses1 du JSON
let selectedCourses = []; // Stocker les cours sélectionnés
let emailsData = []; // Stocker les données des utilisateurs pour la méthode manuelle
let automatedData = []; // Stocker les données du JSON automatisé
let filteredData = []; // Stocker les données filtrées après sélection de l'idnumber
let idnumbers = new Set(); // Stocker les idnumbers uniques
let isGroup2Generated = false; // Pour savoir si les groupes uniques sont générés

const groupTrigramMap = {
    TOULOUSE: "TLS",
    NICE: "NCE",
    COTONOU: "COT",
    PARIS: "PAR",
    MARSEILLE: "MAR",
    STRASBOURG: "STG",
    LILLE: "LIL",
    NANCY: "NCY",
    MONTPELLIER: "MPL",
    RENNES: "REN",
    NANTES: "NAN",
    LYON: "LYN",
    BORDEAUX: "BOR",
    "SAINT-ANDRÉ": "REU",
    MULHOUSE: "MUL",
};

const groups = [
    "all_BORDEAUX",
    "all_COTONOU",
    "all_LILLE",
    "all_LYON",
    "all_MARSEILLE",
    "all_MONTPELLIER",
    "all_MULHOUSE",
    "all_NANCY",
    "all_NANTES",
    "all_NICE",
    "all_PARIS",
    "all_RENNES",
    "all_SAINT-ANDRÉ",
    "all_STRASBOURG",
    "all_TOULOUSE",
];

/* ===== Gestion des cours (Step 2.2) ===== */

// Gestion de la sélection du fichier JSON
document
    .getElementById("jsonFileInput")
    .addEventListener("change", handleFileSelect);
document
    .getElementById("selectAllButton")
    .addEventListener("click", selectAllCourses);

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target.result);
                displayCourses(jsonData);
            } catch (error) {
                alert("Le fichier JSON est invalide.");
            }
        };
        reader.readAsText(file);
    }
}

function displayCourses(data) {
    const courseList = document.getElementById("courseList");
    courseList.innerHTML = ""; // Réinitialiser la liste actuelle

    courses = data.map((item) => item.course1).sort(); // Extraire et trier les courses1

    const years = new Set(); // Set pour stocker les années uniques

    courses.forEach((course, index) => {
        const year = course.split("_").pop(); // Extraire l'année après le dernier "_"
        years.add(year); // Ajouter l'année au set

        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <input type="checkbox" id="course${index}" value="${course}">
            <label for="course${index}">${course}</label>
        `;
        courseList.appendChild(listItem);
    });

    generateYearButtons(Array.from(years)); // Générer les boutons pour chaque année
}

function generateYearButtons(years) {
    const buttonContainer = document.getElementById("yearButtons");
    buttonContainer.innerHTML = ""; // Vider le conteneur des boutons existants

    // Ajouter le texte "Sélection rapide :"
    const quickSelectText = document.createElement("span");
    quickSelectText.textContent = "Sélection rapide : ";
    quickSelectText.style.fontWeight = "bold"; // Pour un peu de style
    buttonContainer.appendChild(quickSelectText);

    // Générer un bouton pour chaque année
    years.forEach((year) => {
        const button = document.createElement("button");
        button.textContent = year; // Afficher simplement l'année sur le bouton
        button.addEventListener("click", () => selectCoursesByYear(year)); // Ajouter l'événement de clic
        buttonContainer.appendChild(button);
    });
}

function selectCoursesByYear(year) {
    const checkboxes = document.querySelectorAll(
        '#courseList input[type="checkbox"]'
    );
    let allSelected = true;

    // Vérifier si tous les cours de cette année sont déjà sélectionnés
    checkboxes.forEach((checkbox) => {
        if (checkbox.value.includes(year) && !checkbox.checked) {
            allSelected = false; // Si un seul élément n'est pas sélectionné, on désactive cette variable
        }
    });

    // Si tous les éléments sont sélectionnés, on les désélectionne
    checkboxes.forEach((checkbox) => {
        if (checkbox.value.includes(year)) {
            checkbox.checked = !allSelected; // Inverser la sélection selon l'état général
        }
    });
}

// Sélectionner tous les cours
function selectAllCourses() {
    const checkboxes = document.querySelectorAll(
        '#courseList input[type="checkbox"]'
    );
    checkboxes.forEach((checkbox) => (checkbox.checked = true));
}

// Mettre à jour les cours sélectionnés
function updateSelectedCourses() {
    const checkboxes = document.querySelectorAll(
        '#courseList input[type="checkbox"]'
    );
    selectedCourses = Array.from(checkboxes)
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) => checkbox.value);

    if (selectedCourses.length === 0) {
        alert(
            "Aucun cours sélectionné. Veuillez sélectionner au moins un cours."
        );
        return false;
    }
    return true;
}

/* ===== Méthode manuelle (Step 2.3) ===== */

document
    .getElementById("processEmailsButton")
    .addEventListener("click", processEmails);

function processEmails() {
    filteredData = []; // Réinitialiser les données de la méthode automatisée

    const emailInput = document.getElementById("emailInput").value;
    const emailList = document.getElementById("emailList");
    emailList.innerHTML = ""; // Vider la liste actuelle

    const emails = emailInput
        .split(/[\s,;]+/)
        .filter((email) => email.trim() !== "");
    emailsData = emails.map((email, index) => ({
        username: email.trim(),
        group1: "",
        role1: "teacher",
        group2: "",
    }));

    emails.forEach((email, index) => {
        const listItem = document.createElement("li");

        // Création du menu déroulant pour group1
        let selectGroup = generateSelect(
            `groupSelect${index}`,
            groups,
            groups[0],
            `updateGroup(${index})`
        );

        // Création du menu déroulant pour role1
        let selectRole = generateSelect(
            `roleSelect${index}`,
            ["student", "teacher"],
            "student",
            `updateRole(${index})`
        );

        listItem.innerHTML = `<span>${email.trim()}</span> ${selectGroup} ${selectRole}`;
        emailList.appendChild(listItem);

        // Capturer les valeurs par défaut
        emailsData[index].group1 = document.getElementById(
            `groupSelect${index}`
        ).value;
        emailsData[index].role1 = document.getElementById(
            `roleSelect${index}`
        ).value;
    });
}

// Générer un élément <select> HTML
function generateSelect(id, options, defaultValue, onChangeFunction) {
    let select = `<select id="${id}" onchange="${onChangeFunction}">`;
    options.forEach((option) => {
        const isSelected = option === defaultValue ? "selected" : "";
        select += `<option value="${option}" ${isSelected}>${option}</option>`;
    });
    select += `</select>`;
    return select;
}

function updateGroup(index) {
    const selectedGroup = document.getElementById(`groupSelect${index}`).value;
    emailsData[index].group1 = selectedGroup; // Mettre à jour group1
}

function updateRole(index) {
    const selectedRole = document.getElementById(`roleSelect${index}`).value;
    emailsData[index].role1 = selectedRole; // Mettre à jour role1
}

/* ===== Méthode automatisée (Step 2.3) ===== */

document
    .getElementById("processAutomatedJsonButton")
    .addEventListener("click", processAutomatedJson);
document
    .getElementById("filterIdnumberButton")
    .addEventListener("click", filterByIdnumber);

function processAutomatedJson() {
    const file = document.getElementById("automatedJsonFile").files[0];
    if (!file) {
        alert("Veuillez sélectionner un fichier JSON.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const jsonData = JSON.parse(e.target.result);
            automatedData = jsonData; // Stocker les données JSON
            populateIdnumberSelect(jsonData); // Remplir le select idnumber
        } catch (error) {
            alert("Le fichier JSON est invalide.");
        }
    };
    reader.readAsText(file);
}

// Remplir la liste des idnumbers uniques et les trier par ordre alphabétique
function populateIdnumberSelect(data) {
    idnumbers = new Set(data.map((item) => item.idnumber)); // Récupérer les idnumbers uniques
    const sortedIdnumbers = Array.from(idnumbers).sort(); // Trier les idnumbers

    const idnumberSelect = document.getElementById("idnumberSelect");
    idnumberSelect.innerHTML = ""; // Vider le select

    sortedIdnumbers.forEach((idnumber) => {
        const option = document.createElement("option");
        option.value = idnumber;
        option.textContent = idnumber;
        idnumberSelect.appendChild(option);
    });

    // Afficher les éléments de filtrage
    idnumberSelect.style.display = "inline";
    document.getElementById("filterIdnumberButton").style.display = "inline";
}

// Filtrer les données en fonction de l'idnumber choisi
function filterByIdnumber() {
    emailsData = []; // Effacer les données de la méthode manuelle

    const selectedIdnumber = document.getElementById("idnumberSelect").value;
    filteredData = automatedData.filter(
        (item) => item.idnumber === selectedIdnumber
    );

    // Afficher les données filtrées
    displayFilteredData(filteredData);
}

// Afficher les données filtrées
function displayFilteredData(data) {
    const emailList = document.getElementById("emailList");
    emailList.innerHTML = ""; // Réinitialiser la liste actuelle

    data.forEach((item) => {
        const group1 = `all_${item.city.toUpperCase()}`;
        const role1 = item.idnumber === "staff" ? "teacher" : "student";

        const listItem = document.createElement("li");
        listItem.textContent = `${item.username} - ${group1} - ${role1}`;
        emailList.appendChild(listItem);
    });
}

/* ===== Génération de groupes uniques (Step 2.3 - optionnel) ===== */

document
    .getElementById("generateUniqueGroupButton")
    .addEventListener("click", generateUniqueGroups);

// Générer des groupes uniques pour chaque utilisateur (manuelle et automatisée)
function generateUniqueGroups() {
    const emailList = document.getElementById("emailList");
    emailList.innerHTML = ""; // Réinitialiser la liste

    // Générer des groupes uniques pour les données manuelles
    emailsData.forEach((user, index) => {
        const group1 = user.group1.split("_")[1]; // Extraire la ville depuis group1 (ex: all_PARIS -> PARIS)
        const trigram = groupTrigramMap[group1]; // Récupérer le trigramme de la ville
        const usernameWithoutDomain = user.username.split("@")[0]; // Récupérer le login sans "@epitech.eu"

        // Générer le group2 unique sous la forme "XXX_username"
        const group2 = `${trigram}_${usernameWithoutDomain}`;
        user.group2 = group2;

        // Mettre à jour la liste avec group2
        const listItem = document.createElement("li");
        listItem.textContent = `${user.username} - ${user.group1} - ${user.role1} - ${group2}`;
        emailList.appendChild(listItem);
    });

    // Générer des groupes uniques pour les données filtrées (automatique)
    filteredData.forEach((item, index) => {
        const group1 = `all_${item.city.toUpperCase()}`;
        const trigram = groupTrigramMap[item.city.toUpperCase()]; // Récupérer le trigramme de la ville
        const usernameWithoutDomain = item.username.split("@")[0]; // Récupérer le login sans "@epitech.eu"

        // Générer le group2 unique sous la forme "XXX_username"
        const group2 = `${trigram}_${usernameWithoutDomain}`;
        item.group2 = group2;

        // Mettre à jour la liste avec group2
        const listItem = document.createElement("li");
        listItem.textContent = `${item.username} - ${group1} - ${
            item.idnumber === "staff" ? "teacher" : "student"
        } - ${group2}`;
        emailList.appendChild(listItem);
    });

    isGroup2Generated = true; // Indiquer que les groupes uniques ont été générés
}

/* ===== Génération du CSV (Step 2.4) ===== */

document
    .getElementById("generateCsvPreviewButton")
    .addEventListener("click", generateCsvPreview);
document
    .getElementById("downloadCsvButton")
    .addEventListener("click", downloadCsv);

// Générer l'aperçu du CSV
function generateCsvPreview() {
    const tableBody = document.querySelector("#csvPreviewTable tbody");
    tableBody.innerHTML = ""; // Réinitialiser le tableau actuel

    if (!updateSelectedCourses()) return; // S'assurer que des cours sont sélectionnés

    const userData = getAllUserData(); // Obtenir les données de toutes les méthodes

    if (userData.length === 0 || selectedCourses.length === 0) {
        alert("Aucune donnée ou aucun cours sélectionné.");
        return;
    }

    // Remplir le tableau d'aperçu
    selectedCourses.forEach((course) => {
        userData.forEach((data) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${data.username}</td>
                <td>${course}</td>
                <td>${data.group1}</td>
                <td>${data.role1}</td>
                <td>${data.group2}</td> <!-- Afficher la valeur de Group2 -->
            `;
            tableBody.appendChild(row);
        });
    });

    document.getElementById("downloadCsvButton").style.display = "block"; // Afficher le bouton de téléchargement
}

// Télécharger le CSV
function downloadCsv() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent +=
        "Username;Course1;Group1;Role1" +
        (isGroup2Generated ? ";Group2\n" : "\n");

    const userData = getAllUserData(); // Obtenir les données combinées

    selectedCourses.forEach((course) => {
        userData.forEach((data) => {
            const row =
                `${data.username};${course};${data.group1};${data.role1}` +
                (isGroup2Generated ? `;${data.group2}\n` : "\n");
            csvContent += row;
        });
    });

    const encodedUri = encodeURI(csvContent);

    // Générer l'horodatage dans un format plus lisible
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Les mois sont de 0 à 11
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    // Format lisible : YYYY-MM-DD_HH-MM-SS
    const timestamp = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;

    // Créer le nom du fichier avec l'horodatage lisible
    const fileName = `users_courses_${timestamp}.csv`;

    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Combiner les données de la méthode manuelle et automatisée
function getAllUserData() {
    let allData = [];

    // Ajouter les données de la méthode manuelle
    emailsData.forEach((emailData) => {
        const group1 = emailData.group1.split("_")[1]; // Extraire la ville depuis group1 (ex: all_PARIS -> PARIS)
        const trigram = groupTrigramMap[group1]; // Récupérer le trigramme de la ville
        const usernameWithoutDomain = emailData.username.split("@")[0]; // Récupérer le login sans "@epitech.eu"

        // Générer le group2 unique sous la forme "XXX_username"
        const group2 = `${trigram}_${usernameWithoutDomain}`;

        allData.push({
            username: emailData.username,
            group1: emailData.group1,
            role1: emailData.role1,
            group2: isGroup2Generated ? group2 : "", // Utiliser le trigramme correct
        });
    });

    // Ajouter les données de la méthode automatisée
    filteredData.forEach((item) => {
        const group1 = `all_${item.city.toUpperCase()}`;
        const trigram = groupTrigramMap[item.city.toUpperCase()]; // Récupérer le trigramme de la ville
        const usernameWithoutDomain = item.username.split("@")[0]; // Récupérer le login sans "@epitech.eu"

        // Générer le group2 unique sous la forme "XXX_username"
        const group2 = `${trigram}_${usernameWithoutDomain}`;

        allData.push({
            username: item.username,
            group1: group1,
            role1: item.idnumber === "staff" ? "teacher" : "student",
            group2: isGroup2Generated ? group2 : "", // Utiliser le trigramme correct
        });
    });

    return allData;
}

// Scroll vers la Step 2.4
document
    .getElementById("scrollToStep24")
    .addEventListener("click", function () {
        document
            .getElementById("step24")
            .scrollIntoView({ behavior: "smooth" });
    });

// Scroll vers la Step 3
document.getElementById("scrollToStep3").addEventListener("click", function () {
    document.getElementById("step3").scrollIntoView({ behavior: "smooth" });
});
