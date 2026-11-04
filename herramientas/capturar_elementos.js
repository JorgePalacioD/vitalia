/* Captura figuras individuales del wireframe y del sistema de diseño. */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawn } = require("child_process");

const RAIZ = path.resolve(__dirname, "..");
const CAPTURAS = path.join(RAIZ, "assets", "capturas");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PUERTO = 9334;
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const base = `file:///${RAIZ.replace(/\\/g, "/")}`;

class CDP {
  constructor(url) { this.url = url; this.id = 0; this.pendientes = new Map(); this.errores = []; }
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
        this.errores.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
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
        if (this.pendientes.has(id)) { this.pendientes.delete(id); rechazar(new Error("Timeout " + metodo)); }
      }, 30000);
    });
  }
  cerrar() { try { this.ws.close(); } catch (e) {} }
}

async function objetivo() {
  for (let i = 0; i < 60; i++) {
    try {
      const lista = await (await fetch(`http://127.0.0.1:${PUERTO}/json/list`)).json();
      const pagina = lista.find((t) => t.type === "page");
      if (pagina) return pagina.webSocketDebuggerUrl;
    } catch (e) {}
    await esperar(250);
  }
  throw new Error("Sin conexión con Chrome");
}

async function capturarElemento(cdp, selector, indice, nombre) {
  const resultado = await cdp.enviar("Runtime.evaluate", {
    expression: `(() => {
      const nodos = document.querySelectorAll(${JSON.stringify(selector)});
      const nodo = nodos[${indice}];
      if (!nodo) return null;
      const r = nodo.getBoundingClientRect();
      return { x: r.left + window.scrollX, y: r.top + window.scrollY, width: r.width, height: r.height };
    })()`,
    returnByValue: true
  });
  const caja = resultado.result.value;
  if (!caja) { console.log("No encontrado:", nombre); return; }
  const captura = await cdp.enviar("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    clip: { x: caja.x, y: caja.y, width: caja.width, height: caja.height, scale: 1 }
  });
  fs.writeFileSync(path.join(CAPTURAS, `${nombre}.png`), Buffer.from(captura.data, "base64"));
  console.log(`OK ${nombre} · ${Math.round(caja.width)}x${Math.round(caja.height)}`);
}

(async () => {
  const perfilChrome = path.join(os.tmpdir(), `vitalia-elementos-${Date.now()}`);
  const proceso = spawn(CHROME, [
    "--headless", "--disable-gpu", "--no-sandbox", "--no-first-run",
    "--no-default-browser-check", "--disable-extensions", "--hide-scrollbars",
    `--remote-debugging-port=${PUERTO}`, `--user-data-dir=${perfilChrome}`, "about:blank"
  ], { stdio: "ignore" });

  try {
    const cdp = await new CDP(await objetivo()).conectar();
    await cdp.enviar("Page.enable");
    await cdp.enviar("Runtime.enable");
    await cdp.enviar("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

    await cdp.enviar("Page.navigate", { url: `${base}/wireframe.html` });
    await esperar(2000);
    const nombres = [
      "wf-01-inicio-escritorio", "wf-02-inicio-movil", "wf-03-explorar",
      "wf-04-detalle", "wf-05-login", "wf-06-perfil",
      "wf-07-favoritos", "wf-08-habitos", "wf-09-admin"
    ];
    for (let i = 0; i < nombres.length; i++) {
      await capturarElemento(cdp, "figure.pantalla", i, nombres[i]);
    }

    await cdp.enviar("Page.navigate", { url: `${base}/mockup.html` });
    await esperar(2200);
    await capturarElemento(cdp, "section.mk-seccion", 0, "mk-00-sistema-diseno");

    if (cdp.errores.length) console.log("Errores:", cdp.errores);
    else console.log("Sin errores de JavaScript.");
    cdp.cerrar();
  } catch (error) {
    console.error("Fallo:", error.message);
    process.exitCode = 1;
  } finally {
    try { proceso.kill(); } catch (e) {}
    await esperar(400);
    try { fs.rmSync(perfilChrome, { recursive: true, force: true }); } catch (e) {}
  }
})();
