# **Desarrollo de la Iteración 1: Gestión de Identidad y Configuración**

---

## **1. Objetivo General**
Establecer las bases técnicas y funcionales para la gestión de usuarios, roles y proyectos, permitiendo una configuración inicial del sistema que soporte la metodología Scrum adaptada al contexto académico de la Universidad La Salle. En esta iteración, **el docente asume el rol de administrador** para la gestión global del sistema.

---

## **2. Actores Involucrados**

### **2.1. Docente (Administrador)**
- **Rol:** Gestor global del sistema y configurador inicial de proyectos.
- **Responsabilidades:**
    - Crear, modificar y eliminar usuarios.
    - Asignar roles (Administrador, Scrum Master, Product Owner, Team Developer) a nivel de sistema y proyecto.
    - Configurar permisos y acceso.
    - Crear y gestionar proyectos académicos.
    - Definir fechas de inicio y fin para los proyectos.
    - Asignar estudiantes a proyectos con roles específicos.
- **Herramientas:** Panel de administración de usuarios, roles y proyectos.

### **2.2. Estudiantes (Equipo Scrum)**
- **Roles:**
    - **Scrum Master:** Facilita el proceso y gestiona impedimentos.
    - **Product Owner:** Gestiona el backlog del equipo.
    - **Team Developer:** Ejecuta tareas técnicas.
- **Responsabilidades:**
    - Participar en proyectos asignados.
    - Recibir permisos basados en su rol dentro del proyecto.

---

## **3. Requisitos Funcionales**

### **3.1. Gestión de Usuarios y Roles**
   **Código** | **Descripción**                                                                                     | **Prioridad** | **Criterios de Aceptación**                                                                                     |
 |------------|-----------------------------------------------------------------------------------------------------|---------------|-----------------------------------------------------------------------------------------------------------------|
| **RF1.1**  | El sistema debe permitir la creación, modificación y eliminación de usuarios.                       | Alta          | Validación de datos únicos (ej. correo electrónico). Soporte para recuperación de contraseñas.               |
| **RF1.2**  | El sistema debe soportar cuatro roles: Administrador, Scrum Master, Product Owner y Team Developer.   | Alta          | Los roles deben ser asignables a nivel de sistema y proyecto.                                                 |
| **RF1.3**  | El sistema debe permitir la asignación de roles a nivel de proyecto.                                | Alta          | Restricción de acceso según el rol asignado. Registro histórico de cambios de roles.                         |

### **3.2. Gestión de Proyectos**
| **Código** | **Descripción**                                                                                     | **Prioridad** | **Criterios de Aceptación**                                                                                     |
 |------------|-----------------------------------------------------------------------------------------------------|---------------|-----------------------------------------------------------------------------------------------------------------|
| **RF2.1**  | El sistema debe permitir la creación, modificación y eliminación de proyectos.                       | Alta          | Definición de nombre, descripción, fechas de inicio y fin. Validación de solapamiento de fechas.              |
| **RF2.2**  | El sistema debe permitir la asignación de estudiantes a proyectos con roles específicos.             | Alta          | Asignación de roles (Scrum Master, Product Owner, Team Developer) a cada estudiante en el proyecto.           |
| **RF2.3**  | El sistema debe permitir la definición de fechas de inicio y fin para los proyectos.                 | Alta          | Validación de que las fechas sean coherentes y no se superpongan con otros proyectos activos.                  |

### **3.3. Gestión de Historias de Usuario**
| **Código** | **Descripción**                                                                                     | **Prioridad** | **Criterios de Aceptación**                                                                                     |
 |------------|-----------------------------------------------------------------------------------------------------|---------------|-----------------------------------------------------------------------------------------------------------------|
| **RF4.1**  | El sistema debe permitir la creación, modificación y eliminación de historias de usuario.           | Alta          | Las historias de usuario deben poder ser priorizadas mediante un sistema de arrastre.                          |
| **RF4.2**  | El sistema debe permitir la definición de prioridades y criterios de aceptación para las historias.  | Alta          | Los criterios de aceptación deben ser definidos y asociados a cada historia de usuario.                         |

---

## **4. Requisitos No Funcionales**

### **4.1. Seguridad**
- Implementar autenticación segura (ej. contraseñas robustas, autenticación de dos factores opcional).
- Control de acceso basado en roles (RBAC) para proteger información sensible.

