import express from 'express';
import {mostrarFormularioCrearCurso, insertar, formularioModificar, modificar, eliminar, validar, consultarTodos,consultarPorFiltro } from '../controllers/CursoController';

const router = express.Router();

router.get('/listarCursos', consultarTodos);
router.get('/cursos/listarCursos', consultarPorFiltro);
//insertar

router.get('/creaCursos', mostrarFormularioCrearCurso);
router.post('/', validar(), insertar);

//modificar

router.get('/modificaCurso/:id', formularioModificar);
router.get('/modificaCurso/:id', async (req, res) => {
    try {
        const curso = await formularioModificar(req, res); 
        if (!curso) {
            return res.status(404).send('Curso no encontrado');
        }
        res.render('modificaCurso', {
            curso, 
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
router.put('/:id', modificar); 

//eliminar
router.delete('/:id', eliminar); ///:idestudiante


export default router;
 