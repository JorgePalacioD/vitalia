/* Captura de pantallas y verificación del prototipo mediante Chrome DevTools Protocol.
   Uso: node herramientas/capturar.js */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawn } = require("child_process");

const RAIZ = path.resolve(__dirname, "..");
const CAPTURAS = path.join(RAIZ, "assets", "capturas");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PUERTO = 9333;

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

const USUARIO_DEMO = {
  nombre: "María Gómez",
  email: "demo@vitalia.co",
  rol: "usuario",
  perfil: {
    edad: 29, sexo: "femenino", peso: 68, altura: 165, nivelActividad: "medio",
    objetivo: "energia", alergias: [], condiciones: "", consentimiento: true
  }
};

const USUARIO_ADMIN = {
  nombre: "Administrador Vitalia",
  email: "admin@vitalia.co",
  rol: "admin",
  perfil: {
    edad: 34, sexo: "masculino", peso: 78, altura: 178, nivelActividad: "alto",
    objetivo: "masa_muscular", alergias: [], condiciones: "", consentimiento: true
  }
};

function iso(fecha) {
  return fecha.toISOString().slice(0, 10);
}
function fechasSemana() {
  const hoy = new Date();
  const desplazamiento = (hoy.getDay() + 6) % 7;
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() - desplazamiento);
  const dias = [];
  for (let i = 0; i < desplazamiento + 1; i++) {
    const d = new Date(lunes);
    d.setDate(lunes.getDate() + i);
    dias.push(iso(d));
  }
  return dias;
}

const DIAS = fechasSemana();
const HABITOS_DEMO = {
  h1: DIAS.slice(-5),
  h2: DIAS.slice(-3),
  h3: DIAS,
  h4: DIAS.slice(-2),
  h5: DIAS.slice(-4)
};

function semilla({ usuario = null, favoritos = [], habitos = {} }) {
  return `(() => {
    localStorage.clear();
    ${usuario ? `localStorage.setItem('vitalia_usuario', ${JSON.stringify(JSON.stringify(usuario))});` : ""}
    localStorage.setItem('vitalia_favoritos', ${JSON.stringify(JSON.stringify(favoritos))});
    localStorage.setItem('vitalia_habitos', ${JSON.stringify(JSON.stringify(habitos))});
    return true;
  })()`;
}

class CDP {
  constructor(url) {
    this.url = url;
    this.id = 0;
    this.pendientes = new Map();
    this.errores = [];
  }
  async conectar() {
    this.ws = new WebSocket(this.url);
    await new Promise((res, rej) => {
      this.ws.addEventListener("open", res);
      this.ws.addEventListener("error", rej);
    });
    this.ws.addEventListener("message", (evento) => {
      const msg = JSON.parse(evento.data);
      if (msg.id && this.pendientes.has(msg.id)) {
        const { resolver, rechazar } = this.pendientes.get(msg.id);
        this.pendientes.delete(msg.id);
        if (msg.error) rechazar(new Error(msg.error.message));
        else resolver(msg.result);
      } else if (msg.method === "Runtime.exceptionThrown") {
        const detalle = msg.params.exceptionDetails;
        this.errores.push(detalle.exception?.description || detalle.text || "Excepción desconocida");
      } else if (msg.method === "Log.entryAdded" && msg.params.entry.level === "error") {
        this.errores.push(msg.params.entry.text);
      }
    });
    return this;
  }
  enviar(metodo, parametros = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method: metodo, params: parametros }));
    return new Promise((resolver, rechazar) => {
      this.pendientes.set(id, { resolver, rechazar });
      setTimeout(() => {
        if (this.pendientes.has(id)) {
          this.pendientes.delete(id);
          rechazar(new Error(`Tiempo de espera agotado: ${metodo}`));
        }
      }, 30000);
    });
  }
  cerrar() {
    try { this.ws.close(); } catch (e) {}
  }
}

