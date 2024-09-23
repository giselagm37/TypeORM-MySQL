import { Request, Response, NextFunction } from 'express';
import { check, validationResult } from 'express-validator';
import { CursoEstudiante } from '../models/cursoEstudianteModel';
import { AppDataSource } from '../db/conexion';
import { Estudiante } from '../models/estudianteModel';
import { Curso } from '../models/cursoModel';

var cursoEstudiante: CursoEstudiante[]; 

export const validar = () => [
    check('estudiante_id')
        .notEmpty().withMessage('El id es obligatorio')
        .isNumeric().withMessage('El ID debe ser un número')
        .isLength({ min: 4 }).withMessage('Debe introducir un número válido'),
    check('curso_id')
        .notEmpty().withMessage('El id es obligatorio')
        .isLength({ min: 4 }).withMessage('Debe introducir un numero valido'),
    check('calificacion').isFloat({ min: 0, max: 10 }).withMessage('La calificación debe ser un número entre 0 y 10'),    
        (req: Request, res: Response, next: NextFunction) => {
            const errores = validationResult(req);
            if (!errores.isEmpty()) {
                return res.render('creaInscripciones', {
                    pagina: 'Crear Inscripcion',
                    errores: errores.array()
                });
            }
            next();
        }
    ];

    export const consultarInscripciones = async (req: Request, res: Response) => {
        const { estudiante_id, curso_id } = req.query;
    
        try {
            const cursoEstudianteRepository = AppDataSource.getRepository(CursoEstudiante);
            const estudiantesRepository = AppDataSource.getRepository(Estudiante);
            const cursosRepository = AppDataSource.getRepository(Curso);
            
            const whereConditions: any = {};
    
            if (estudiante_id) {
                const estudianteIdNumber = Number(estudiante_id);
                if (!isNaN(estudianteIdNumber)) {
                    whereConditions.estudiante = { id: estudianteIdNumber };
                }
            }
            
            if (curso_id) {
                const cursoIdNumber = Number(curso_id);
                if (!isNaN(cursoIdNumber)) {
                    whereConditions.curso = { id: cursoIdNumber };
                }
            }
    
            // Filtra según los parámetros, si se proporcionan
            const cursoEstudiante = await cursoEstudianteRepository.find({
                where: whereConditions,
                relations: ['estudiante', 'curso']
            });
    
            const estudiantes = await estudiantesRepository.find();
            const cursos = await cursosRepository.find();
    
            res.render('listarInscripciones', {
                pagina: 'Lista de Inscripciones',
                cursoEstudiante,
                estudiantes, 
                cursos 
            });
            
        } catch (err: unknown) {
            if (err instanceof Error) {
                res.status(500).send(err.message);
            }
        }
    };
