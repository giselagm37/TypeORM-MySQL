import { Request, Response, NextFunction } from 'express';
import { check, validationResult } from 'express-validator';
import { AppDataSource } from '../db/conexion';
import { Curso } from '../models/cursoModel';
import { Profesor } from '../models/profesorModel';
import { CursoEstudiante } from '../models/cursoEstudianteModel';
import { Estudiante } from '../models/estudianteModel';
import { Like } from 'typeorm'; //para realizar búsquedas parciales

var cursos: Curso[];

export const validar = () => [
    
    check('nombre').notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ min: 3 }).withMessage('El Nombre debe tener al menos 3 caracteres'),
    check('descripcion').notEmpty().withMessage('La descripción es obligatoria')    
        .isLength({ min: 3 }).withMessage('La Descripción debe tener al menos 3 caracteres'),
        
    (req: Request, res: Response, next: NextFunction) => {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.render('creaCursos', {
                pagina: 'Crear Curso',
                errores: errores.array()
            });
        }
        next();
    }
];


export const consultarTodos = async (req: Request, res: Response) => {
    const { profesor_id } = req.query;

    try {
        const cursoRepository = AppDataSource.getRepository(Curso);
        const profesorRepository = AppDataSource.getRepository(Profesor);

        // Condiciones de búsqueda
        const whereConditions: any = {};

        // Filtrar por ID de profesor si se proporciona
        if (profesor_id) {
            const profesorIdNumber = Number(profesor_id);
            if (!isNaN(profesorIdNumber)) {
                whereConditions.profesor = { id: profesorIdNumber };
            }
        }

        // Obtener cursos que coinciden con las condiciones
        const cursos = await cursoRepository.find({
            where: whereConditions,
            relations: ['profesor'], // Añadimos la relación con profesor
        });

        // Obtener todos los profesores para el formulario
        const profesores = await profesorRepository.find();

        // Renderizar la vista
        res.render('listarCursos', {
            pagina: 'Lista de Cursos',
            cursos,
            profesores
        });

    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
};
export const consultarPorFiltro = async (req: Request, res: Response) => {
    const { profesor_id } = req.query; // Solo capturamos profesor_id

    // Preparar condiciones de filtrado
    const whereConditions: any = {};

    // Filtrar por ID de profesor si se proporciona
    if (profesor_id) {
        const profesorIdNumber = Number(profesor_id);
        if (!isNaN(profesorIdNumber)) {
            whereConditions.profesor = { id: profesorIdNumber };
        }
    }

    try {
        const cursoRepository = AppDataSource.getRepository(Curso);
        const cursos = await cursoRepository.find({
            where: whereConditions,
            relations: ['profesor'], // Aseguramos que traemos la relación con profesor
        });

        if (cursos.length === 0) {
            return res.status(404).send('No se encontraron cursos con el profesor proporcionado');
        }

        return res.render('listarCursos', { cursos });
    } catch (err: unknown) {
        console.error(err);
        return res.status(500).send('Error en la consulta');
    }
};



/* FUNCIONA
export const consultarTodos = async (req: Request, res: Response) => {
        try {
            const cursoRepository = AppDataSource.getRepository(Curso);
            cursos = await cursoRepository.find({
                relations: ['profesor'], // Añadimos la relación con profesor
            });
            res.render('listarCursos', {
                pagina: 'Lista de Cursos',
                cursos 
            });
            console.log(cursos);        
        } catch (err: unknown) {
            if (err instanceof Error) {
                res.status(500).send(err.message);
            }
        }
    }

export const consultarUno = async (req: Request, res: Response): Promise<Curso | null> => { 
        const {id}=req.params;
        const idNumber = Number(id);
        if (isNaN(idNumber)) {
            throw new Error('ID inválido, debe ser un número');
        }
    
        try {
            const cursoRepository = AppDataSource.getRepository(Curso);
            const curso = await cursoRepository.findOne({
                where: { id: idNumber },
            });
            if (curso) {
                return curso;
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
*/
    export const mostrarFormularioCrearCurso = async (req: Request, res: Response) => {
        try {
            // Obtiene la lista de profesores
            const profesorRepository = AppDataSource.getRepository(Profesor);
            const profesores = await profesorRepository.find(); // Asegúrate de que hay profesores en la base de datos
    
            // Renderiza la vista y pasa los profesores
            res.render('creaCursos', {
                pagina: 'Crear Curso',
                profesores // Pasa los profesores a la vista
            });
        } catch (error) {
            console.error('Error al obtener los profesores:', error);
            res.status(500).send('Error al obtener los profesores');
        }
    };   
    export const insertar = async (req: Request, res: Response) => {
        const errores = validationResult(req);
    
        const profesorRepository = AppDataSource.getRepository(Profesor);
        const profesores = await profesorRepository.find();
    
        // Manejo de errores de validación
        if (!errores.isEmpty()) {
            return res.render('creaCursos', {
                pagina: 'Crear Curso',
                profesores, // Pasamos la lista de profesores a la vista
                errores: errores.array(), // Enviamos los errores a la vista
            });
        }
    
        const { nombre, descripcion, profesor_id } = req.body;
    
        try {
            await AppDataSource.transaction(async transactionalEntityManager => {
                const profesorRepository = transactionalEntityManager.getRepository(Profesor);
                const cursoRepository = transactionalEntityManager.getRepository(Curso);
                const existeProfesor = await profesorRepository.findOne({ where: { id: Number(profesor_id) } });
    
                if (!existeProfesor) {
                    throw new Error('El profesor no existe.');
                }
    
                const existeCurso = await cursoRepository.findOne({
                    where: [
                        { nombre },
                        { descripcion }
                    ]
                });
    
                if (existeCurso) {
                    throw new Error('El curso ya existe.');
                }
    
                const nuevoCurso = cursoRepository.create({ 
                    nombre, descripcion, profesor: existeProfesor });
                await cursoRepository.save(nuevoCurso);
            });
    
            res.redirect('/cursos/listarCursos');
        } catch (err: unknown) {
            console.error(err); // Registro del error
            if (err instanceof Error) {
                res.status(500).send(err.message);
            }
        }
    };
    
    export const formularioModificar = async (req: Request, res: Response) => {
        const { id } = req.params;
    
        try {
            // Obtener el curso por su ID
            const cursoRepository = AppDataSource.getRepository(Curso);
            const curso = await cursoRepository.findOne({ where: { id: parseInt(id) }, relations: ['profesor'] });
    
            if (!curso) {
                return res.status(404).json({ mensaje: 'El curso no existe' });
            }
    
            // Obtener todos los profesores
            const profesorRepository = AppDataSource.getRepository(Profesor);
            const profesores = await profesorRepository.find();
    
            // Renderizar la vista de modificación y pasar el curso y los profesores
            res.render('modificaCurso', {
                pagina: 'Modificar Curso',
                curso,
                profesores // Pasa los profesores a la vista
            });
        } catch (error) {
            console.error('Error al obtener el curso o los profesores:', error);
            res.status(500).send('Error al obtener el curso o los profesores');
        }
    };
    export const modificar = async (req: Request, res: Response) => {
        const { id } = req.params;
        const { nombre, descripcion, profesor_id } = req.body;
    
        try {
            const cursoRepository = AppDataSource.getRepository(Curso);
            const profesorRepository = AppDataSource.getRepository(Profesor);
    
            // Obtener el curso por ID
            const curso = await cursoRepository.findOne({ where: { id: parseInt(id) } });   
           
    
            if (!curso) {
                return res.status(404).json({ mensaje: 'El curso no existe' });
            }
    
            // Obtener el profesor por ID
            
            const profesor = await profesorRepository.findOne({ where: { id: profesor_id } });
            if (!profesor) {
                return res.status(404).json({ mensaje: 'El profesor no existe' });
            }
            
            
           
            // Merge los datos actualizados en el curso existente
            cursoRepository.merge(curso, { nombre, descripcion, profesor });
    
            // Guardar los cambios en la base de datos
            await cursoRepository.save(curso);
    
            // Redirigir a la vista de listar cursos después de la modificación
            return res.redirect('/cursos/listarCursos');
        } catch (error) {
            console.error('Error al modificar el curso:', error);
            return res.status(500).send('Error del servidor');
        }
    };
     
    
    
 /*    
export const modificar = async (req: Request, res: Response) => {

        const { id } = req.params;
        const { nombre, descripcion, profesor_id} = req.body;
    
        try {
            
            
            const cursoRepository = AppDataSource.getRepository(Curso);
            const curso = await cursoRepository.findOne({ where: { id: parseInt(id) } });   
            // Verificar si el curso y el profesor  existe
            if (!curso) {
                return res.status(404).json({ mensaje: 'El curso no existe' });
            }

            const profesorRepository = AppDataSource.getRepository(Profesor);
            const profesor = await profesorRepository.findOne({ where: { id: profesor_id } });
            if (!profesor) {
            return res.status(400).json({ mensaje: 'El profesor no existe' });
             }
            // Actualizar el curso
            cursoRepository.merge(curso, { nombre, descripcion, profesor });
            await cursoRepository.save(curso);

            return res.redirect('/cursos/listarCursos');
        } catch (error) {
            console.error('Error al modificar el curso:', error);
            return res.status(500).send('Error del servidor');
            }
        };
         */      
export const eliminar = async (req: Request, res: Response) => {
    console.log(req.params);  // Verifica qué parámetros llegan al backend
    const { id} = req.params;
    console.log(`ID Curso: ${id}`);

    if (!id ) {
        return res.status(400).json({ mensaje: 'Faltan parámetros' });
    }
    try{
        console.log(`ID recibido para eliminar: ${id} `); 
        await AppDataSource.transaction(async transactionalEntityManager => {
            const cursoEstudianteRepository = transactionalEntityManager.getRepository(CursoEstudiante); //estudiantes cursando
            const cursoRepository = transactionalEntityManager.getRepository(Curso);
           

           // Verificar si hay alumnos asociados al curso   
           const estudiantesAsignados = await cursoEstudianteRepository.count({ where: { curso: { id: Number(id) } } });
            console.log(`Número de estudiantes cursando el curso: ${estudiantesAsignados}`);
            
            if (estudiantesAsignados > 0) {
                throw new Error('Estudiante cursando materia, no se puede eliminar');
            }
            const curso = await cursoRepository.findOne({ where: { id: Number(id) } });
            if (!curso) {
                throw new Error('El curso no existe');
            }
            
            // Verificar si el curso existe
            
            const deleteResult = await cursoRepository.delete(id); 
            console.log(`Resultado de la eliminación: ${JSON.stringify(deleteResult)}`);
            if (deleteResult.affected === 1) {
            return res.json({ mensaje: 'Curso eliminado' }); 
            } else {
            throw new Error('Curso no encontrado');
        }   
    },
    );

    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(400).json({ mensaje: err.message });
        } else {
            res.status(400).json({ mensaje: 'Error' });
        }
    }
    }  
