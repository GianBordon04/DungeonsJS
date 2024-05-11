const personajes = './data.json';

let enemigos = [];
let roles = [];

fetch(personajes)
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al cargar el archivo JSON');
        }
        return response.json();
    })
    .then(data => {
        enemigos = data.enemigos;
        roles = data.roles;
    })
    .catch(error => {
        console.error('Error al cargar el archivo JSON:', error);
    });

let playerName;
let playerRace;
let playerRol;

let playerHealth = 100;
let playerEvasion = 1;
let round = 1;

let damage = 0;
let specialattack = 0;
let specialAttackCount = 0;
let enemigoAleatorio;
let mensajeCombate = "";

let vistaDeCombate;
let historial;

const btnReiniciar = document.createElement("button");


let padre = document.getElementById("padre");
padre.innerHTML = `
        <div>
            <p>Ingresa tu nombre</p>
            <input id="nombre" type="text" placeholder="Nombre"></input>
        </div>
        <div>
            <p>¿Que raza eliges?(humano, elfo, enano)</p>
            <select id="raza">
                <option value="humano">Humano</option>
                <option value="elfo">Elfo</option>
                <option value="enano">Enano</option>
            </select>
        </div>
        <div>
            <p>¿Qué rol eliges? (guerrero, mago, arquero)</p>
            <select id="roles">
                <option value="guerrero">Guerrero</option>
                <option value="mago">Mago</option>
                <option value="arquero">Arquero</option>
            </select>
        </div>
        <button id="btnJugar"> Jugar </button>
    `;
    
function actualizarIntegrantesDeLaBatalla() {
    const integrantesDeLaBatalla = document.getElementById("integrantesDeLaBatalla");

    if (integrantesDeLaBatalla) {
        integrantesDeLaBatalla.innerHTML = ''; // Limpia el contenido existente

        const jugadorDiv = document.createElement("div");
        jugadorDiv.innerHTML = `
        <h4 class="titulos">Jugador</h4>
        <p class="nombres">Nombre: ${playerName}</p>
        <p class="datos">Rol: ${playerRol}</p>
        <p class="datos">Raza: ${playerRace}</p>
        `;
        integrantesDeLaBatalla.appendChild(jugadorDiv);

        const enemigoDiv = document.createElement("div");
        enemigoDiv.innerHTML = `
        <h4 class="titulos">Enemigo</h4>
        <p class="nombre">Nombre: ${enemigoAleatorio.enemyName}</p>
        <p class="datos">Salud: ${enemigoAleatorio.enemyHealth}</p>
        `;
        integrantesDeLaBatalla.appendChild(enemigoDiv);
    } else {
        console.error("Error: El elemento 'integrantesDeLaBatalla' no existe.");
    }
}

let enemyAttack;

function disabledPlay() {
    const btnJugar = document.getElementById("btnJugar");
    btnJugar.disabled = true;
}

// Generador de enemigos aleatorio
function generarEnemigoAleatorio() {
    if (enemigos && enemigos.length > 0) {
        const indiceAleatorio = Math.floor(Math.random() * enemigos.length);
        enemigoAleatorio = enemigos[indiceAleatorio];

        enemyName = enemigoAleatorio.enemyName;
        enemyID = enemigoAleatorio.enemyID;
        enemyHealth = enemigoAleatorio.enemyHealth;
        enemyAttack = enemigoAleatorio.enemyAttack || 0;
    }
}

