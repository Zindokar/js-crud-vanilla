"use strict"

import {
    datosJsonInicial,
    localStorageKey
} from "./datos.js"

let listadoAlumnos = []

function cargarDatos() {
    const estadoCarga = document.querySelector("#estadoCarga")
    const datosLocalStorage = localStorage.getItem(localStorageKey)
    if (datosLocalStorage) {
        try {
            listadoAlumnos = JSON.parse(datosLocalStorage)
            estadoCarga.textContent = "Cargado desde LocalStorage..."
        } catch (error) {
            listadoAlumnos = structuredClone(datosJsonInicial);
            estadoCarga.textContent = "LocalStorage inválido... Cargando JSON inicial!"
        }
    } else {
        listadoAlumnos = structuredClone(datosJsonInicial);
        estadoCarga.textContent = "LocalStorage vacío... Cargando JSON inicial!"
    }
    renderizarTabla()
}

function renderizarTabla() {
    const tbody = document.querySelector("#tbodyAlumnos")
    tbody.innerHTML = ""

    if (listadoAlumnos.length === 0) {
        const tr = document.createElement("tr")
        tr.innerHTML = `
            <td colspan="5">No hay datos para mostrar</td>
        `
        tbody.appendChild(tr)
        return
    }

    listadoAlumnos.forEach(alumno => {
        const tr = document.createElement("tr")
        tr.innerHTML = `
            <td><span class="badge">${alumno.id}</span></td>
            <td>${escapeHTML(alumno.nombre)}</td>
            <td>${escapeHTML(alumno.curso)}</td>
            <td>${alumno.edad}</td>
            <td>
                <button class="edit" data-id="${alumno.id}" data-accion="editar">Editar</button>
                <button class="delete" data-id="${alumno.id}" data-accion="eliminar">Eliminar</button>
            </td>
        `
        tbody.appendChild(tr)
    })
}

function escapeHTML(texto) {
    return String(texto)
        .replaceAll(/&/g, "&amp;")
        .replaceAll(/</g, "&lt;")
        .replaceAll(/>/g, "&gt;")
        .replaceAll(/"/g, "&quot;")
        .replaceAll(/'/g, "&#039;")
}


function crearAlumno({ nombre, curso, edad }) {
    const nuevoId = generarNuevoId()
    listadoAlumnos.push({
        id: nuevoId,
        nombre: nombre,
        curso: curso,
        edad: edad
    })
}

function actualizarAlumno(id, { nombre, curso, edad }) {
    const indice = listadoAlumnos.findIndex(alumno => alumno.id === id)
    if (indice !== -1) {
        listadoAlumnos[indice] = {
            id: id,
            nombre: nombre,
            curso: curso,
            edad: edad
        }
        return true
    }
    return false
}

function eliminarAlumno(id) {
    listadoAlumnos = listadoAlumnos.filter(alumno => alumno.id !== id)
}

function generarNuevoId() {
    const indiceMaximo = listadoAlumnos.reduce((maximo, alumno) => {
        return Math.max(maximo, alumno.id)
    }, 0)
    return indiceMaximo + 1
}

function obtenerDatosFormulario() {
    const inputNombre = document.querySelector("#nombre")
    const inputCurso = document.querySelector("#curso")
    const inputEdad = document.querySelector("#edad")
    const nombre = inputNombre.value.trim()
    const curso = inputCurso.value.trim()
    const edad = Number(inputEdad.value)
    return { nombre, curso, edad }
}

function limpiarFormulario() {
    const form = document.querySelector("#formularioAlumno")
    const inputId = document.querySelector("#id")
    const btnCancelar = document.querySelector("#btnCancelarFormulario")
    const btnGuardarFormulario = document.querySelector("#btnGuardarFormulario")
    inputId.value = ""
    form.reset()
    btnGuardarFormulario.textContent = "Guardar cambios"
    btnCancelar.disabled = false
}

function cargarFormularioEdicion(alumno) {
    const inputId = document.querySelector("#id")
    const inputNombre = document.querySelector("#nombre")
    const inputCurso = document.querySelector("#curso")
    const inputEdad = document.querySelector("#edad")
    const btnCancelar = document.querySelector("#btnCancelarFormulario")
    const btnGuardarFormulario = document.querySelector("#btnGuardarFormulario")
    inputId.value = alumno.id
    inputNombre.value = alumno.nombre
    inputCurso.value = alumno.curso
    inputEdad.value = alumno.edad
    btnGuardarFormulario.textContent = "Guardar cambios"
    btnCancelar.disabled = false
}

function guardarEnLocalStorage() {
    localStorage.setItem(localStorageKey, JSON.stringify(listadoAlumnos))
    const estadoCarga = document.querySelector("#estadoCarga")
    estadoCarga.textContent = "Datos guardados en localStorage..."
}

function resetearLocalStorage() {
    localStorage.removeItem(localStorageKey)
    const estadoCarga = document.querySelector("#estadoCarga")
    estadoCarga.textContent = "LocalStorage reseteado, cargando JSON inicial..."
    limpiarFormulario()
    renderizarTabla()
}

document.querySelector("#formularioAlumno").addEventListener("submit", (evento) => {
    evento.preventDefault()
    const datos = obtenerDatosFormulario()

    if (!datos.nombre || !datos.curso || !Number.isFinite(datos.edad)) {
        return
    }

    const inputId = document.querySelector("#id")
    const idEdicion = inputId.value ? Number(inputId.value) : null

    if (idEdicion) {
        actualizarAlumno(idEdicion, datos)
    } else {
        crearAlumno(datos)
    }

    limpiarFormulario()
    renderizarTabla()
})

document.querySelector("#btnCancelarFormulario").addEventListener("click", () => {
    limpiarFormulario()
})

document.querySelector("#btnGuardarLS").addEventListener("click", () => {
    guardarEnLocalStorage()
})

document.querySelector("#btnResetLS").addEventListener("click", () => {
    resetearLocalStorage()
})


document.querySelector("#tbodyAlumnos").addEventListener("click", (evento) => {
    const boton = evento.target.closest("button")

    if (!boton) {
        return
    }

    const id = Number(boton.dataset.id)
    const accion = boton.dataset.accion

    if (accion === "editar") {
        const alumno = listadoAlumnos.find(alumno => alumno.id === id)
        if (alumno) {
            cargarFormularioEdicion(alumno)
        }
    }

    if (accion === "eliminar") {
        eliminarAlumno(id)
        const inputId = document.querySelector("#id")
        if (inputId.value && Number(inputId.value) === id) {
            limpiarFormulario()
        }
        renderizarTabla()
    }
})

cargarDatos()