//FUNCIONA PERO TRAE SIEMPRE TODOS LOS DATOS    
    /*export const consultarInscripciones = async (req: Request, res: Response) => {
        try {
            const cursoEstudianteRepository = AppDataSource.getRepository(CursoEstudiante);
            const estudiantesRepository = AppDataSource.getRepository(Estudiante);
            const cursosRepository = AppDataSource.getRepository(Curso);
            
            const cursoEstudiante = await cursoEstudianteRepository.find({ relations: ['estudiante', 'curso'] });
            const estudiantes = await estudiantesRepository.find(); // Obtener todos los estudiantes
            const cursos = await cursosRepository.find(); // Obtener todos los cursos
            
            res.render('listarInscripciones', {
                pagina: 'Lista de Inscripciones',
                cursoEstudiante,
                estudiantes, 
                cursos 
            });
            
        } catch (err: unknown) {
            if (err instanceof Error) {
                res.status(500).send(err.message);
            }
        }
    };
    /*
    export const consultarxAlumno = async (req: Request, res: Response) => {
        console.log(cursoEstudiante);
        const { estudiante_id, curso_id } = req.params;
    
        const estudianteIdNumber = Number(estudiante_id);
        const cursoIdNumber = Number(curso_id);
        
        if (isNaN(estudianteIdNumber) || isNaN(cursoIdNumber)) {
            return null; // Indica un error en los ID
        }
    
        try {
            const cursoEstudianteRepository = AppDataSource.getRepository(CursoEstudiante);
            const cursoEstudiante = await cursoEstudianteRepository.findOne({
                where: { estudiante: { id: estudianteIdNumber }, curso: { id: cursoIdNumber } },
                relations: ["curso"]
            });
            console.log(cursoEstudiante);
            return cursoEstudiante; // Solo retorna el objeto
        } catch (err: unknown) {
            // Maneja el error, pero no respondas con JSON aquí
            console.error(err);
            return null; // Indica un error en la consulta
        }
    };
    
    export const consultarxCurso = async (req: Request, res: Response) => {
        const { curso_id } = req.params;
    
        const idNumber = Number(curso_id);
        if (isNaN(idNumber)) {
            return res.status(400).json({ mensaje: 'ID inválido, debe ser un número' });
        }
        
        try {
            const cursoEstudianteRepository = AppDataSource.getRepository(CursoEstudiante);
            const cursoEstudiante = await cursoEstudianteRepository.find({ where: { curso: { id: idNumber } }, relations: ["estudiante"] });
    
            if (cursoEstudiante.length > 0) {
                return res.json(cursoEstudiante);
            } else {
                return res.status(404).json({ mensaje: 'No se encontraron inscripciones para el curso' });
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                return res.status(500).json({ mensaje: err.message });
            } else {
                return res.status(500).json({ mensaje: 'Error desconocido' });
            }
        }
    };*/
    export const consultarPorFiltro = async (req: Request, res: Response) => {
        const { estudiante_id, curso_id } = req.params;
    
        // Preparar condiciones de filtrado
        const whereConditions: any = {};
        if (estudiante_id) {
            const estudianteIdNumber = Number(estudiante_id);
            if (!isNaN(estudianteIdNumber)) {
                whereConditions.estudiante = { id: estudianteIdNumber };
            }
        }
        if (curso_id) {
            const cursoIdNumber = Number(curso_id);
            if (!isNaN(cursoIdNumber)) {
                whereConditions.curso = { id: cursoIdNumber };
            }
        }
    
        try {
            const cursoEstudianteRepository = AppDataSource.getRepository(CursoEstudiante);
            const inscripciones = await cursoEstudianteRepository.find({
                where: whereConditions,
                relations: ["curso", "estudiante"] // Asegúrate de incluir las relaciones necesarias
            });
    
            if (inscripciones.length === 0) {
                return res.status(404).send('No se encontraron inscripciones con los filtros proporcionados');
            }
    
            console.log(inscripciones);
            return res.render('listarInscripciones', { inscripciones }); // Renderiza la vista con los resultados filtrados
        } catch (err: unknown) {
            console.error(err);
            return res.status(500).send('Error en la consulta');
        }
    };
        



    export const mostrarFormularioInscripcion = async (req: Request, res: Response) => {
        try {
            const estudianteRepository = AppDataSource.getRepository(Estudiante);
            const cursoRepository = AppDataSource.getRepository(Curso);
            
            const estudiantes = await estudianteRepository.find(); ;
            const cursos = await cursoRepository.find(); ;
            console.log(estudiantes)
            console.log(cursos)
            res.render('creaInscripciones', {
                pagina: 'Crear Inscripción',
                estudiantes,
                cursos
            });
            console.log(cursos);
            console.log(estudiantes);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al cargar el formulario de inscripción');
        }
    };   
 /*  export const inscribir = async (req: Request, res: Response) => {
        const errores = validationResult(req);
        
        // Verifica si hay errores de validación
        if (!errores.isEmpty()) {
            console.log(errores);
            const estudianteRepository = AppDataSource.getRepository(Estudiante);
            const cursoRepository = AppDataSource.getRepository(Curso);
            
            const estudiantes = await estudianteRepository.find();
            const cursos = await cursoRepository.find();
            console.log(cursos);
            console.log(estudiantes);
            return res.render('creaInscripciones', {
                pagina: 'Crear Inscripción',
                estudiantes,
                cursos
                
            });
        }
        
        const { estudiante_id, curso_id, calificacion } = req.body; // Desestructura
        console.log(req.body);
        
        try {
            await AppDataSource.transaction(async (transactionalEntityManager) => {
                const cursoRepository = transactionalEntityManager.getRepository(Curso);
                const estudianteRepository = transactionalEntityManager.getRepository(Estudiante);
                const cursoEstudianteRepository = transactionalEntityManager.getRepository(CursoEstudiante);
        
                // Verifica si el estudiante existe
                const existeEstudiante = await estudianteRepository.findOne({ where: { id: Number(estudiante_id) } });
                console.log(existeEstudiante);
                if (!existeEstudiante) {
                    return res.status(404).json({ mensaje: 'El estudiante no existe.' });
                }
        
                // Verifica si el curso existe
                const existeCurso = await cursoRepository.findOne({ where: { id: Number(curso_id) } });
                console.log(existeCurso);
                if (!existeCurso) {
                    return res.status(404).json({ mensaje: 'El curso no existe.' });
                }
        
                // Verifica si el estudiante ya está inscrito en el curso
                const inscripto = await cursoEstudianteRepository.findOne({
                    where: { estudiante: { id: estudiante_id }, curso: { id: curso_id } }
                });
                console.log(inscripto);
                if (inscripto) {
                    return res.status(400).json({ mensaje: 'El estudiante ya está inscripto en este curso.' });
                }
        
                // Crea la nueva inscripción
                /*const nuevaInscripcion = cursoEstudianteRepository.create({
                    curso: existeCurso,
                    estudiante: existeEstudiante,
                    nota: calificacion // Asegúrate de que esto sea el campo correcto
                });*/
                /*
                const nuevaInscripcion = cursoEstudianteRepository.create({
                    
                    estudiante_id: Number(estudiante_id), // Usar el id directamente
                    curso_id:  Number(curso_id), // Usar el id directamente
                    nota: calificacion
                });
                
                await cursoEstudianteRepository.save(nuevaInscripcion);
                console.log(nuevaInscripcion);
            });
    
            // Redirige a la lista de inscripciones
            res.redirect('/CursosEstudiantes/listarInscripciones');
          
        } catch (err) {
            console.error(err); // Registro del error
            if (err instanceof Error) {
                res.status(500).send(err.message);
            }
        }
    };*/
    export const inscribir = async (req: Request, res: Response) => {
        const errores = validationResult(req);
        
        // Verifica si hay errores de validación
        if (!errores.isEmpty()) {
            // Maneja errores
            const estudianteRepository = AppDataSource.getRepository(Estudiante);
            const cursoRepository = AppDataSource.getRepository(Curso);
            
            const estudiantes = await estudianteRepository.find();
            const cursos = await cursoRepository.find();
            return res.render('creaInscripciones', {
                pagina: 'Crear Inscripción',
                estudiantes,
                cursos
            });
        }
        
        // Convierte a número
        const estudianteId = Number(req.body.estudiante_id);
        const cursoId = Number(req.body.curso_id);
        const calificacion = req.body.calificacion; // Asume que esta viene como número también
    
        try {
            await AppDataSource.transaction(async (transactionalEntityManager) => {
                const cursoRepository = transactionalEntityManager.getRepository(Curso);
                const estudianteRepository = transactionalEntityManager.getRepository(Estudiante);
                const cursoEstudianteRepository = transactionalEntityManager.getRepository(CursoEstudiante);
    
                // Verifica si el estudiante existe
                const existeEstudiante = await estudianteRepository.findOne({ where: { id: estudianteId } });
                if (!existeEstudiante) {
                    return res.status(404).json({ mensaje: 'El estudiante no existe.' });
                }
    
                // Verifica si el curso existe
                const existeCurso = await cursoRepository.findOne({ where: { id: cursoId } });
                if (!existeCurso) {
                    return res.status(404).json({ mensaje: 'El curso no existe.' });
                }
    
                // Verifica si el estudiante ya está inscrito en el curso
                const inscripto = await cursoEstudianteRepository.findOne({
                    where: { estudiante: { id: estudianteId }, curso: { id: cursoId } }
                });
                if (inscripto) {
                    return res.status(400).json({ mensaje: 'El estudiante ya está inscripto en este curso.' });
                }
    
                // Crea la nueva inscripción
                const nuevaInscripcion = cursoEstudianteRepository.create({
                    curso: existeCurso,
                    estudiante: existeEstudiante,
                    nota: calificacion
                });
                await cursoEstudianteRepository.save(nuevaInscripcion);
            });
    
            // Redirige a la lista de inscripciones
            res.redirect('/CursosEstudiantes/listarInscripciones');
          
        } catch (err) {
            console.error(err);
            if (err instanceof Error) {
                res.status(500).send(err.message);
            }
        }
    };
    

