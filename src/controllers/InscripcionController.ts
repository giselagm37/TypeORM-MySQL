import { Request, Response, NextFunction } from 'express';
import { check, validationResult } from 'express-validator';
import { CursoEstudiante } from '../models/cursoEstudianteModel';
import { AppDataSource } from '../db/conexion';
import { Estudiante } from '../models/estudianteModel';
import { Curso } from '../models/cursoModel';
import { console } from 'inspector';


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
                return res.render('creaIncripciones', {
                    pagina: 'Crear Inscripcion',
                    errores: errores.array()
                });
            }
            next();
        }
    ];

/*export const consultarInscripciones = async(req:Request, res:Response) => {
    try {
        const cursoEstudianteRepository = AppDataSource.getRepository(CursoEstudiante);
        cursoEstudiante = await cursoEstudianteRepository.find(
            { relations: ["estudiante", "curso"] });
            console.log(cursoEstudiante);
            res.render('listarInscripciones', {
                pagina: 'Lista de Inscripciones',
                cursoEstudiante
        }
        )
            
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
};*/
export const consultarInscripciones = async (req: Request, res: Response) => {
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

/*export const consultarxAlumno = async(req:Request, res:Response): Promise<CursoEstudiante[] | null> => {  */  // 
export const consultarxAlumno = async (req: Request, res: Response) => {
//devuelve un arreglo de estudiante
    const { estudiante_id} = req.params;
    console.log(req.params);
    const idNumber = Number(estudiante_id);
    if (isNaN(idNumber)) {
        throw new Error('ID inválido, debe ser un número');
    }
    
    
    try {
        const cursoEstudianteRepository = AppDataSource.getRepository(CursoEstudiante)
        /*const cursoEstudiante = await cursoEstudianteRepository.find({where: {estudiante:{id: Number(estudiante_id) }}})*/
        const cursoEstudiante = await cursoEstudianteRepository.find({ where: { estudiante: { id: idNumber } }, relations: ["curso"] });
        if (cursoEstudiante.length > 0) {
            return cursoEstudiante;
        } else {
            
            return null; 
        }
      
    } catch (err: unknown) {
        if (err instanceof Error) {
            throw err; 
        } else {
            throw new Error('Error desconocido');
        }
    }
};
/*export const consultarxCurso = async(req:Request, res:Response): Promise<CursoEstudiante | null> => {*/
export const consultarxCurso = async (req: Request, res: Response) => {
    const { curso_id } = req.params;
    console.log(req.params);
        if ( isNaN(Number(curso_id))) {
            res.status(400).json({ mensaje: 'ID inválido' });
        }
        
            try {
                const cursoEstudianteRepository = AppDataSource.getRepository(CursoEstudiante);
                /*const cursoEstudiante = await cursoEstudianteRepository.findOne({ where: {curso: { id: Number(curso_id) } }});*/
                const cursoEstudiante = await cursoEstudianteRepository.find({ where: { curso: { id: Number(curso_id) } }, relations: ["estudiante"] });
                if (cursoEstudiante) {
                    return cursoEstudiante;
                } else {
                    
                    return null; 
                }
            } catch(err: unknown){
            if (err instanceof Error){
                throw err; 
            } else {
                throw new Error('Error desconocido');
            }
        }
    };
/*    export const inscribir = async (req:Request, res:Response) => {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.render('creaInscripciones', {
                pagina: 'Crear Inscripción',
                errores: errores.array()
            });
        }        
        const { estudiante_id, curso_id, nota} = req.body;
        console.log(req.body);
     
        
        try {
            await AppDataSource.transaction(async (transactionalEntityManager) => {
                const cursoRepository = transactionalEntityManager.getRepository(Curso);
                const estudianteRepository = transactionalEntityManager.getRepository(Estudiante);
                const cursoEstudianteRepository = transactionalEntityManager.getRepository(CursoEstudiante);
                console.log(estudiante_id);
                console.log(curso_id);
                const existeEstudiante = await estudianteRepository.findOne({ where: { id: Number (estudiante_id) }, relations: ['cursos']  });//.findOne({ where: { id:estudiante_id } });
                if (!existeEstudiante) {
                    return res.status(404).json({ mensaje: 'El estudiante no existe.' });
                }

                const existeCurso = await cursoRepository.findOne({ where: { id: Number (curso_id) }, relations: ['estudiantes']  });//.findOne({ where: { id:curso_id } });
                if (!existeCurso) {
                    return res.status(404).json({ mensaje: 'El curso no existe.' });
                }
    
                
    
                const inscripto = await cursoEstudianteRepository.findOne({
                    where: {
                        estudiante: { id: estudiante_id },
                        curso: { id: curso_id }
                        
                    }
                });
                console.log(inscripto);
                if (inscripto) {
                    return res.status(400).json({ mensaje: 'El estudiante ya está inscripto en este curso.' });
                }
                    
                const nuevaInscripcion = cursoEstudianteRepository.create({
                    curso: existeCurso,
                    estudiante: existeEstudiante, 
                    nota    
                });
                console.log(nuevaInscripcion);
                await cursoEstudianteRepository.save(nuevaInscripcion);
            });
    
            // Asegúrate de traer las relaciones con estudiante y curso
            const cursoEstudiante = await AppDataSource.getRepository(CursoEstudiante).find({
                relations: ['curso', 'estudiante'], //  relaciones
            });
            console.log(cursoEstudiante)
            res.redirect('/CursosEstudiantes/listarInscripciones');
            /*console.log(cursoEstudiante);
            res.render('listarInscripciones', {
                pagina: 'Lista de inscripciones',
                cursoEstudiante
            });
        } catch (err) {
            if (err instanceof Error) {
                res.status(500).send(err.message);
            }
        }
    };*/
    export const inscribir = async (req: Request, res: Response) => {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.render('creaInscripciones', {
                pagina: 'Crear Inscripción',
                errores: errores.array()
            });
        }
        
        const { estudiante_id, curso_id, calificacion } = req.body; // desestructura
        console.log(req.body);
        try {
            await AppDataSource.transaction(async (transactionalEntityManager) => {
                const cursoRepository = transactionalEntityManager.getRepository(Curso);
                const estudianteRepository = transactionalEntityManager.getRepository(Estudiante);
                const cursoEstudianteRepository = transactionalEntityManager.getRepository(CursoEstudiante);
    
                const existeEstudiante = await estudianteRepository.findOne({ where: { id: Number(estudiante_id) }, relations: ['estudiantes'] });//.findOne({ where: { id:estudiante_id } });
                if (!existeEstudiante) {
                    return res.status(404).json({ mensaje: 'El estudiante no existe.' });
                }
    
                const existeCurso = await cursoRepository.findOne({ where: { id: Number(curso_id) }, relations: ['cursos'] });//.findOne({ where: { id:curso_id } });
                if (!existeCurso) {
                    return res.status(404).json({ mensaje: 'El curso no existe.' });
                }
    
                const inscripto = await cursoEstudianteRepository.findOne({
                    where: { estudiante: { id: estudiante_id }, curso: { id: curso_id } }
                });
                if (inscripto) {
                    return res.status(400).json({ mensaje: 'El estudiante ya está inscripto en este curso.' });
                }
                existeEstudiante.cursos.push(existeCurso);
                existeCurso.estudiantes.push(existeEstudiante);
                
                const nuevaInscripcion = cursoEstudianteRepository.create({
                    curso: existeCurso,
                    estudiante: existeEstudiante,
                    nota: calificacion // Asegúrate de que esto sea el campo correcto
                });
                await cursoEstudianteRepository.save(nuevaInscripcion);
            });
    
            res.redirect('/CursosEstudiantes/listarInscripciones');
        } catch (err) {
            console.error(err); // Registro del error
            if (err instanceof Error) {
                res.status(500).send(err.message);
            }
        }
    };
       
    


    