### **4.2. Usabilidad**
- Interfaz intuitiva para la gestión de usuarios y proyectos, accesible para usuarios sin experiencia previa.
- Soporte para dispositivos móviles y de escritorio.

### **4.3. Disponibilidad**
- El sistema debe estar disponible al menos el 99% del tiempo durante el período académico.

---
## **5. Historias de Usuario Desarrolladas en la Iteración 1**
| **Código HU** | **Descripción de la HU**                                                                                     | **RF Relacionados**                                                                                     |
 |---------------|-------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| **HU1**       | Como administrador, quiero crear, modificar y eliminar usuarios, así como asignarles roles.                | **RF1.1**, **RF1.2**, **RF1.3**                                                                         |
| **HU2**       | Como administrador, quiero crear proyectos, definir fechas y asignar estudiantes con roles específicos.     | **RF2.1**, **RF2.2**, **RF2.3**                                                                         |
| **HU3**       | Como Product Owner, quiero crear, modificar y priorizar historias de usuario.                              | **RF2.1**, **RF2.2**, **RF4.1**, **RF4.2**                                                              |

---
## **6. Historias de Usuario No Desarrolladas en la Iteración 1 (Contexto General)**
Estas HU están planeadas para iteraciones posteriores, pero es importante conocerlas para entender el alcance total del proyecto:
| **Código HU** | **Descripción de la HU**                                                                                     | **Iteración Asignada** |
|---------------|-------------------------------------------------------------------------------------------------------------|------------------------|
| **HU4**       | Como Scrum Master, quiero crear sprints y asignar historias de usuario a cada sprint.                        | Iteración 2            |
| **HU5**       | Como Team Developer, quiero crear, modificar y actualizar el estado de las tareas.                          | Iteración 2            |
| **HU6**       | Como miembro del equipo, quiero visualizar y actualizar tareas en un tablero Kanban.                        | Iteración 2            |
| **HU7**       | Como docente, quiero evaluar entregables con criterios predefinidos y proporcionar retroalimentación.        | Iteración 4            |
| **HU8**       | Como docente, quiero acceder a métricas y reportes de rendimiento del proyecto.                              | Iteración 3            |
| **HU9**       | Como usuario, quiero recibir notificaciones sobre cambios relevantes en los proyectos.                      | Iteración 3            |

---
## **7. Flujos de Trabajo (Workflows)**

### **7.1. Flujo de Creación de Usuarios**
1. El docente (administrador) accede al panel de gestión de usuarios.
2. Completa el formulario de creación de usuario (nombre, correo, contraseña, rol).
3. El sistema verifica la unicidad del correo y asigna el rol.
4. El usuario es creado y notificado por correo electrónico.

### **7.2. Flujo de Asignación de Roles**
1. El docente (administrador) accede al panel de gestión de proyectos.
2. Selecciona un proyecto y asigna roles a los estudiantes.
3. El sistema verifica que los roles asignados sean coherentes con el proyecto.
4. Los roles son asignados y notificados a los estudiantes.

### **7.3. Flujo de Creación de Proyectos**
1. El docente (administrador) accede al panel de proyectos.
2. Completa el formulario de creación (nombre, descripción, fechas, equipo).
3. El sistema verifica la coherencia de fechas y asignación de equipos.
4. El proyecto es creado y notificado al equipo.

---
## **8. Características Técnicas Generales**
- **Arquitectura:** Modelo de tres capas (cliente-servidor-aplicación).
- **Base de Datos:** Modelo relacional con soporte para transacciones y restricciones de integridad.
- **Seguridad:** Autenticación segura y control de acceso basado en roles (RBAC).
- **Validaciones:**
    - Datos únicos (correos electrónicos, nombres de proyectos).
    - Coherencia temporal (fechas de proyectos y sprints no superpuestas).
    - Permisos: Acceso restringido según el rol asignado.
- **Notificaciones:**
    - Envío de correos electrónicos para:
        - Creación de usuarios.
        - Asignación de roles y proyectos.
        - Cambios en el estado de los proyectos.

### **9. Consideraciones Adicionales**
- Para la conexion de base de datos usar la siguiente documentacion [PostgreSQL en Bunjs](https://bun.com/docs/guides/ecosystem/prisma-postgres#use-prisma-postgres-with-bun)

- Para el hasheo de contraseñas usar la funcion de bunjs [Hash Bun](https://bun.com/docs/guides/util/hash-a-password)

- Para la conexion a la base de datos usar el usuario: postgres, password: [123456]