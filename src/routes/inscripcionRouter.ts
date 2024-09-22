/*import express from "express";
const router=express.Router();
import incripcionController from '../controllers/InscripcionController';


router.get('/',incripcionController.consultarInscripciones);
router.get('/xAlumno/:id',incripcionController.consultarxAlumno );
router.get('/xCurso/:id',incripcionController.consultarxCurso );
router.post('/:estudiante_id/:curso_id',incripcionController.calificar );

router.post('/',incripcionController.inscribir );
router.delete('/:estudiante_id/:curso_id',incripcionController.cancelarInscripcion);

export default router;*/

import express from 'express';
import { inscribir, calificar, cancelarInscripcion, validar, consultarxAlumno, consultarxCurso, consultarInscripciones } from '../controllers/InscripcionController';


const router = express.Router();

router.get('/listarInscripciones', consultarInscripciones);
router.get('/listarInscripciones/curso_id', consultarxCurso);
router.get('/listarInscripciones/estudiante_id', consultarxAlumno);



//insertar

router.get('/creaInscripciones', (req, res) => {
    res.render('creaInscripciones', {
        pagina: 'Crear Inscripcion',
    });
});

router.post('/', validar(), inscribir);

//modificar
router.get('/modificaInscripcion/:id', async (req, res) => {
    try {
        const cursoEstudiante = await consultarxAlumno(req, res); 
        if (!cursoEstudiante) {
            return res.status(404).send('Inscripción no encontrado');
        }
        res.render('modificaInscripcion', {
            cursoEstudiante, 
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});

router.post('/calificar', calificar); 

//eliminar
router.delete('/:id', cancelarInscripcion);

export default router;
 