export const cancelarInscripcion = async(req:Request, res:Response): Promise<void> => {
        const { estudiante_id, curso_id } = req.params;

        try {
            console.log(`ID recibido para eliminar: ${curso_id}`); 
            await AppDataSource.transaction(async transactionalEntityManager => {
                //verificamos el estudiante
                const estudiante = await transactionalEntityManager.findOne(Estudiante, { where: { id: parseInt(estudiante_id, 10) } });
                if (!estudiante) {
                    return res.status(400).json({ mens: 'Estudiante no existe' });
                }

           //verificamos el curso
                const curso = await transactionalEntityManager.findOne(Curso, { where: { id: parseInt(curso_id, 10) } });
                if (!curso) {
                    return res.status(400).json({ mens: 'Curso no existe' });
                }

                const inscripcion = await transactionalEntityManager.findOne(CursoEstudiante, {
                    where: {
                        estudiante: { id: parseInt(estudiante_id, 10) },
                        curso: { id: parseInt(curso_id, 10) }
                    }
                });
                if (!inscripcion) {
                    return res.status(400).json({ mens: 'La inscripción no existe' });
                }
 
                if (inscripcion.nota > 0) {
                    return res.status(400).json({ mens: 'No se puede cancelar la inscripción porque el estudiante ya ha sido calificado' });
                }
               
                await transactionalEntityManager.remove(inscripcion);

                res.status(200).json({ mens: 'Inscripción cancelada' });
            });
        } 
      catch(err){
          if (err instanceof Error){
             res.status(500).send(err.message);
          }
      }
      }
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
            calificado.nota = calificacion;  // No crear un nuevo objeto, solo actualizar la relación existente

           // Guardar la actualización
           await cursoEstudianteRepository.save(calificado);
    
            return res.json({ mensaje: 'Calificación asignada correctamente' });

          
        } catch (err: unknown) {
            if (err instanceof Error) {
                return res.status(500).json({ mensaje: err.message });
            }
        }
    }; 
    