async function obtenerObjetivo() {
  for (let intento = 0; intento < 60; intento++) {
    try {
      const respuesta = await fetch(`http://127.0.0.1:${PUERTO}/json/list`);
      const lista = await respuesta.json();
      const pagina = lista.find((t) => t.type === "page");
      if (pagina) return pagina.webSocketDebuggerUrl;
    } catch (e) {}
    await esperar(250);
  }
  throw new Error("No se pudo conectar a Chrome");
}

async function capturar(cdp, { nombre, archivo, hash = "", ancho, alto, movil = false, semillaDatos = null, escala = 1, altoMaximo = 1600 }) {
  const base = `file:///${RAIZ.replace(/\\/g, "/")}`;
  if (semillaDatos) {
    await cdp.enviar("Page.navigate", { url: `${base}/prototipo.html` });
    await esperar(900);
    await cdp.enviar("Runtime.evaluate", { expression: semilla(semillaDatos), returnByValue: true });
  }
  await cdp.enviar("Emulation.setDeviceMetricsOverride", {
    width: ancho, height: alto, deviceScaleFactor: escala, mobile: movil
  });
  const url = `${base}/${archivo}?v=${encodeURIComponent(nombre)}${hash}`;
  await cdp.enviar("Page.navigate", { url });
  await esperar(2400);

  const verificacion = await cdp.enviar("Runtime.evaluate", {
    expression: `(() => {
      const app = document.getElementById('app');
      const imagen = document.querySelector('.hero__arte img');
      return {
        tieneApp: !!app,
        longitud: app ? app.innerText.trim().length : 0,
        titulo: document.title,
        desborde: document.documentElement.scrollWidth - window.innerWidth,
        tarjetas: document.querySelectorAll('.tarjeta').length,
        imagenOk: imagen ? (imagen.complete && imagen.naturalWidth > 0) : null,
        anchoVentana: window.innerWidth,
        cuerpo: document.body.innerText.slice(0, 160)
      };
    })()`,
    returnByValue: true
  });

  const metricas = await cdp.enviar("Page.getLayoutMetrics");
  const contenido = metricas.cssContentSize || metricas.contentSize;
  const anchoFinal = Math.max(ancho, Math.ceil(contenido.width));
  const altoFinal = Math.min(altoMaximo, Math.ceil(contenido.height));

  const captura = await cdp.enviar("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    clip: { x: 0, y: 0, width: anchoFinal, height: altoFinal, scale: movil ? 2 : 1 }
  });
  fs.writeFileSync(path.join(CAPTURAS, `${nombre}.png`), Buffer.from(captura.data, "base64"));

  return {
    nombre,
    ancho: anchoFinal,
    alto: altoFinal,
    contenido: verificacion.result.value
  };
}