const btnJugar = document.getElementById("btnJugar");
btnJugar.addEventListener('click', jugar) 
function jugar() {
    playerName = document.getElementById("nombre").value;
    playerRace = document.getElementById("raza").value.toLowerCase();
    playerRol = document.getElementById("roles").value.toLowerCase();

    if (playerName === "" || playerRace === "" || playerRol === "") {
        incompleteInfo(); // Muestra un mensaje de error si algún campo está vacío
        return; // Detiene la ejecución de la función si faltan datos
    }
    

    generarEnemigoAleatorio();
    disabledPlay();

    // Bonus de roles
    const chosenRol = Array.isArray(roles) ? roles.find(rol => rol.name === playerRol) : null;
    if (chosenRol) {
        damage += chosenRol.rolDamage || 0;
        playerHealth += chosenRol.rolHealth || 0;
        playerEvasion += chosenRol.rolEvasion || 0;
    }

    // Bonus de razas
    if (playerRace === "humano") {
        damage += 5;
    } else if (playerRace === "elfo") {
        playerEvasion += 1;
    } else if (playerRace === "enano") {
        playerHealth += 5;
        playerEvasion -= 2;
    }

    localStorage.setItem("nombre", playerName);

    vistaDeCombate = document.getElementById("VistaDeCombate");
    let integrantesDeLaBatalla = document.getElementById("integrantesDeLaBatalla");

    const jugadorDiv = document.createElement("div");
    jugadorDiv.innerHTML = `
        <h4 class="titulos">Jugador</h4>
        <p class="nombres">Nombre: ${playerName}</p>
        <p class="datos">Rol: ${playerRol}</p>
        <p class="datos">Raza: ${playerRace}</p>
    `;
    
    integrantesDeLaBatalla.appendChild(jugadorDiv);

    const enemigoDiv = document.createElement("div");
    enemigoDiv.innerHTML = `
        <h4 class="titulos">Enemigo</h4>
        <p class="nombre">Nombre: ${enemigoAleatorio.enemyName}</p>
        <p class="datos">Salud: ${enemigoAleatorio.enemyHealth}</p>
    `;
    integrantesDeLaBatalla.appendChild(enemigoDiv);

    const accionesDiv = document.createElement("div");
    accionesDiv.classList.add("divBtns");
    accionesDiv.innerHTML = `
        <h4 class="titulos">¿Qué acción tomas? (atacar/defender)</h4>
        <div>
            <button id="btnAtacar" class="botones">Atacar</button>
            <button id="btnDefender" class="botones">Defender</button>
            <button id="btnAtaqueEspecial" class="botones">Ataque Especial</button>
        </div>
    `;
    vistaDeCombate.appendChild(accionesDiv);

    actualizarIntegrantesDeLaBatalla();
    combate();
    checkBattleStatus();
};

function actualizarEstadoBatalla() {
    const estadoBatallaDiv = document.getElementById("estadoBatalla");

    // Actualiza el contenido del div con la información más reciente
    estadoBatallaDiv.innerHTML = `
        <h4 class="titulos">Estado de la batalla</h4>
        <div class="estadoDeIntegrantes">
            <div class="estadoDeJugador">
                <p class="datosDeBatalla">Jugador: ${playerHealth} de salud</p>
                <p class="datosDeBatalla">Daño producido: ${damage}</p>
                <p class="datosDeBatalla">Evasión del jugador: ${playerEvasion}</p>
            </div>
            <div class="estadoDeEnemigo">
                <p class="datosDeBatalla">Enemigo: ${enemyHealth} de salud</p>
                <p class="datosDeBatalla">Ataque del enemigo: ${enemigoAleatorio.enemyAttack}</p>
            </div>
        </div>
        <div class="mensajesCombate">
            <h4 class="titulos">Eventos de combate</h4>
            <p class="datosDeBatalla">${mensajeCombate}</p>
        </div>
    `;

    mensajeCombate = "";
}

// Función que verifica el estado de la batalla
function checkBattleStatus() {
    if (enemyHealth <= 0) {
        endBattle();
        iniciarNuevaRonda();
        round++; 
    } else if (playerHealth <= 0) {
        endBattle();
    }
}

// Función para manejar el combate
function combate() {
    const btnAtacar = document.getElementById("btnAtacar");
    if (btnAtacar) {
        btnAtacar.addEventListener("click", atacar);
    }
    
    const btnDefender = document.getElementById("btnDefender");
    if (btnDefender) {
        btnDefender.addEventListener("click", defender);
    }

    const btnAtaqueEspecial = document.getElementById("btnAtaqueEspecial");
    if(btnAtaqueEspecial){
    btnAtaqueEspecial.addEventListener("click", ataqueEspecial);
}

}

// Función para atacar al enemigo
function atacar() {
    let attackDamage = Math.floor(Math.random() * 20) + 1;
    enemyHealth -= attackDamage;
    let evasionChance = Math.floor(Math.random() * 5) + 1;

    if (evasionChance > playerEvasion) {
        let enemyDamage = Math.floor(Math.random() * 10) + 1;
        playerHealth -= enemyDamage;
        mensajeCombate += `El enemigo ha hecho ${enemyDamage} a el jugador.`;
    } else {
        mensajeCombate += "El jugador ha evadido el ataque del enemigo."
    }
    
    actualizarEstadoBatalla();
    checkBattleStatus();
}

// Función para defenderse del ataque enemigo
function defender() {
    let enemyDamage = Math.floor(Math.random() * 5) + 1;
    playerHealth -= enemyDamage;
    mensajeCombate += `${playerName} se ha defendido de ${enemyName}`
    
    actualizarEstadoBatalla();
    checkBattleStatus();
}

