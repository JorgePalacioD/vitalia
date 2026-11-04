/* ============================================================
   VITALIA · Lógica del prototipo navegable
   Rutas: #/inicio #/explorar #/detalle/:id #/login #/perfil
          #/favoritos #/habitos #/admin
   ============================================================ */

(function () {
  "use strict";

  const CLAVES = {
    usuario: "vitalia_usuario",
    favoritos: "vitalia_favoritos",
    habitos: "vitalia_habitos",
    contenidos: "vitalia_contenidos",
    cuentas: "vitalia_cuentas"
  };

  const copia = (valor) => JSON.parse(JSON.stringify(valor));

  function leer(clave, porDefecto) {
    try {
      const dato = localStorage.getItem(clave);
      return dato ? JSON.parse(dato) : porDefecto;
    } catch (error) {
      return porDefecto;
    }
  }

  const estado = {
    usuario: leer(CLAVES.usuario, null),
    favoritos: leer(CLAVES.favoritos, []),
    habitos: leer(CLAVES.habitos, {}),
    contenidos: leer(CLAVES.contenidos, null) || copia(RECOMENDACIONES),
    cuentas: leer(CLAVES.cuentas, []),
    filtros: { q: "", categoria: "todas", nivel: "todos", duracion: "todas", orden: "relevancia" },
    tabAuth: "login",
    editando: null
  };

  function persistir() {
    localStorage.setItem(CLAVES.usuario, JSON.stringify(estado.usuario));
    localStorage.setItem(CLAVES.favoritos, JSON.stringify(estado.favoritos));
    localStorage.setItem(CLAVES.habitos, JSON.stringify(estado.habitos));
    localStorage.setItem(CLAVES.contenidos, JSON.stringify(estado.contenidos));
    localStorage.setItem(CLAVES.cuentas, JSON.stringify(estado.cuentas));
  }

  const esc = (valor) =>
    String(valor ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const icono = (nombre, clase = "") =>
    `<svg class="${clase}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONOS[nombre] || ""}</svg>`;

  const catDe = (rec) => CATEGORIAS[rec.categoria] || CATEGORIAS.bienestar;
  const porId = (id) => estado.contenidos.find((rec) => rec.id === id);

  function toast(mensaje) {
    const nodo = document.getElementById("toast");
    if (!nodo) return;
    nodo.innerHTML = `${icono("check")}<span>${esc(mensaje)}</span>`;
    nodo.classList.add("visible");
    clearTimeout(toast.temporizador);
    toast.temporizador = setTimeout(() => nodo.classList.remove("visible"), 2800);
  }

  /* ------------------------- Utilidades de fecha ------------------------- */
  function iso(fecha) {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, "0");
    const d = String(fecha.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  function lunesDeLaSemana() {
    const hoy = new Date();
    const desplazamiento = (hoy.getDay() + 6) % 7;
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - desplazamiento);
    lunes.setHours(0, 0, 0, 0);
    return lunes;
  }
  function diasDeLaSemana() {
    const lunes = lunesDeLaSemana();
    return Array.from({ length: 7 }, (_, i) => {
      const dia = new Date(lunes);
      dia.setDate(lunes.getDate() + i);
      return dia;
    });
  }
  const NOMBRES_DIA = ["L", "M", "X", "J", "V", "S", "D"];

  /* ------------------------- Personalización (RF4) ------------------------- */
  function perfil() {
    return estado.usuario && estado.usuario.perfil ? estado.usuario.perfil : null;
  }
  function esCompatible(rec) {
    const p = perfil();
    if (!p || !Array.isArray(p.alergias) || p.alergias.length === 0) return true;
    return !rec.contiene.some((item) => p.alergias.includes(item));
  }
  function puntaje(rec) {
    const p = perfil();
    if (!p) return 0;
    let total = 0;
    if (p.objetivo && rec.objetivos.includes(p.objetivo)) total += 5;
    if (p.objetivo === "bajar_peso" && rec.categoria === "actividad") total += 1;
    if (p.objetivo === "mejor_descanso" && rec.categoria === "descanso") total += 1;
    if (p.objetivo === "reducir_estres" && rec.categoria === "bienestar") total += 1;
    if (p.nivelActividad === "bajo" && rec.nivel === "Fácil") total += 2;
    if (p.nivelActividad === "alto" && rec.nivel !== "Fácil") total += 2;
    if (!esCompatible(rec)) total -= 20;
    return total;
  }
  function recomendadas(limite) {
    const lista = [...estado.contenidos].sort((a, b) => puntaje(b) - puntaje(a));
    return limite ? lista.slice(0, limite) : lista;
  }
  function progresoSemanal() {
    const dias = diasDeLaSemana().slice(0, ((new Date().getDay() + 6) % 7) + 1);
    const total = HABITOS_BASE.length * dias.length;
    if (!total) return 0;
    let hechos = 0;
    HABITOS_BASE.forEach((habito) => {
      const registro = estado.habitos[habito.id] || [];
      dias.forEach((dia) => {
        if (registro.includes(iso(dia))) hechos += 1;
      });
    });
    return Math.round((hechos / total) * 100);
  }
  function rachaDe(habitoId) {
    const registro = estado.habitos[habitoId] || [];
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    if (!registro.includes(iso(cursor))) cursor.setDate(cursor.getDate() - 1);
    let racha = 0;
    while (registro.includes(iso(cursor))) {
      racha += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return racha;
  }
  function totalRegistros() {
    return Object.values(estado.habitos).reduce((suma, lista) => suma + lista.length, 0);
  }

  /* ------------------------- Componentes ------------------------- */
  function tarjeta(rec) {
    const cat = catDe(rec);
    const favorito = estado.favoritos.includes(rec.id);
    return `
      <article class="tarjeta">
        <div class="tarjeta__media" style="--cat:${cat.color}">
          ${icono(cat.icono, "tarjeta__icono")}
          <span class="etiqueta-cat">${esc(cat.nombre)}</span>
          <button class="fav-btn" type="button" data-action="toggle-fav" data-id="${esc(rec.id)}"
            aria-pressed="${favorito}" aria-label="${favorito ? "Quitar de favoritos" : "Guardar en favoritos"}: ${esc(rec.titulo)}">
            ${icono("corazon")}
          </button>
        </div>
        <div class="tarjeta__cuerpo">
          <div class="tarjeta__meta">
            ${icono("reloj")}<span>${esc(rec.duracion)}</span>
            <span>·</span>
            ${icono("nivel")}<span>${esc(rec.nivel)}</span>
          </div>
          <h3><a href="#/detalle/${esc(rec.id)}">${esc(rec.titulo)}</a></h3>
          <p>${esc(rec.resumen)}</p>
          <div class="tags">${rec.tags.slice(0, 2).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
          <div class="tarjeta__pie">
            <a class="btn btn--texto btn--sm" href="#/detalle/${esc(rec.id)}">Ver recomendación ${icono("flecha")}</a>
          </div>
        </div>
      </article>`;
  }

  function opciones(mapa, seleccionado) {
    return Object.entries(mapa)
      .map(([clave, valor]) => `<option value="${esc(clave)}" ${seleccionado === clave ? "selected" : ""}>${esc(valor)}</option>`)
      .join("");
  }

  function aviso(mensaje, tipo = "") {
    return `<div class="aviso ${tipo}">${icono(tipo === "aviso--ambar" ? "info" : "escudo")}<span>${mensaje}</span></div>`;
  }

  /* ------------------------- Vistas ------------------------- */
  function vistaInicio() {
    const p = perfil();
    const saludo = p
      ? `Hola, <strong>${esc(estado.usuario.nombre.split(" ")[0])}</strong>. Estas recomendaciones se ajustan a tu objetivo: <strong>${esc(OBJETIVOS[p.objetivo] || "bienestar general")}</strong>.`
      : "Cada cuerpo es distinto. Crea tu perfil de salud y recibe recomendaciones a tu medida.";
    const lista = recomendadas(4).map(tarjeta).join("");
    const progreso = progresoSemanal();
    const conteo = Object.fromEntries(
      Object.keys(CATEGORIAS).map((clave) => [clave, estado.contenidos.filter((r) => r.categoria === clave).length])
    );

    return `
      <section class="hero">
        <div class="contenedor hero__inner">
          <div>
            <span class="eyebrow">${icono("hoja")} Bienestar basado en evidencia</span>
            <h1>Recomendaciones <em>saludables</em> para tu día a día</h1>
            <p class="hero__texto">Alimentación, movimiento, descanso y bienestar emocional en un solo lugar. Contenido claro, personalizado y fácil de poner en práctica.</p>
            <form class="buscador" id="form-busqueda-inicio" role="search">
              <div class="buscador__campo">
                ${icono("buscar")}
                <input type="search" id="busqueda-inicio" name="q" placeholder="Busca recetas, rutinas, descanso..." aria-label="Buscar recomendaciones" />
              </div>
              <button class="btn btn--primario" type="submit">Buscar</button>
            </form>
            <div class="chips-rapidos">
              <span>Populares:</span>
              <button class="chip" type="button" data-action="buscar-chip" data-q="desayuno">Desayuno</button>
              <button class="chip" type="button" data-action="buscar-chip" data-q="cardio">Cardio</button>
              <button class="chip" type="button" data-action="buscar-chip" data-q="sueño">Sueño</button>
              <button class="chip" type="button" data-action="buscar-chip" data-q="estrés">Estrés</button>
            </div>
            <div class="hero__confianza">
              <div class="hero__dato"><strong>${estado.contenidos.length}</strong><span>recomendaciones</span></div>
              <div class="hero__dato"><strong>4</strong><span>áreas de bienestar</span></div>
              <div class="hero__dato"><strong>100%</strong><span>gratuito y privado</span></div>
            </div>
          </div>
          <div class="hero__arte">
            <img src="assets/img/hero.svg" alt="Ilustración de un bowl saludable con frutas y verduras" />
            <div class="flotante flotante--1">
              <span class="punto">${icono("pulso")}</span>
              <div><small>Tu progreso</small>+12% esta semana</div>
            </div>
            <div class="flotante flotante--2">
              <span class="punto">${icono("estrella")}</span>
              <div><small>Personalizado</small>Según tu perfil</div>
            </div>
          </div>
        </div>
      </section>

      <section class="seccion">
        <div class="contenedor">
          <div class="seccion__cabecera">
            <div>
              <span class="seccion__etiqueta">Explora por área</span>
              <h2>Cuatro caminos hacia el bienestar</h2>
              <p>Encuentra contenido organizado por las dimensiones que más impactan tu salud.</p>
            </div>
            <a class="btn btn--secundario" href="#/explorar">Ver todo ${icono("flecha")}</a>
          </div>
          <div class="categorias">
            ${Object.entries(CATEGORIAS)
              .map(
                ([clave, cat]) => `
              <a class="categoria-card" href="#/explorar" data-action="filtrar-categoria" data-categoria="${clave}" style="--cat:${cat.color}">
                <div class="categoria-card__icono">${icono(cat.icono)}</div>
                <h3>${esc(cat.nombre)}</h3>
                <p>${esc(cat.descripcion)}</p>
                <span class="cuenta">${conteo[clave]} recomendaciones ${icono("flecha")}</span>
              </a>`
              )
              .join("")}
          </div>
        </div>
      </section>

      <section class="seccion seccion--crema">
        <div class="contenedor">
          <div class="seccion__cabecera">
            <div>
              <span class="seccion__etiqueta">Para ti</span>
              <h2>Recomendaciones personalizadas</h2>
              <p>${saludo}</p>
            </div>
            <a class="btn btn--texto" href="#/explorar">Explorar catálogo ${icono("flecha")}</a>
          </div>
          <div class="rejilla rejilla--4">${lista}</div>
        </div>
      </section>

      <section class="seccion">
        <div class="contenedor">
          <div class="panel-habitos">
            <div class="panel-habitos__texto">
              <span class="seccion__etiqueta" style="color:var(--lima)">Seguimiento de hábitos</span>
              <h2>Convierte las recomendaciones en rutina</h2>
              <p>Marca tus hábitos cada día y observa cómo avanza tu semana. La constancia importa más que la perfección.</p>
              <ul class="panel-habitos__lista">
                <li>${icono("check")} Registro diario</li>
                <li>${icono("fuego")} Rachas</li>
                <li>${icono("grafico")} Progreso semanal</li>
              </ul>
              <a class="btn btn--claro" href="#/habitos" style="margin-top:26px">Ver mi seguimiento ${icono("flecha")}</a>
            </div>
            <div class="panel-habitos__visual">
              <div class="anillo" style="--progreso:${progreso}">
                <div class="anillo__centro"><strong>${progreso}%</strong><span>esta semana</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="seccion seccion--compacta">
        <div class="contenedor valor">
          <div class="valor__item">
            <span class="icono">${icono("chispa")}</span>
            <div><h3>Personalizado</h3><p>Tus objetivos y preferencias definen el contenido que ves.</p></div>
          </div>
          <div class="valor__item">
            <span class="icono">${icono("escudo")}</span>
            <div><h3>Privado y seguro</h3><p>Tú controlas tus datos de salud y puedes eliminarlos cuando quieras.</p></div>
          </div>
          <div class="valor__item">
            <span class="icono">${icono("pulso")}</span>
            <div><h3>En cualquier dispositivo</h3><p>Diseño adaptable para móvil, tableta y computador.</p></div>
          </div>
        </div>
      </section>`;
  }

  function filtrar() {
    const f = estado.filtros;
    const consulta = f.q.trim().toLowerCase();
    let lista = estado.contenidos.filter((rec) => {
      const cat = catDe(rec);
      const coincideTexto =
        !consulta ||
        [rec.titulo, rec.resumen, rec.descripcion, cat.nombre, ...rec.tags]
          .join(" ")
          .toLowerCase()
          .includes(consulta);
      const coincideCategoria = f.categoria === "todas" || rec.categoria === f.categoria;
      const coincideNivel = f.nivel === "todos" || rec.nivel === f.nivel;
      const coincideDuracion =
        f.duracion === "todas" ||
        (f.duracion === "corta" && rec.duracionMin <= 15) ||
        (f.duracion === "media" && rec.duracionMin > 15 && rec.duracionMin <= 25) ||
        (f.duracion === "larga" && rec.duracionMin > 25);
      return coincideTexto && coincideCategoria && coincideNivel && coincideDuracion;
    });

    if (f.orden === "titulo") lista.sort((a, b) => a.titulo.localeCompare(b.titulo, "es"));
    else if (f.orden === "duracion") lista.sort((a, b) => a.duracionMin - b.duracionMin);
    else lista.sort((a, b) => puntaje(b) - puntaje(a));

    return lista;
  }

  function resultadosHTML() {
    const lista = filtrar();
    if (!lista.length) {
      return `
        <div class="estado-vacio">
          <div class="icono">${icono("buscar")}</div>
          <h3>No encontramos recomendaciones</h3>
          <p>Prueba con otra palabra o ajusta los filtros para ampliar los resultados.</p>
          <button class="btn btn--secundario" type="button" data-action="limpiar-filtros">Limpiar filtros</button>
        </div>`;
    }
    return `<div class="rejilla" id="lista-resultados">${lista.map(tarjeta).join("")}</div>`;
  }

  function vistaExplorar() {
    const f = estado.filtros;
    return `
      <section class="cabecera-vista">
        <div class="contenedor">
          <nav class="migas" aria-label="Ruta de navegación">
            <a href="#/inicio">Inicio</a>${icono("flecha")}<span>Explorar</span>
          </nav>
          <h1>Explora recomendaciones saludables</h1>
          <p>Busca por palabra clave y filtra por categoría, nivel o duración. Los resultados se ordenan según tu perfil cuando has iniciado sesión.</p>
          <div class="filtros">
            <div class="buscador">
              <div class="buscador__campo">
                ${icono("buscar")}
                <input type="search" id="busqueda-explorar" value="${esc(f.q)}" placeholder="Buscar por título, etiqueta o categoría..." aria-label="Buscar recomendaciones" />
              </div>
            </div>
            <select id="filtro-nivel" aria-label="Filtrar por nivel">
              <option value="todos" ${f.nivel === "todos" ? "selected" : ""}>Todos los niveles</option>
              <option value="Fácil" ${f.nivel === "Fácil" ? "selected" : ""}>Fácil</option>
              <option value="Medio" ${f.nivel === "Medio" ? "selected" : ""}>Medio</option>
              <option value="Avanzado" ${f.nivel === "Avanzado" ? "selected" : ""}>Avanzado</option>
            </select>
            <select id="filtro-duracion" aria-label="Filtrar por duración">
              <option value="todas" ${f.duracion === "todas" ? "selected" : ""}>Cualquier duración</option>
              <option value="corta" ${f.duracion === "corta" ? "selected" : ""}>Hasta 15 min</option>
              <option value="media" ${f.duracion === "media" ? "selected" : ""}>16 a 25 min</option>
              <option value="larga" ${f.duracion === "larga" ? "selected" : ""}>Más de 25 min</option>
            </select>
            <select id="filtro-orden" aria-label="Ordenar resultados">
              <option value="relevancia" ${f.orden === "relevancia" ? "selected" : ""}>Más relevantes</option>
              <option value="titulo" ${f.orden === "titulo" ? "selected" : ""}>Título (A-Z)</option>
              <option value="duracion" ${f.orden === "duracion" ? "selected" : ""}>Menor duración</option>
            </select>
          </div>
          <div class="filtros__categorias" style="margin-top:16px">
            <button class="chip ${f.categoria === "todas" ? "activo" : ""}" type="button" data-action="filtrar-categoria" data-categoria="todas">Todas</button>
            ${Object.entries(CATEGORIAS)
              .map(
                ([clave, cat]) =>
                  `<button class="chip ${f.categoria === clave ? "activo" : ""}" type="button" data-action="filtrar-categoria" data-categoria="${clave}">${esc(cat.nombre)}</button>`
              )
              .join("")}
          </div>
        </div>
      </section>
      <section class="seccion seccion--compacta">
        <div class="contenedor">
          <div class="resultado-info">
            <span id="conteo"><strong>${filtrar().length}</strong> recomendaciones encontradas</span>
            <span>${perfil() ? "Ordenadas según tu perfil de salud" : "Inicia sesión para personalizar el orden"}</span>
          </div>
          <div id="resultados">${resultadosHTML()}</div>
        </div>
      </section>`;
  }

  function vistaDetalle(id) {
    const rec = porId(id);
    if (!rec) {
      return `<section class="seccion"><div class="contenedor">${estadoVacio("No encontramos esta recomendación", "Puede que haya sido eliminada del catálogo.", "Volver a explorar", "#/explorar")}</div></section>`;
    }
    const cat = catDe(rec);
    const favorito = estado.favoritos.includes(rec.id);
    const compatible = esCompatible(rec);
    const p = perfil();
    const afin = p && p.objetivo && rec.objetivos.includes(p.objetivo);
    const similares = estado.contenidos.filter((r) => r.categoria === rec.categoria && r.id !== rec.id).slice(0, 3);

    return `
      <section class="detalle">
        <div class="contenedor">
          <nav class="migas" aria-label="Ruta de navegación">
            <a href="#/inicio">Inicio</a>${icono("flecha")}
            <a href="#/explorar">Explorar</a>${icono("flecha")}
            <span>${esc(rec.titulo)}</span>
          </nav>
          <div class="detalle__rejilla">
            <div>
              <div class="detalle__hero" style="--cat:${cat.color}">
                ${icono(cat.icono)}
                <div>
                  <span class="etiqueta-cat" style="position:static;display:inline-block;margin-bottom:10px;color:${cat.color}">${esc(cat.nombre)}</span>
                  <h1>${esc(rec.titulo)}</h1>
                  <p>${esc(rec.resumen)}</p>
                </div>
              </div>

              <div class="detalle__cuerpo">
                ${!compatible ? aviso(`Esta recomendación contiene <strong>${rec.contiene.map((c) => esc(ALERGIAS[c] || c)).join(", ")}</strong>, presente en tus alergias o restricciones. Te sugerimos consultar a un profesional antes de consumirla.`, "aviso--ambar") : ""}
                ${afin ? aviso(`Seleccionada por afinidad con tu objetivo: <strong>${esc(OBJETIVOS[p.objetivo])}</strong>.`) : ""}

                <div class="bloque">
                  <h2>¿Por qué te la recomendamos?</h2>
                  <p>${esc(rec.descripcion)}</p>
                </div>

                <div class="bloque">
                  <h2>Paso a paso</h2>
                  <ol class="pasos">${rec.pasos.map((paso) => `<li>${esc(paso)}</li>`).join("")}</ol>
                </div>

                <div class="bloque">
                  <h2>Beneficios principales</h2>
                  <ul class="beneficios">${rec.beneficios.map((b) => `<li>${icono("check")}${esc(b)}</li>`).join("")}</ul>
                </div>

                <div class="bloque">
                  <h2>Etiquetas</h2>
                  <div class="tags">${rec.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
                </div>
              </div>
            </div>

            <aside class="detalle__lateral">
              <div class="panel">
                <h3>Detalles</h3>
                <ul class="panel__datos">
                  <li><span>Categoría</span><strong>${esc(cat.nombre)}</strong></li>
                  <li><span>Duración</span><strong>${esc(rec.duracion)}</strong></li>
                  <li><span>Nivel</span><strong>${esc(rec.nivel)}</strong></li>
                  <li><span>Porciones</span><strong>${esc(rec.porciones)}</strong></li>
                  <li><span>Beneficio</span><strong>${esc(rec.beneficio)}</strong></li>
                </ul>
              </div>
              <div class="panel panel--acciones">
                <button class="btn ${favorito ? "btn--secundario" : "btn--primario"} btn--bloque" type="button" data-action="toggle-fav" data-id="${esc(rec.id)}">
                  ${icono("corazon")}${favorito ? "Quitar de favoritos" : "Guardar en favoritos"}
                </button>
                <a class="btn btn--secundario btn--bloque" href="#/habitos">${icono("calendario")}Ver mi seguimiento</a>
                <a class="btn btn--texto btn--bloque" href="#/explorar">${icono("flechaIzq")}Seguir explorando</a>
              </div>
              ${!p ? aviso('Inicia sesión y completa tu perfil para recibir recomendaciones ajustadas a tus objetivos.') : ""}
            </aside>
          </div>

          ${similares.length ? `
          <div class="seccion__cabecera" style="margin-top:56px">
            <div><span class="seccion__etiqueta">También te puede interesar</span><h2>Más de ${esc(cat.nombre)}</h2></div>
          </div>
          <div class="rejilla">${similares.map(tarjeta).join("")}</div>` : ""}
        </div>
      </section>`;
  }

  function vistaLogin() {
    const tab = estado.tabAuth;
    return `
      <section class="auth">
        <div class="contenedor">
          <div class="auth__caja">
            <aside class="auth__marca">
              <div>
                <span class="eyebrow" style="background:rgba(255,255,255,0.12);border-color:rgba(255,255,255,0.24);color:#eafbee">${icono("hoja")} Tu espacio de bienestar</span>
                <h2 style="margin-top:20px">Un plan que se adapta a ti</h2>
                <p>Guarda tus recomendaciones favoritas, registra tus hábitos y recibe contenido según tus objetivos de salud.</p>
                <ul>
                  <li>${icono("check")}Recomendaciones personalizadas</li>
                  <li>${icono("check")}Seguimiento de hábitos y rachas</li>
                  <li>${icono("check")}Favoritos sincronizados</li>
                  <li>${icono("check")}Datos de salud bajo tu control</li>
                </ul>
              </div>
              <small>Prototipo académico · Ingeniería Web · CUN</small>
            </aside>
            <div class="auth__form">
              <div class="auth__tabs" role="tablist">
                <button type="button" role="tab" class="${tab === "login" ? "activo" : ""}" data-action="tab-auth" data-tab="login" aria-selected="${tab === "login"}">Iniciar sesión</button>
                <button type="button" role="tab" class="${tab === "registro" ? "activo" : ""}" data-action="tab-auth" data-tab="registro" aria-selected="${tab === "registro"}">Crear cuenta</button>
              </div>

              ${tab === "login" ? `
              <form class="form" id="form-login" novalidate>
                <div class="campo">
                  <label for="login-email">Correo electrónico</label>
                  <input id="login-email" name="email" type="email" autocomplete="email" placeholder="tu@correo.com" required />
                </div>
                <div class="campo">
                  <label for="login-pass">Contraseña</label>
                  <input id="login-pass" name="password" type="password" autocomplete="current-password" placeholder="••••••••" required />
                </div>
                <button class="btn btn--primario btn--bloque" type="submit">${icono("candado")}Entrar a mi cuenta</button>
                <p class="campo__ayuda" style="text-align:center">¿Olvidaste tu contraseña? <a href="#/login" style="color:var(--verde-700);font-weight:600">Recupérala aquí</a></p>
              </form>
              <div class="auth__demo">
                <strong>Cuentas de demostración</strong><br />
                Usuario: <code>demo@vitalia.co</code> / <code>demo123</code><br />
                Administrador: <code>admin@vitalia.co</code> / <code>admin123</code>
              </div>` : `
              <form class="form" id="form-registro" novalidate>
                <div class="campo">
                  <label for="reg-nombre">Nombre completo</label>
                  <input id="reg-nombre" name="nombre" type="text" autocomplete="name" placeholder="María Gómez" required />
                </div>
                <div class="campo">
                  <label for="reg-email">Correo electrónico</label>
                  <input id="reg-email" name="email" type="email" autocomplete="email" placeholder="tu@correo.com" required />
                </div>
                <div class="campo__fila">
                  <div class="campo">
                    <label for="reg-pass">Contraseña</label>
                    <input id="reg-pass" name="password" type="password" autocomplete="new-password" placeholder="Mínimo 6 caracteres" required />
                  </div>
                  <div class="campo">
                    <label for="reg-pass2">Confirmar contraseña</label>
                    <input id="reg-pass2" name="password2" type="password" autocomplete="new-password" placeholder="Repite la contraseña" required />
                  </div>
                </div>
                <label class="check">
                  <input type="checkbox" name="terminos" required />
                  <span>Acepto la <a href="#/login" style="color:var(--verde-700);font-weight:600">política de tratamiento de datos</a> y autorizo el uso de mi información para personalizar recomendaciones.</span>
                </label>
                <button class="btn btn--primario btn--bloque" type="submit">${icono("usuario")}Crear mi cuenta</button>
                <p class="campo__ayuda" style="text-align:center">Al registrarte podrás completar tu perfil de salud en el siguiente paso.</p>
              </form>`}
            </div>
          </div>
        </div>
      </section>`;
  }

  function vistaPerfil() {
    if (!estado.usuario) {
      return `<section class="seccion"><div class="contenedor">
        ${estadoVacio("Inicia sesión para ver tu perfil", "Crea tu cuenta o ingresa con una cuenta de demostración para gestionar tu perfil de salud.", "Iniciar sesión", "#/login")}
      </div></section>`;
    }
    const p = estado.usuario.perfil || {};
    const iniciales = estado.usuario.nombre
      .split(" ")
      .map((parte) => parte[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    const campos = [p.edad, p.peso, p.altura, p.objetivo, p.nivelActividad, p.sexo].filter(Boolean).length;
    const completo = Math.round((campos / 6) * 100);
    const estatura = Number(p.altura) > 3 ? Number(p.altura) / 100 : Number(p.altura);
    const imc = p.peso && estatura ? (Number(p.peso) / (estatura * estatura)).toFixed(1) : null;
    const posicionIMC = imc ? Math.min(92, Math.max(8, ((Number(imc) - 14) / 22) * 100)) : 40;
    const alergias = Array.isArray(p.alergias) ? p.alergias : [];

    return `
      <section class="perfil">
        <div class="contenedor">
          <div class="perfil__cabecera">
            <div class="perfil__avatar">${esc(iniciales || "V")}</div>
            <div>
              <h1>${esc(estado.usuario.nombre)}</h1>
              <p>${esc(estado.usuario.email)} ${estado.usuario.rol === "admin" ? "· Administrador" : "· Plan gratuito"}</p>
            </div>
            <a class="btn btn--claro" href="#/login" data-action="cerrar-sesion">${icono("salir")}Cerrar sesión</a>
          </div>

          <div class="perfil__rejilla">
            <div>
              <div class="perfil__bloque">
                <h2>Perfil de salud</h2>
                <p>Esta información permite personalizar tus recomendaciones. Solo tú puedes verla.</p>
                <form class="form" id="form-perfil">
                  <div class="campo__fila">
                    <div class="campo">
                      <label for="perfil-nombre">Nombre</label>
                      <input id="perfil-nombre" name="nombre" type="text" value="${esc(estado.usuario.nombre)}" required />
                    </div>
                    <div class="campo">
                      <label for="perfil-edad">Edad</label>
                      <input id="perfil-edad" name="edad" type="number" min="12" max="100" value="${esc(p.edad || "")}" placeholder="29" />
                    </div>
                  </div>
                  <div class="campo__fila">
                    <div class="campo">
                      <label for="perfil-sexo">Sexo</label>
                      <select id="perfil-sexo" name="sexo">
                        <option value="">Selecciona</option>
                        <option value="femenino" ${p.sexo === "femenino" ? "selected" : ""}>Femenino</option>
                        <option value="masculino" ${p.sexo === "masculino" ? "selected" : ""}>Masculino</option>
                        <option value="otro" ${p.sexo === "otro" ? "selected" : ""}>Prefiero no decirlo</option>
                      </select>
                    </div>
                    <div class="campo">
                      <label for="perfil-actividad">Nivel de actividad</label>
                      <select id="perfil-actividad" name="nivelActividad">
                        <option value="">Selecciona</option>
                        <option value="bajo" ${p.nivelActividad === "bajo" ? "selected" : ""}>Bajo (sedentario)</option>
                        <option value="medio" ${p.nivelActividad === "medio" ? "selected" : ""}>Medio (activo)</option>
                        <option value="alto" ${p.nivelActividad === "alto" ? "selected" : ""}>Alto (muy activo)</option>
                      </select>
                    </div>
                  </div>
                  <div class="campo__fila">
                    <div class="campo">
                      <label for="perfil-peso">Peso (kg)</label>
                      <input id="perfil-peso" name="peso" type="number" step="0.1" min="20" max="300" value="${esc(p.peso || "")}" placeholder="68" />
                    </div>
                    <div class="campo">
                      <label for="perfil-altura">Altura (cm)</label>
                      <input id="perfil-altura" name="altura" type="number" min="80" max="250" value="${esc(p.altura || "")}" placeholder="165" />
                    </div>
                  </div>
                  <div class="campo">
                    <label for="perfil-objetivo">Objetivo principal</label>
                    <select id="perfil-objetivo" name="objetivo">
                      <option value="">Selecciona tu objetivo</option>
                      ${opciones(OBJETIVOS, p.objetivo)}
                    </select>
                  </div>
                  <div class="campo">
                    <label>Alergias o restricciones alimentarias</label>
                    <div class="tags" style="gap:10px">
                      ${Object.entries(ALERGIAS)
                        .map(
                          ([clave, valor]) => `
                        <label class="chip" style="cursor:pointer">
                          <input type="checkbox" name="alergias" value="${clave}" ${alergias.includes(clave) ? "checked" : ""} style="accent-color:var(--verde-600)" />
                          ${esc(valor)}
                        </label>`
                        )
                        .join("")}
                    </div>
                  </div>
                  <div class="campo">
                    <label for="perfil-condiciones">Condiciones o notas de salud (opcional)</label>
                    <textarea id="perfil-condiciones" name="condiciones" placeholder="Ej. hipertensión controlada, lesión de rodilla...">${esc(p.condiciones || "")}</textarea>
                    <span class="campo__ayuda">Esta información es privada y solo se usa para filtrar recomendaciones.</span>
                  </div>
                  <label class="check">
                    <input type="checkbox" name="consentimiento" ${p.consentimiento ? "checked" : ""} />
                    <span>Autorizo el uso de mis datos de salud para personalizar las recomendaciones de la plataforma.</span>
                  </label>
                  <div style="display:flex;gap:10px;flex-wrap:wrap">
                    <button class="btn btn--primario" type="submit">${icono("check")}Guardar cambios</button>
                    <button class="btn btn--peligro" type="button" data-action="eliminar-cuenta">${icono("basura")}Eliminar mis datos</button>
                  </div>
                </form>
              </div>
            </div>

            <aside class="perfil__lateral">
              <div class="panel imc">
                <span>Índice de masa corporal</span>
                <strong id="imc-valor">${imc || "—"}</strong>
                <span>${imc ? "Estimación orientativa" : "Completa peso y altura"}</span>
                <div class="barra"><i id="imc-marcador" style="left:${posicionIMC}%"></i></div>
              </div>
              <div class="panel">
                <h3>Perfil completo</h3>
                <div class="progreso-perfil">
                  <div class="progreso-perfil__texto"><span>Datos diligenciados</span><strong>${completo}%</strong></div>
                  <div class="progreso-perfil__barra"><i style="width:${completo}%"></i></div>
                </div>
                <p class="campo__ayuda" style="margin-top:12px">Completar tu perfil mejora la precisión de las recomendaciones personalizadas.</p>
              </div>
              <div class="panel">
                <h3>Privacidad</h3>
                <p class="campo__ayuda">Tus datos se almacenan localmente en este prototipo. En producción viajarían cifrados y con acceso restringido.</p>
                <div style="margin-top:12px">${aviso("Puedes eliminar tu cuenta y tus datos en cualquier momento.")}</div>
              </div>
              ${estado.usuario.rol === "admin" ? `<div class="panel"><h3>Administración</h3><p class="campo__ayuda">Gestiona el catálogo de recomendaciones saludables.</p><a class="btn btn--secundario btn--bloque" href="#/admin" style="margin-top:12px">${icono("ajustes")}Gestionar contenidos</a></div>` : ""}
            </aside>
          </div>
        </div>
      </section>`;
  }

  function vistaFavoritos() {
    const lista = estado.favoritos.map(porId).filter(Boolean);
    return `
      <section class="cabecera-vista">
        <div class="contenedor">
          <nav class="migas" aria-label="Ruta de navegación"><a href="#/inicio">Inicio</a>${icono("flecha")}<span>Favoritos</span></nav>
          <h1>Mis favoritos</h1>
          <p>Tu colección personal de recomendaciones. Guárdalas para volver a ellas cuando las necesites.</p>
        </div>
      </section>
      <section class="seccion seccion--compacta">
        <div class="contenedor">
          ${!estado.usuario ? aviso('Inicia sesión para conservar tus favoritos en todos tus dispositivos. <a href="#/login" style="font-weight:700;text-decoration:underline">Ingresar</a>') : ""}
          <div style="margin-top:${!estado.usuario ? "20px" : "0"}">
            ${lista.length
              ? `<div class="resultado-info"><span><strong>${lista.length}</strong> recomendaciones guardadas</span><a class="btn btn--texto" href="#/explorar">Agregar más ${icono("flecha")}</a></div><div class="rejilla">${lista.map(tarjeta).join("")}</div>`
              : estadoVacio("Aún no tienes favoritos", "Explora el catálogo y guarda las recomendaciones que quieras probar.", "Explorar recomendaciones", "#/explorar")}
          </div>
        </div>
      </section>`;
  }

  function vistaHabitos() {
    const progreso = progresoSemanal();
    const dias = diasDeLaSemana();
    const hoy = iso(new Date());
    const totalPosible = HABITOS_BASE.length * (((new Date().getDay() + 6) % 7) + 1);
    let cumplidos = 0;
    HABITOS_BASE.forEach((h) => {
      const reg = estado.habitos[h.id] || [];
      dias.slice(0, ((new Date().getDay() + 6) % 7) + 1).forEach((d) => {
        if (reg.includes(iso(d))) cumplidos += 1;
      });
    });
    const mejorRacha = Math.max(0, ...HABITOS_BASE.map((h) => rachaDe(h.id)));

    return `
      <section class="habitos">
        <div class="contenedor">
          <nav class="migas" aria-label="Ruta de navegación"><a href="#/inicio">Inicio</a>${icono("flecha")}<span>Hábitos</span></nav>
          <h1>Seguimiento de hábitos</h1>
          <p style="color:var(--texto-2);margin-top:8px;max-width:62ch">Marca cada día que cumplas un hábito. Tu progreso se guarda en este dispositivo y alimenta las recomendaciones personalizadas.</p>
          ${!estado.usuario ? `<div style="margin-top:18px">${aviso('Estás usando el seguimiento como invitado. <a href="#/login" style="font-weight:700;text-decoration:underline">Inicia sesión</a> para asociarlo a tu perfil.')}</div>` : ""}

          <div class="metricas">
            <div class="metrica metrica--verde">
              <span class="icono">${icono("grafico")}</span>
              <div><strong>${progreso}%</strong><span>Cumplimiento semanal</span></div>
            </div>
            <div class="metrica metrica--ambar">
              <span class="icono">${icono("fuego")}</span>
              <div><strong>${mejorRacha}</strong><span>Mejor racha (días)</span></div>
            </div>
            <div class="metrica metrica--azul">
              <span class="icono">${icono("check")}</span>
              <div><strong>${cumplidos}<small style="font-size:0.9rem;color:var(--texto-3)">/${totalPosible}</small></strong><span>Hábitos cumplidos esta semana</span></div>
            </div>
          </div>

          <div class="seccion__cabecera" style="margin-top:34px">
            <div><span class="seccion__etiqueta">Semana actual</span><h2>Mis hábitos diarios</h2></div>
            <span class="tag">${totalRegistros()} registros en total</span>
          </div>

          ${HABITOS_BASE.map((habito) => {
            const cat = CATEGORIAS[habito.categoria];
            const reg = estado.habitos[habito.id] || [];
            const racha = rachaDe(habito.id);
            return `
            <div class="habito">
              <div class="habito__info">
                <span class="habito__icono" style="--cat:${cat.color}">${icono(cat.icono)}</span>
                <div>
                  <h3>${esc(habito.titulo)}</h3>
                  <p>${esc(habito.meta)} · ${esc(habito.frecuencia)}</p>
                  <span class="habito__racha">${icono("fuego")}${racha} día${racha === 1 ? "" : "s"} de racha</span>
                </div>
              </div>
              <div class="semana" role="group" aria-label="Registro semanal de ${esc(habito.titulo)}">
                ${dias
                  .map((dia, indice) => {
                    const clave = iso(dia);
                    const hecho = reg.includes(clave);
                    return `<div class="dia"><small>${NOMBRES_DIA[indice]}</small>
                      <button type="button" class="${hecho ? "hecho" : ""} ${clave === hoy ? "hoy" : ""}"
                        data-action="toggle-habito" data-habito="${habito.id}" data-fecha="${clave}"
                        aria-pressed="${hecho}" aria-label="${esc(habito.titulo)} ${clave}${hecho ? ", cumplido" : ""}">${icono("check")}</button>
                    </div>`;
                  })
                  .join("")}
              </div>
            </div>`;
          }).join("")}

          <div class="panel" style="margin-top:26px">
            ${aviso("La constancia vale más que la perfección: si fallas un día, retoma al siguiente. Las rachas se calculan con los registros consecutivos hasta hoy.")}
          </div>
        </div>
      </section>`;
  }

  function vistaAdmin() {
    if (!estado.usuario || estado.usuario.rol !== "admin") {
      return `<section class="seccion"><div class="contenedor">
        <div class="estado-vacio">
          <div class="icono">${icono("candado")}</div>
          <h3>Área de administración</h3>
          <p>Esta sección permite gestionar el catálogo de contenidos saludables. Requiere una cuenta con rol de administrador.</p>
          <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
            <a class="btn btn--primario" href="#/login">Iniciar sesión</a>
            <button class="btn btn--secundario" type="button" data-action="login-admin">Entrar con cuenta demo admin</button>
          </div>
        </div>
      </div></section>`;
    }
    const editando = estado.editando ? porId(estado.editando) : null;
    const conteo = Object.fromEntries(Object.keys(CATEGORIAS).map((c) => [c, estado.contenidos.filter((r) => r.categoria === c).length]));

    return `
      <section class="admin">
        <div class="contenedor">
          <nav class="migas" aria-label="Ruta de navegación"><a href="#/inicio">Inicio</a>${icono("flecha")}<span>Gestión de contenidos</span></nav>
          <div class="seccion__cabecera">
            <div>
              <span class="seccion__etiqueta">Administración</span>
              <h1>Gestión de contenidos saludables</h1>
              <p>Crea, edita y elimina recomendaciones. Los cambios se reflejan de inmediato en el catálogo público.</p>
            </div>
            <button class="btn btn--secundario btn--sm" type="button" data-action="restaurar-catalogo">${icono("ajustes")}Restaurar catálogo</button>
          </div>

          <div class="metricas">
            <div class="metrica metrica--verde"><span class="icono">${icono("hoja")}</span><div><strong>${estado.contenidos.length}</strong><span>Contenidos publicados</span></div></div>
            <div class="metrica metrica--ambar"><span class="icono">${icono("manzana")}</span><div><strong>${conteo.alimentacion}</strong><span>De alimentación</span></div></div>
            <div class="metrica metrica--azul"><span class="icono">${icono("correr")}</span><div><strong>${conteo.actividad + conteo.descanso + conteo.bienestar}</strong><span>De actividad y bienestar</span></div></div>
          </div>

          <div class="admin__rejilla" style="margin-top:26px">
            <div class="tabla-caja">
              <table class="tabla">
                <thead><tr><th>Título</th><th>Categoría</th><th>Duración</th><th>Nivel</th><th style="text-align:right">Acciones</th></tr></thead>
                <tbody>
                  ${estado.contenidos
                    .map((rec) => {
                      const cat = catDe(rec);
                      return `<tr>
                        <td><span class="tabla__titulo">${esc(rec.titulo)}</span><br /><span class="campo__ayuda">${esc(rec.tags.slice(0, 2).join(" · "))}</span></td>
                        <td><span class="pastilla" style="--cat:${cat.color}">${esc(cat.nombre)}</span></td>
                        <td>${esc(rec.duracion)}</td>
                        <td>${esc(rec.nivel)}</td>
                        <td>
                          <div class="tabla__acciones">
                            <button class="mini-btn" type="button" data-action="editar-contenido" data-id="${esc(rec.id)}" aria-label="Editar ${esc(rec.titulo)}">${icono("editar")}</button>
                            <button class="mini-btn mini-btn--peligro" type="button" data-action="borrar-contenido" data-id="${esc(rec.id)}" aria-label="Eliminar ${esc(rec.titulo)}">${icono("basura")}</button>
                          </div>
                        </td>
                      </tr>`;
                    })
                    .join("")}
                </tbody>
              </table>
            </div>

            <div class="form-panel">
              <h2>${editando ? "Editar contenido" : "Nuevo contenido"}</h2>
              <p>${editando ? "Modifica los campos y guarda los cambios." : "Completa los datos para publicar una nueva recomendación."}</p>
              <form class="form" id="form-contenido">
                <div class="campo">
                  <label for="cont-titulo">Título</label>
                  <input id="cont-titulo" name="titulo" type="text" value="${esc(editando ? editando.titulo : "")}" placeholder="Ej. Desayuno con fruta de temporada" required />
                </div>
                <div class="campo">
                  <label for="cont-categoria">Categoría</label>
                  <select id="cont-categoria" name="categoria">
                    ${Object.entries(CATEGORIAS).map(([k, c]) => `<option value="${k}" ${editando && editando.categoria === k ? "selected" : ""}>${esc(c.nombre)}</option>`).join("")}
                  </select>
                </div>
                <div class="campo">
                  <label for="cont-resumen">Resumen</label>
                  <textarea id="cont-resumen" name="resumen" rows="2" placeholder="Breve descripción para la tarjeta" required>${esc(editando ? editando.resumen : "")}</textarea>
                </div>
                <div class="campo">
                  <label for="cont-descripcion">Descripción</label>
                  <textarea id="cont-descripcion" name="descripcion" rows="3" placeholder="Explicación amplia de la recomendación">${esc(editando ? editando.descripcion : "")}</textarea>
                </div>
                <div class="campo__fila">
                  <div class="campo">
                    <label for="cont-duracion">Duración</label>
                    <input id="cont-duracion" name="duracion" type="text" value="${esc(editando ? editando.duracion : "")}" placeholder="15 min" />
                  </div>
                  <div class="campo">
                    <label for="cont-nivel">Nivel</label>
                    <select id="cont-nivel" name="nivel">
                      <option value="Fácil" ${editando && editando.nivel === "Fácil" ? "selected" : ""}>Fácil</option>
                      <option value="Medio" ${editando && editando.nivel === "Medio" ? "selected" : ""}>Medio</option>
                      <option value="Avanzado" ${editando && editando.nivel === "Avanzado" ? "selected" : ""}>Avanzado</option>
                    </select>
                  </div>
                </div>
                <div class="campo">
                  <label for="cont-tags">Etiquetas (separadas por coma)</label>
                  <input id="cont-tags" name="tags" type="text" value="${esc(editando ? editando.tags.join(", ") : "")}" placeholder="Desayuno, Fibra" />
                </div>
                <div class="campo">
                  <label for="cont-pasos">Pasos (uno por línea)</label>
                  <textarea id="cont-pasos" name="pasos" rows="4" placeholder="Paso 1&#10;Paso 2">${esc(editando ? editando.pasos.join("\n") : "")}</textarea>
                </div>
                <button class="btn btn--primario btn--bloque" type="submit">${icono(editando ? "check" : "mas")}${editando ? "Guardar cambios" : "Publicar contenido"}</button>
                ${editando ? `<button class="btn btn--secundario btn--bloque" type="button" data-action="cancelar-edicion">Cancelar edición</button>` : ""}
              </form>
            </div>
          </div>
        </div>
      </section>`;
  }

  function estadoVacio(titulo, texto, accion, enlace) {
    return `
      <div class="estado-vacio">
        <div class="icono">${icono("corazon")}</div>
        <h3>${esc(titulo)}</h3>
        <p>${esc(texto)}</p>
        <a class="btn btn--primario" href="${enlace}">${esc(accion)}</a>
      </div>`;
  }

  /* ------------------------- Router ------------------------- */
  function rutaActual() {
    const limpia = location.hash.replace(/^#\/?/, "");
    const partes = limpia.split("/").filter(Boolean);
    return { vista: partes[0] || "inicio", parametro: partes[1] || null };
  }

  function render(desplazar = true) {
    const { vista, parametro } = rutaActual();
    const app = document.getElementById("app");
    if (!app) return;

    switch (vista) {
      case "explorar": app.innerHTML = vistaExplorar(); break;
      case "detalle": app.innerHTML = vistaDetalle(parametro); break;
      case "login": app.innerHTML = vistaLogin(); break;
      case "perfil": app.innerHTML = vistaPerfil(); break;
      case "favoritos": app.innerHTML = vistaFavoritos(); break;
      case "habitos": app.innerHTML = vistaHabitos(); break;
      case "admin": app.innerHTML = vistaAdmin(); break;
      default: app.innerHTML = vistaInicio();
    }

    actualizarCabecera(vista);
    if (desplazar) window.scrollTo(0, 0);
  }

  function actualizarCabecera(vista) {
    document.querySelectorAll(".nav a[data-nav]").forEach((enlace) => {
      enlace.classList.toggle("activo", enlace.dataset.nav === vista);
    });
    const badge = document.getElementById("badge-fav");
    if (badge) badge.textContent = estado.favoritos.length;
    const navAdmin = document.getElementById("nav-admin");
    if (navAdmin) navAdmin.hidden = !(estado.usuario && estado.usuario.rol === "admin");
    const chip = document.getElementById("usuario-btn");
    if (chip) {
      if (estado.usuario) {
        const iniciales = estado.usuario.nombre.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
        chip.innerHTML = `<span class="avatar">${esc(iniciales)}</span><span class="nombre">${esc(estado.usuario.nombre.split(" ")[0])}</span>`;
        chip.setAttribute("href", "#/perfil");
      } else {
        chip.innerHTML = `${icono("usuario")}<span class="nombre">Ingresar</span>`;
        chip.setAttribute("href", "#/login");
      }
    }
    const menu = document.getElementById("nav-principal");
    if (menu) menu.classList.remove("abierto");
  }

  function soloResultados() {
    const contenedor = document.getElementById("resultados");
    const conteo = document.getElementById("conteo");
    if (contenedor) contenedor.innerHTML = resultadosHTML();
    if (conteo) conteo.innerHTML = `<strong>${filtrar().length}</strong> recomendaciones encontradas`;
  }

  /* ------------------------- Acciones ------------------------- */
  function alternarFavorito(id) {
    if (!porId(id)) return;
    const indice = estado.favoritos.indexOf(id);
    if (indice >= 0) {
      estado.favoritos.splice(indice, 1);
      toast("Recomendación eliminada de favoritos");
    } else {
      estado.favoritos.push(id);
      toast("Recomendación guardada en favoritos");
    }
    persistir();
    actualizarCabecera(rutaActual().vista);
    document.querySelectorAll(`[data-action="toggle-fav"][data-id="${id}"]`).forEach((boton) => {
      const activo = estado.favoritos.includes(id);
      boton.setAttribute("aria-pressed", String(activo));
      boton.setAttribute("aria-label", `${activo ? "Quitar de favoritos" : "Guardar en favoritos"}`);
      if (boton.classList.contains("btn")) {
        boton.classList.toggle("btn--primario", !activo);
        boton.classList.toggle("btn--secundario", activo);
        boton.innerHTML = `${icono("corazon")}${activo ? "Quitar de favoritos" : "Guardar en favoritos"}`;
      }
    });
    if (rutaActual().vista === "favoritos") render(false);
  }

  function alternarHabito(habitoId, fecha) {
    if (!estado.habitos[habitoId]) estado.habitos[habitoId] = [];
    const lista = estado.habitos[habitoId];
    const indice = lista.indexOf(fecha);
    if (indice >= 0) lista.splice(indice, 1);
    else lista.push(fecha);
    persistir();
    render(false);
  }

  function iniciarSesion(email, password) {
    const correo = email.trim().toLowerCase();
    const demoPerfil = {
      edad: 29, sexo: "femenino", peso: 68, altura: 165, nivelActividad: "medio",
      objetivo: "energia", alergias: [], condiciones: "", consentimiento: true
    };
    if (correo === "admin@vitalia.co" && password === "admin123") {
      estado.usuario = { nombre: "Administrador Vitalia", email: correo, rol: "admin", perfil: { ...demoPerfil, objetivo: "masa_muscular" } };
      persistir();
      return true;
    }
    if (correo === "demo@vitalia.co" && password === "demo123") {
      estado.usuario = { nombre: "María Gómez", email: correo, rol: "usuario", perfil: { ...demoPerfil } };
      persistir();
      return true;
    }
    const cuenta = estado.cuentas.find((c) => c.email === correo && c.password === password);
    if (cuenta) {
      estado.usuario = cuenta.usuario;
      persistir();
      return true;
    }
    return false;
  }

  /* ------------------------- Eventos ------------------------- */
  document.addEventListener("click", (evento) => {
    const objetivo = evento.target.closest("[data-action]");
    if (!objetivo) {
      const nav = document.getElementById("nav-principal");
      if (nav && nav.classList.contains("abierto") && !evento.target.closest("#nav-principal") && !evento.target.closest(".menu-btn")) {
        nav.classList.remove("abierto");
      }
      return;
    }
    const accion = objetivo.dataset.action;

    switch (accion) {
      case "menu": {
        const nav = document.getElementById("nav-principal");
        if (nav) nav.classList.toggle("abierto");
        break;
      }
      case "toggle-fav":
        evento.preventDefault();
        alternarFavorito(objetivo.dataset.id);
        break;
      case "filtrar-categoria":
        estado.filtros.categoria = objetivo.dataset.categoria;
        if (rutaActual().vista !== "explorar") {
          location.hash = "#/explorar";
        } else {
          document.querySelectorAll('[data-action="filtrar-categoria"]').forEach((chip) => {
            chip.classList.toggle("activo", chip.dataset.categoria === estado.filtros.categoria);
          });
          soloResultados();
        }
        break;
      case "buscar-chip":
        estado.filtros.q = objetivo.dataset.q || "";
        location.hash = "#/explorar";
        break;
      case "limpiar-filtros":
        estado.filtros = { q: "", categoria: "todas", nivel: "todos", duracion: "todas", orden: "relevancia" };
        render(false);
        break;
      case "tab-auth":
        estado.tabAuth = objetivo.dataset.tab;
        render(false);
        break;
      case "cerrar-sesion":
        evento.preventDefault();
        estado.usuario = null;
        persistir();
        toast("Sesión cerrada correctamente");
        location.hash = "#/inicio";
        break;
      case "eliminar-cuenta":
        if (window.confirm("¿Eliminar tu cuenta y todos tus datos guardados? Esta acción no se puede deshacer.")) {
          localStorage.removeItem(CLAVES.usuario);
          localStorage.removeItem(CLAVES.favoritos);
          localStorage.removeItem(CLAVES.habitos);
          estado.usuario = null;
          estado.favoritos = [];
          estado.habitos = {};
          persistir();
          toast("Tus datos fueron eliminados");
          location.hash = "#/inicio";
        }
        break;
      case "login-admin":
        iniciarSesion("admin@vitalia.co", "admin123");
        toast("Bienvenido, administrador");
        render(false);
        break;
      case "editar-contenido":
        estado.editando = objetivo.dataset.id;
        render(false);
        break;
      case "cancelar-edicion":
        estado.editando = null;
        render(false);
        break;
      case "borrar-contenido":
        if (window.confirm("¿Eliminar esta recomendación del catálogo?")) {
          estado.contenidos = estado.contenidos.filter((r) => r.id !== objetivo.dataset.id);
          estado.favoritos = estado.favoritos.filter((id) => id !== objetivo.dataset.id);
          if (estado.editando === objetivo.dataset.id) estado.editando = null;
          persistir();
          toast("Contenido eliminado");
          render(false);
        }
        break;
      case "restaurar-catalogo":
        if (window.confirm("¿Restaurar el catálogo original de recomendaciones?")) {
          estado.contenidos = copia(RECOMENDACIONES);
          estado.editando = null;
          persistir();
          toast("Catálogo restaurado");
          render(false);
        }
        break;
      default:
        break;
    }
  });

  document.addEventListener("submit", (evento) => {
    const formulario = evento.target;

    if (formulario.id === "form-busqueda-inicio") {
      evento.preventDefault();
      const valor = formulario.querySelector("input").value;
      estado.filtros.q = valor;
      location.hash = "#/explorar";
      return;
    }

    if (formulario.id === "form-login") {
      evento.preventDefault();
      const datos = new FormData(formulario);
      if (iniciarSesion(String(datos.get("email") || ""), String(datos.get("password") || ""))) {
        toast("Bienvenido de nuevo a Vitalia");
        location.hash = "#/perfil";
      } else {
        toast("Correo o contraseña incorrectos");
      }
      return;
    }

    if (formulario.id === "form-registro") {
      evento.preventDefault();
      const datos = new FormData(formulario);
      const nombre = String(datos.get("nombre") || "").trim();
      const email = String(datos.get("email") || "").trim().toLowerCase();
      const pass = String(datos.get("password") || "");
      const pass2 = String(datos.get("password2") || "");
      const terminos = datos.get("terminos");

      if (!nombre || !email || !pass) { toast("Completa todos los campos obligatorios"); return; }
      if (pass.length < 6) { toast("La contraseña debe tener al menos 6 caracteres"); return; }
      if (pass !== pass2) { toast("Las contraseñas no coinciden"); return; }
      if (!terminos) { toast("Debes aceptar la política de tratamiento de datos"); return; }
      if (estado.cuentas.some((c) => c.email === email) || email === "demo@vitalia.co" || email === "admin@vitalia.co") {
        toast("Ya existe una cuenta con este correo"); return;
      }

      const usuario = {
        nombre,
        email,
        rol: "usuario",
        perfil: { edad: "", sexo: "", peso: "", altura: "", nivelActividad: "", objetivo: "", alergias: [], condiciones: "", consentimiento: true }
      };
      estado.cuentas.push({ email, password: pass, usuario });
      estado.usuario = usuario;
      persistir();
      toast("Cuenta creada. Completa tu perfil de salud");
      location.hash = "#/perfil";
      return;
    }

    if (formulario.id === "form-perfil") {
      evento.preventDefault();
      const datos = new FormData(formulario);
      const alergias = datos.getAll("alergias").filter((a) => a !== "ninguna");
      estado.usuario.nombre = String(datos.get("nombre") || estado.usuario.nombre).trim() || estado.usuario.nombre;
      estado.usuario.perfil = {
        edad: datos.get("edad") || "",
        sexo: datos.get("sexo") || "",
        peso: datos.get("peso") || "",
        altura: datos.get("altura") || "",
        nivelActividad: datos.get("nivelActividad") || "",
        objetivo: datos.get("objetivo") || "",
        alergias,
        condiciones: datos.get("condiciones") || "",
        consentimiento: Boolean(datos.get("consentimiento"))
      };
      persistir();
      toast("Perfil de salud actualizado");
      render(false);
      return;
    }

    if (formulario.id === "form-contenido") {
      evento.preventDefault();
      const datos = new FormData(formulario);
      const titulo = String(datos.get("titulo") || "").trim();
      const resumen = String(datos.get("resumen") || "").trim();
      if (!titulo || !resumen) { toast("Título y resumen son obligatorios"); return; }
      const duracion = String(datos.get("duracion") || "10 min");
      const base = {
        titulo,
        categoria: String(datos.get("categoria") || "alimentacion"),
        resumen,
        descripcion: String(datos.get("descripcion") || resumen),
        duracion,
        duracionMin: parseInt(duracion, 10) || 10,
        nivel: String(datos.get("nivel") || "Fácil"),
        porciones: "1 porción",
        tags: String(datos.get("tags") || "Bienestar").split(",").map((t) => t.trim()).filter(Boolean),
        objetivos: ["energia"],
        contiene: [],
        beneficio: resumen,
        pasos: String(datos.get("pasos") || "").split("\n").map((p) => p.trim()).filter(Boolean),
        beneficios: ["Contenido publicado desde el panel de administración"]
      };
      if (estado.editando) {
        const indice = estado.contenidos.findIndex((r) => r.id === estado.editando);
        if (indice >= 0) estado.contenidos[indice] = { ...estado.contenidos[indice], ...base };
        toast("Contenido actualizado correctamente");
      } else {
        estado.contenidos.unshift({ id: `r${Date.now()}`, ...base });
        toast("Nuevo contenido publicado");
      }
      estado.editando = null;
      persistir();
      render(false);
      return;
    }
  });

  document.addEventListener("input", (evento) => {
    const campo = evento.target;
    if (campo.id === "busqueda-explorar") {
      estado.filtros.q = campo.value;
      soloResultados();
    }
    if (campo.id === "perfil-peso" || campo.id === "perfil-altura") {
      const peso = Number(document.getElementById("perfil-peso")?.value);
      const alturaCm = Number(document.getElementById("perfil-altura")?.value);
      const valor = document.getElementById("imc-valor");
      const marcador = document.getElementById("imc-marcador");
      if (valor && peso && alturaCm) {
        const m = alturaCm / 100;
        const imc = peso / (m * m);
        valor.textContent = imc.toFixed(1);
        if (marcador) marcador.style.left = `${Math.min(92, Math.max(8, ((imc - 14) / 22) * 100))}%`;
      }
    }
  });

  document.addEventListener("change", (evento) => {
    const campo = evento.target;
    if (campo.id === "filtro-nivel") { estado.filtros.nivel = campo.value; soloResultados(); }
    if (campo.id === "filtro-duracion") { estado.filtros.duracion = campo.value; soloResultados(); }
    if (campo.id === "filtro-orden") { estado.filtros.orden = campo.value; soloResultados(); }
  });

  window.addEventListener("hashchange", () => render(true));

  document.addEventListener("DOMContentLoaded", () => render(true));
  if (document.readyState !== "loading") render(true);
})();