/*export const cancelarInscripcion = async(req:Request, res:Response): Promise<void> => {
        const { estudiante_id, curso_id } = req.params;

        try {
            console.log(`ID recibido para eliminar: ${curso_id}`); 
            await AppDataSource.transaction(async transactionalEntityManager => {
                //verificamos el estudiante
                const estudiante = await transactionalEntityManager.findOne(Estudiante, { where: { id: parseInt(estudiante_id, 10) } });
                if (!estudiante) {
                    throw new Error('Estudiante no existe');
                }

           //verificamos el curso
                const curso = await transactionalEntityManager.findOne(Curso, { where: { id: parseInt(curso_id, 10) } });
                if (!curso) {
                    throw new Error('Estudiante no existe');
                }

                const inscripcion = await transactionalEntityManager.findOne(CursoEstudiante, {
                    where: {
                        estudiante: { id: parseInt(estudiante_id, 10) },
                        curso: { id: parseInt(curso_id, 10) }
                    }
                });
                if (!inscripcion) {
                    throw new Error('Estudiante no existe');
                }
 
                if (inscripcion.nota > 0) {
                    throw new Error('No se puede cancelar la inscripción porque el estudiante ya ha sido calificado');
                }
               
                await transactionalEntityManager.remove(inscripcion);

                res.status(200).json({ mens: 'Inscripción cancelada' });
            });
        } 
      catch(err){
        if (err instanceof Error) {
            res.status(400).json({ mensaje: err.message });
        } else {
            res.status(500).json({ mensaje: 'Ocurrió un error inesperado' });
        }
    }
};*/
export const cancelarInscripcion = async (req: Request, res: Response) => {
    const { estudiante_id, curso_id } = req.params;
    console.log(`/CursosEstudiantes/${estudiante_id}/${curso_id}`);


    try {
        const cursoEstudianteRepository = AppDataSource.getRepository(CursoEstudiante);
        
        // Busca la inscripción a eliminar
        const inscripcion = await cursoEstudianteRepository.findOne({
            where: {
                estudiante: { id: Number(estudiante_id) },
                curso: { id: Number(curso_id) }
            }
        });

        if (!inscripcion) {
            return res.status(404).json({ mensaje: 'Inscripción no encontrada' });
        }

        // Elimina la inscripción
        await cursoEstudianteRepository.remove(inscripcion);
        
        return res.json({ mensaje: 'Inscripción eliminada' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ mensaje: 'Error al eliminar inscripción' });
    }
};



