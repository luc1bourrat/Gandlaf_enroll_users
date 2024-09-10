/* ===== Variables Globales ===== */

let courses = []; // Stocker les courses1 du JSON
let selectedCourses = []; // Stocker les cours sélectionnés
let emailsData = []; // Stocker les données des utilisateurs pour la méthode manuelle
let automatedData = []; // Stocker les données du JSON automatisé
let filteredData = []; // Stocker les données filtrées après sélection de l'idnumber
let idnumbers = new Set(); // Stocker les idnumbers uniques

const groups = [
    "all_BORDEAUX", "all_COTONOU", "all_LILLE", "all_LYON", "all_MARSEILLE", "all_MONTPELLIER",
    "all_MULHOUSE", "all_NANCY", "all_NANTES", "all_NICE", "all_PARIS", "all_RENNES",
    "all_SAINT-ANDRÉ", "all_STRASBOURG", "all_TOULOUSE"
];

/* ===== Gestion des cours (Step 2.2) ===== */

// Gestion de la sélection du fichier JSON
document.getElementById('jsonFileInput').addEventListener('change', handleFileSelect);
document.getElementById('selectAllButton').addEventListener('click', selectAllCourses);

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

// Afficher les courses1 du JSON dans une liste avec des cases à cocher
function displayCourses(data) {
    const courseList = document.getElementById('courseList');
    courseList.innerHTML = ''; // Réinitialiser la liste actuelle
    courses = data.map(item => item.course1); // Extraire uniquement les courses1

    courses.forEach((course, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <input type="checkbox" id="course${index}" value="${course}">
            <label for="course${index}">${course}</label>
        `;
        courseList.appendChild(listItem);
    });
}

// Sélectionner tous les cours
function selectAllCourses() {
    const checkboxes = document.querySelectorAll('#courseList input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = true);
}

// Mettre à jour les cours sélectionnés
function updateSelectedCourses() {
    const checkboxes = document.querySelectorAll('#courseList input[type="checkbox"]');
    selectedCourses = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    if (selectedCourses.length === 0) {
        alert('Aucun cours sélectionné. Veuillez sélectionner au moins un cours.');
        return false;
    }
    return true;
}

/* ===== Méthode manuelle (Step 2.3) ===== */

document.getElementById('processEmailsButton').addEventListener('click', processEmails);

function processEmails() {
    filteredData = []; // Réinitialiser les données de la méthode automatisée

    const emailInput = document.getElementById('emailInput').value;
    const emailList = document.getElementById('emailList');
    emailList.innerHTML = ''; // Vider la liste actuelle

    const emails = emailInput.split(/[\s,;]+/).filter(email => email.trim() !== '');
    emailsData = emails.map((email, index) => ({ username: email.trim(), group1: "", role1: "teacher" }));

    emails.forEach((email, index) => {
        const listItem = document.createElement('li');

        // Création du menu déroulant pour group1
        let selectGroup = `<select id="groupSelect${index}" onchange="updateGroup(${index})">`;
        groups.forEach(group => {
            selectGroup += `<option value="${group}">${group}</option>`;
        });
        selectGroup += `</select>`;

        // Création du menu déroulant pour role1
        let selectRole = `
            <select id="roleSelect${index}" onchange="updateRole(${index})">
                <option value="teacher" selected>teacher</option>
                <option value="student">student</option>
            </select>
        `;

        listItem.innerHTML = `<span>${email.trim()}</span> ${selectGroup} ${selectRole}`;
        emailList.appendChild(listItem);

        // Capturer les valeurs par défaut
        emailsData[index].group1 = document.getElementById(`groupSelect${index}`).value;
        emailsData[index].role1 = document.getElementById(`roleSelect${index}`).value;
    });
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

document.getElementById('processAutomatedJsonButton').addEventListener('click', processAutomatedJson);
document.getElementById('filterIdnumberButton').addEventListener('click', filterByIdnumber);

function processAutomatedJson() {
    const file = document.getElementById('automatedJsonFile').files[0];
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
    idnumbers = new Set(data.map(item => item.idnumber)); // Récupérer les idnumbers uniques
    const sortedIdnumbers = Array.from(idnumbers).sort(); // Trier les idnumbers

    const idnumberSelect = document.getElementById('idnumberSelect');
    idnumberSelect.innerHTML = ''; // Vider le select

    sortedIdnumbers.forEach(idnumber => {
        const option = document.createElement('option');
        option.value = idnumber;
        option.textContent = idnumber;
        idnumberSelect.appendChild(option);
    });

    // Afficher les éléments de filtrage
    idnumberSelect.style.display = 'inline';
    document.getElementById('filterIdnumberButton').style.display = 'inline';
}

// Filtrer les données en fonction de l'idnumber choisi
function filterByIdnumber() {
    emailsData = []; // Effacer les données de la méthode manuelle

    const selectedIdnumber = document.getElementById('idnumberSelect').value;
    filteredData = automatedData.filter(item => item.idnumber === selectedIdnumber);

    // Afficher les données filtrées
    displayFilteredData(filteredData);
}

// Afficher les données filtrées
function displayFilteredData(data) {
    const emailList = document.getElementById('emailList');
    emailList.innerHTML = ''; // Réinitialiser la liste actuelle

    data.forEach(item => {
        const group1 = `all_${item.city.toUpperCase()}`;
        const role1 = item.idnumber === "staff" ? "teacher" : "student";

        const listItem = document.createElement('li');
        listItem.textContent = `${item.username} - ${group1} - ${role1}`;
        emailList.appendChild(listItem);
    });
}

/* ===== Génération du CSV (Step 2.4) ===== */

document.getElementById('generateCsvPreviewButton').addEventListener('click', generateCsvPreview);
document.getElementById('downloadCsvButton').addEventListener('click', downloadCsv);

// Générer l'aperçu du CSV
function generateCsvPreview() {
    const tableBody = document.querySelector('#csvPreviewTable tbody');
    tableBody.innerHTML = ''; // Réinitialiser le tableau actuel

    if (!updateSelectedCourses()) return; // S'assurer que des cours sont sélectionnés

    const userData = getAllUserData(); // Obtenir les données de toutes les méthodes

    if (userData.length === 0 || selectedCourses.length === 0) {
        alert("Aucune donnée ou aucun cours sélectionné.");
        return;
    }

    // Remplir le tableau d'aperçu
    selectedCourses.forEach(course => {
        userData.forEach(data => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${data.username}</td>
                <td>${course}</td>
                <td>${data.group1}</td>
                <td>${data.role1}</td>
            `;
            tableBody.appendChild(row);
        });
    });

    document.getElementById('downloadCsvButton').style.display = 'block'; // Afficher le bouton de téléchargement
}

// Télécharger le CSV
function downloadCsv() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Username;Course1;Group1;Role1\n";

    const userData = getAllUserData(); // Obtenir les données combinées

    selectedCourses.forEach(course => {
        userData.forEach(data => {
            const row = `${data.username};${course};${data.group1};${data.role1}`;
            csvContent += row + "\n";
        });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'users_courses.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Combiner les données de la méthode manuelle et automatisée
function getAllUserData() {
    let allData = [];

    // Ajouter les données de la méthode manuelle
    emailsData.forEach(emailData => {
        allData.push({
            username: emailData.username,
            group1: emailData.group1,
            role1: emailData.role1
        });
    });

    // Ajouter les données de la méthode automatisée
    filteredData.forEach(item => {
        const group1 = `all_${item.city.toUpperCase()}`;
        const role1 = item.idnumber === "staff" ? "teacher" : "student";

        allData.push({
            username: item.username,
            group1: group1,
            role1: role1
        });
    });

    return allData;
}
