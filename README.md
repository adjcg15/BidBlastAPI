# BidBlast API

**BidBlast API** es parte del proyecto BidBlast: un proyecto escolar que está estructurado por tres componentes,
una aplicación de servicios API REST, un cliente Android Java y un cliente de escritorio JavaFX. El proyecto aquí 
presente es el componente de servicios, la API REST.

## Configuración local del proyecto

### Variables de entorno

El archivo `.env.template` ubicado en la raíz del proyecto, contiene la lista de variables de entorno 
necesarias para que la aplicación funcione correctamente. Previo a levantar la aplicación, deberá hacer una copia 
de dicho archivo y renombrarla `.env` e igualmente ubicarla en la raíz del proyecto. Una vez realizado esto, deberá
agregar los valores adecuados para cada variable dentro del archivo `.env`.

### Ambiente de desarrollo

Una vez establecidas las variables de entorno, deberá instalar las dependencias necesarias:

```npm install```

Con las dependencias del proyecto instaladas, abra una terminal en la raíz del proyecto y ejecute el comando:

```npm run dev```

Esto levantará el servidor en modo de desarrollo, por lo que cada cambio realizado a los archivos del proyecto
hará un refresh automático al servidor y se verá reflejado al instante en el servidor levantado.

## Estándar de código

Antes de escribir código, tome en cuenta que todo el código del proyecto deberá seguir el [estándar de codificación asociado](https://uvmx-my.sharepoint.com/:w:/g/personal/zs21013846_estudiantes_uv_mx/EfrRLZplLZpKjU6BFQ3QdkMBcUVW96WkjzEwCqv48AQPNg?e=m7MDfj).

## Control de versiones

Todos los nombrados descritos en esta sección, a pesar de estar explicados en español, deberán hacerse
en inglés en la práctica.

### Nombrado de commits

Cada commit deberá estar nombrado siguiendo la siguiente especificación:

```tag(archivo o módulo afectado): descripción extendida de lo que realiza el commit```

El `tag` es una etiqueta estandar definida por los colaboradores:

* `feat`: indica que el commit está incluyendo un `feature` o funcionalidad nueva.
* `config`: indica que el commit está cambiando algún archivo de configuración, instaló alguna biblioteca 
para el proyecto o cambió la estructura de organización de algún módulo o carpeta.
* `fix`: indica que el commit está realizando un cambio sobre alguna funcionalidad existente, ya sea para resolver
un bug, cambiar la lógica o mejorar el rendimiento.
* `docs`: indica que el commit está realizando un cambio en documentos del repositorio fuera del código, como 
el archivo md README que se encuentra leyendo.
* `revert`: reversión a un commit anterior.
* `test`: indica que el commit agrega, corrige o elimina una prueba unitaria del proyecto

Tome en cuenta que la _descripción extendida de lo que realiza el commit_ debe estar escrita desde el punto de vista
de este. Ejemplo:

`feat(app.ts): implements call to AuthRouter and exposes its services`

Note cómo se usan las palabras "implements" y "exposes" para indicar que el commit está realizando o implementando
esto. Un mal nombrado de un commit sería violando esta regla. Ejemplo:

`feat(app.ts): implementation of AuthRouter exposition of services`

### Nombrado de pull requests (PR)

Cada PR deberá estar nombrado siguiendo la siguiente especificación:

```TAG: nombre representativo de lo que se incluye```

El `tag` cumple una función parecida al `tag` de un commit, pues indica el tipo de PR que se realiza, sin embargo, en este
caso hay cinco posibles opciones: `FEAT`, `FIX` `CONFIG`, `DOCS` y `TEST`. Se espera que habiendo explicado sus significados
para un commit, el lector pueda intuir sus significados en un PR.

En este caso, el _nombre representativo de lo que se incuye_ en el PR, **no** debe estar escrito como en el commit, es decir, 
"desde su punto de vista". En este caso, sí debe colocarse de la forma:

```FEAT: implementation of login endpoint```

En lugar de:

```FEAT: implements login endpoint```

Tome en cuenta que un PR es un "hito", trate de describir ese hito. 

### Nombrado de ramas

Se recomienda que, para llevar una mejor organización de las ramas, estas se nombren de la siguiente forma:

```referencia-caso-uso/tag/descripcion```

Por ejemplo, si el caso de uso es "Evaluar artículo para subastar" y se desea implementar un `feature` que englobe la 
construcción de un endpoint asociado, un nombre recomendable sería:

```auction-evaluation/feat/endpoint-descriptive-name```

Mientras que un nombre no recomendado sería:

```endpoint_name```

## Base de datos

Los archivos de configuración de la base de datos (scripts) se encuentran adjuntos en la carpeta `db`
ubicada en la raíz del proyecto. 

El archivo `bidblast_main.sql` es el modelo de base de datos inicial.

El archivo `bidblast_users.sql` incluye un ejemplo de la creación de un usuario para la base de datos. Es
recomendable no utilizar la contraseña tal como la muestra el ejemplo.

El archivo `bidblast_seed.sql` incluye una lista de sentencias SQL para dotar a la base de datos con 
información de prueba. Tenga mucho cuidado, pues este script borra todos los registros que se encuentren
dentro de la base de datos.

La carpeta `stored_procedures` incluye todos los procedimientos almacenados necesarios para
ejecutar las operaciones de los endpoints de forma exitosa. Se recomienda nombrarlos de la forma `sp_nombre_procedimiento`.

## Swagger

La API está documentada utilizando Swagger. Para que la API pueda correr de forma correcta,
previo a la ejecución de cualquir comando que levanta el servidor, como `npm run dev`, se debe generar el archivo `swagger-output.json`.
Para ello, se debe ejecutar el comando `npm run swagger`.

Una vez que se haya generado el archivo previamente mencionado dentro de la carpeta `src` tras ejecutar el comando, no será necesario
ejecutarlo nuevamente cada vez que se desee levantar el servidor con `npm run dev` o cualquier comando similar.
El único escenario en el que se deberá ejecutar nuevamente será si se quiere actualizar la documentación de Swagger. Esto usualmente pasará
cuando se cambie el archivo `swagger-build.js` o cuando se agreguen comentarios de Swagger en algún controlador o ruta.

Es importante mencionar que para esta implementación se utilizó la bibloteca `swagger-autogen`, por lo que el uso
de Swagger en este proyecto está regido por la [documentación de dicha biblioteca](https://swagger-autogen.github.io/docs/).