export const calificar = async (req: Request, res: Response) => {
        const { curso_id, estudiante_id, calificacion } = req.body;
    
        try {
            // Buscar Inscripcion
            const cursoEstudianteRepository = AppDataSource.getRepository(CursoEstudiante);
            const calificado = await cursoEstudianteRepository.findOne({
                where: { curso: { id: curso_id }, estudiante: { id: estudiante_id } }
            });
    
            if (!calificado) {
                return res.status(404).send('El estudiante no está inscrito en el curso');
            }
    
            // Asignar la calificación
            calificado.nota = calificacion;  

           // Guardar la actualización
           await cursoEstudianteRepository.save(calificado);
    
            return res.json({ mensaje: 'Calificación asignada correctamente' });

          
        } catch (err: unknown) {
            if (err instanceof Error) {
                return res.status(500).json({ mensaje: err.message });
            }
        }
    }; 
    
    export const mostrarFormularioModificacion = async (req: Request, res: Response) => {
        try {
            const { estudiante_id, curso_id } = req.params;
            
            const cursoEstudianteRepository = AppDataSource.getRepository(CursoEstudiante);
            const cursoEstudiante = await cursoEstudianteRepository.findOne({
                where: {
                    estudiante_id: Number(estudiante_id),
                    curso_id: Number(curso_id)
                },
                relations: ['estudiante', 'curso']
            });
    
            if (!cursoEstudiante) {
                return res.status(404).send('Inscripción no encontrada');
            }
    
            res.render('modificarInscripcion', {
                pagina: 'Modificar Inscripción',
                cursoEstudiante
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al cargar el formulario de modificación');
        }
    };
    export const actualizarInscripcion = async (req: Request, res: Response) => {
        try {
            const { estudiante_id, curso_id } = req.params;
            const { nota } = req.body;
    
            const cursoEstudianteRepository = AppDataSource.getRepository(CursoEstudiante);
            
            const cursoEstudiante = await cursoEstudianteRepository.findOne({
                where: {
                    estudiante_id: Number(estudiante_id),
                    curso_id: Number(curso_id)
                }
            });
    
            if (!cursoEstudiante) {
                return res.status(404).send('Inscripción no encontrada');
            }
    
            cursoEstudiante.nota = nota;
            await cursoEstudianteRepository.save(cursoEstudiante);
    
            res.redirect('/CursosEstudiantes/listarInscripciones');
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al actualizar la inscripción');
        }
    };