(async () => {
  fs.mkdirSync(CAPTURAS, { recursive: true });
  const perfilChrome = path.join(os.tmpdir(), `vitalia-cdp-${Date.now()}`);
  const proceso = spawn(CHROME, [
    "--headless",
    "--disable-gpu",
    "--no-sandbox",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--hide-scrollbars",
    `--remote-debugging-port=${PUERTO}`,
    `--user-data-dir=${perfilChrome}`,
    "about:blank"
  ], { stdio: "ignore" });

  try {
    const ws = await obtenerObjetivo();
    const cdp = await new CDP(ws).conectar();
    await cdp.enviar("Page.enable");
    await cdp.enviar("Runtime.enable");
    await cdp.enviar("Log.enable");

    const PUBLICO = { usuario: null, favoritos: [], habitos: {} };
    const tareas = [
      { nombre: "01-inicio-escritorio", archivo: "prototipo.html", hash: "#/inicio", ancho: 1440, alto: 900, semillaDatos: PUBLICO, altoMaximo: 1700 },
      { nombre: "02-explorar-escritorio", archivo: "prototipo.html", hash: "#/explorar", ancho: 1440, alto: 900, semillaDatos: PUBLICO, altoMaximo: 1700 },
      { nombre: "03-detalle-escritorio", archivo: "prototipo.html", hash: "#/detalle/r1", ancho: 1440, alto: 900, semillaDatos: { usuario: USUARIO_DEMO, favoritos: ["r1"] }, altoMaximo: 1700 },
      { nombre: "04-login-escritorio", archivo: "prototipo.html", hash: "#/login", ancho: 1440, alto: 900, semillaDatos: PUBLICO, altoMaximo: 1200 },
      { nombre: "05-perfil-escritorio", archivo: "prototipo.html", hash: "#/perfil", ancho: 1440, alto: 900, semillaDatos: { usuario: USUARIO_DEMO }, altoMaximo: 1700 },
      { nombre: "06-favoritos-escritorio", archivo: "prototipo.html", hash: "#/favoritos", ancho: 1440, alto: 900, semillaDatos: { usuario: USUARIO_DEMO, favoritos: ["r1", "r5", "r7"] }, altoMaximo: 1300 },
      { nombre: "07-habitos-escritorio", archivo: "prototipo.html", hash: "#/habitos", ancho: 1440, alto: 900, semillaDatos: { usuario: USUARIO_DEMO, habitos: HABITOS_DEMO }, altoMaximo: 1800 },
      { nombre: "08-admin-escritorio", archivo: "prototipo.html", hash: "#/admin", ancho: 1440, alto: 900, semillaDatos: { usuario: USUARIO_ADMIN }, altoMaximo: 1800 },
      { nombre: "09-inicio-movil", archivo: "prototipo.html", hash: "#/inicio", ancho: 390, alto: 844, movil: true, escala: 2, semillaDatos: PUBLICO, altoMaximo: 1500 },
      { nombre: "10-wireframe", archivo: "wireframe.html", hash: "", ancho: 1440, alto: 900, altoMaximo: 16000 },
      { nombre: "11-explorar-movil", archivo: "prototipo.html", hash: "#/explorar", ancho: 390, alto: 844, movil: true, escala: 2, semillaDatos: PUBLICO, altoMaximo: 1600 },
      { nombre: "12-detalle-movil", archivo: "prototipo.html", hash: "#/detalle/r2", ancho: 390, alto: 844, movil: true, escala: 2, semillaDatos: PUBLICO, altoMaximo: 1600 },
      { nombre: "13-inicio-movil-vista", archivo: "prototipo.html", hash: "#/inicio", ancho: 390, alto: 844, movil: true, escala: 2, semillaDatos: PUBLICO, altoMaximo: 844 },
      { nombre: "14-explorar-movil-vista", archivo: "prototipo.html", hash: "#/explorar", ancho: 390, alto: 844, movil: true, escala: 2, semillaDatos: PUBLICO, altoMaximo: 844 },
      { nombre: "15-detalle-movil-vista", archivo: "prototipo.html", hash: "#/detalle/r2", ancho: 390, alto: 844, movil: true, escala: 2, semillaDatos: PUBLICO, altoMaximo: 844 }
    ];

    const resultados = [];
    for (const tarea of tareas) {
      const resultado = await capturar(cdp, tarea);
      resultados.push(resultado);
      console.log(`OK ${resultado.nombre} · ${resultado.ancho}x${resultado.alto} · texto=${resultado.contenido.longitud}`);
    }

    if (cdp.errores.length) {
      console.log("\nERRORES DE CONSOLA:");
      cdp.errores.forEach((e) => console.log(" - " + e));
    } else {
      console.log("\nSin errores de JavaScript.");
    }

    fs.writeFileSync(
      path.join(RAIZ, "herramientas", "verificacion.json"),
      JSON.stringify({ fecha: new Date().toISOString(), resultados, errores: cdp.errores }, null, 2)
    );

    cdp.cerrar();
  } catch (error) {
    console.error("Fallo la captura:", error.message);
    process.exitCode = 1;
  } finally {
    try { proceso.kill(); } catch (e) {}
    await esperar(500);
    try { fs.rmSync(perfilChrome, { recursive: true, force: true }); } catch (e) {}
  }
})();