function ataqueEspecial() {
    if (specialAttackCount < 3){
    let specialAttackDamage = Math.floor(Math.random() * 30) + 1;
    enemyHealth -= specialAttackDamage;

    let evasionChance = Math.floor(Math.random() * 5) + 1;

    if (evasionChance > playerEvasion) {
        let enemyDamage = Math.floor(Math.random() * 10) + 1;
        playerHealth -= enemyDamage;
        mensajeCombate += `El enemigo ha hecho ${enemyDamage} al jugador.`;
    } else {
        mensajeCombate += "El jugador ha evadido el ataque del enemigo."
    }
    
    actualizarEstadoBatalla();
    checkBattleStatus();
    
     // Incrementa el contador de Ataque Especial
     specialAttackCount++;

    } else {
        // Si se excede el límite, muestra un mensaje de advertencia
        mensajeCombate += "¡Has alcanzado el límite de ataques especiales por ronda!";
        actualizarEstadoBatalla();
    }
}

// Función para finalizar la batalla
function reiniciarCombate() {
    playerHealth = 100;
    playerEvasion = 1;
    damage = 0;
    round = 1;

    document.getElementById("integrantesDeLaBatalla").innerHTML = '';
    document.getElementById("estadoBatalla").innerHTML = '';
    // document.getElementById("VistaDeCombate").innerHTML = '';
    
    document.getElementById("nombre").value = "";
    document.getElementById("raza").value = "humano";
    document.getElementById("roles").value = "guerrero";
  
    document.getElementById("btnJugar").disabled = false;
    
    mensajeCombate = "";
    
    const historial = document.getElementById("historial")
    historial.innerHTML = ''
    
    btnReiniciar.hidden = true
    
    generarEnemigoAleatorio();
    iniciarNuevaRonda();

    // Elimina el contenedor de botones al final
    let btns = document.querySelector(".divBtns")
    btns.remove()
}

// Función para iniciar una nueva ronda después de que el jugador gane la batalla
function iniciarNuevaRonda() {
    enemyHealth = enemigoAleatorio.enemyHealth;
    
    document.getElementById("btnAtacar").disabled = false;
    document.getElementById("btnDefender").disabled = false;
    document.getElementById("btnAtaqueEspecial").disabled = false;

     // Reinicia el contador de Ataque Especial
     specialAttackCount = 0;

    actualizarEstadoBatalla();
    actualizarIntegrantesDeLaBatalla();
}

function endBattle() {
    document.getElementById("btnAtacar").disabled = true;
    document.getElementById("btnDefender").disabled = true;
    document.getElementById("btnAtaqueEspecial").disabled = true;
    historial = document.getElementById('historial')

    if (playerHealth <= 0) {
        playerLose();

        btnReiniciar.id = "btnReiniciar";
        btnReiniciar.textContent = "Reiniciar juego";
        btnReiniciar.addEventListener("click", reiniciarCombate);

        btnReiniciar.hidden = false

        // Usa querySelector para obtener el elemento VistaDeCombate
        const vistaDeCombate = document.querySelector("#VistaDeCombate");
        const existingBtnReiniciar = vistaDeCombate.querySelector("#btnReiniciar");
        if (!existingBtnReiniciar) {
            vistaDeCombate.appendChild(btnReiniciar);
        }

    } else if (enemyHealth <= 0) {
        playerHealth += 5;

        iniciarNuevaRonda();
        generarEnemigoAleatorio();
        enemyLose();
    }

    const battleHistory = [];
    const battleEntry = {
    playerName: playerName,
    round: round,
    outcome: playerHealth > 0 ? "Victoria" : "Derrota",
    enemyName: enemyName,
    };
    battleHistory.push(battleEntry);
    localStorage.setItem("battleHistory", JSON.stringify(battleHistory));

    for (const entry of battleHistory) {
        const historyItem = document.createElement('div');
        historyItem.classList.add('historial-item');

        historyItem.innerHTML = `
            <div class="historial">
                <p>Jugador: ${entry.playerName}</p>
                <p>Ronda: ${entry.round}</p>
                <p>Resultado: ${entry.outcome}</p>
                <p>Enemigo: ${entry.enemyName}</p>
            </div>
        `;
    
        historial.appendChild(historyItem);
    }
}

function playerLose() {
    Toastify({
        text: `${playerName} has perdido el juego ¡Intentalo de nuevo!`,
        duration: 3000,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
            background: "linear-gradient(90deg, rgba(233,49,49,1) 37%, rgba(249,165,165,1) 100%)"
        },
        onClick: function(){}
    }).showToast();
}

function enemyLose() {
    Toastify({
        text: `Le has ganado a ${enemyName} ¡Sigue así! ¡Ganaste 50 de vida!`,
        duration: 3000,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
            background: "linear-gradient(90deg, rgba(87,199,74,1) 23%, rgba(165,249,187,1) 100%)"
        },
        onClick: function(){}
    }).showToast();
}

function incompleteInfo() {
    Toastify({
        text: `Debes completar todos los espacios para jugar`,
        duration: 3000,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
            background: "linear-gradient(90deg, rgba(87,199,74,1) 23%, rgba(165,249,187,1) 100%)"
        },
        onClick: function(){}
    }).showToast();
}

combate();