

import express from 'express';
import {
    inscribir,
    calificar,
    cancelarInscripcion,
    validar,
    consultarPorFiltro,
    consultarInscripciones,
    mostrarFormularioModificacion,
    mostrarFormularioInscripcion,
    actualizarInscripcion
} from '../controllers/InscripcionController';

const router = express.Router();

// Listar inscripciones
router.get('/listarInscripciones', consultarInscripciones);
/*router.get('/listarInscripciones/curso_id', consultarxCurso);
router.get('/listarInscripciones/estudiante_id', consultarxAlumno);*/
router.get('/CursosEstudiantes/listarInscripciones', consultarPorFiltro);

// Insertar inscripciones
router.get('/creaInscripciones', mostrarFormularioInscripcion);  // Usa el controlador para renderizar el formulario
router.post('/inscribir', validar(), inscribir);  // Validar antes de inscribir

// Modificar inscripciones
router.get('/modificarInscripcion/:estudiante_id/:curso_id', mostrarFormularioModificacion);

// Calificar
router.post('/calificar', calificar);

router.post('/actualizarInscripcion/:estudiante_id/:curso_id', actualizarInscripcion);
// Eliminar inscripciones

router.delete('/CursosEstudiantes/:estudiante_id/:curso_id', cancelarInscripcion);



export default router;
